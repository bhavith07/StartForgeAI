const OVERPASS_URL = "https://api.overpass.ch/v1/interpreter";

const CATEGORY_TAGS = {
  restaurant: [
    ["amenity", "restaurant"],
    ["amenity", "fast_food"],
  ],
  cafe: [["amenity", "cafe"]],
  hotel: [
    ["tourism", "hotel"],
    ["tourism", "guest_house"],
    ["tourism", "hostel"],
  ],
  grocery: [
    ["shop", "supermarket"],
    ["shop", "convenience"],
  ],
  supermarket: [["shop", "supermarket"]],
  clothing: [["shop", "clothes"]],
  pharmacy: [["amenity", "pharmacy"]],
  gym: [
    ["leisure", "fitness_centre"],
    ["leisure", "sports_centre"],
  ],
  school: [["amenity", "school"]],
  college: [
    ["amenity", "college"],
    ["amenity", "university"],
  ],
  coaching: [
    ["amenity", "school"],
    ["office", "educational_institution"],
  ],
  hospital: [
    ["amenity", "hospital"],
    ["amenity", "clinic"],
  ],
  salon: [
    ["shop", "hairdresser"],
    ["shop", "beauty"],
  ],
  electronics: [["shop", "electronics"]],
  bakery: [["shop", "bakery"]],
  furniture: [["shop", "furniture"]],
  coworking: [["office", "coworking"]],
  "technology companies": [["office", "it"], ["office", "software"], ["office", "telecommunication"], ["office", "technology"], ["office", "computer"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "telecommunication"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
  "tech companies": [["office", "it"], ["office", "software"], ["office", "telecommunication"], ["office", "technology"], ["office", "computer"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "telecommunication"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
  "software companies": [["office", "it"], ["office", "software"], ["office", "technology"], ["office", "computer"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
  "software company": [["office", "it"], ["office", "software"], ["office", "technology"], ["office", "computer"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
  "it companies": [["office", "it"], ["office", "software"], ["office", "technology"], ["office", "computer"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "telecommunication"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
  "it company": [["office", "it"], ["office", "software"], ["office", "technology"], ["office", "computer"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
  "ai companies": [["office", "it"], ["office", "software"], ["office", "technology"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
  "ai startups": [["office", "it"], ["office", "software"], ["office", "technology"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
  "tech startups": [["office", "it"], ["office", "software"], ["office", "technology"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
  startups: [["office", "it"], ["office", "software"], ["office", "technology"], ["company", "it"], ["company", "software"], ["company", "software_development"], ["company", "startup"], ["company:startup", "yes"], ["name", "startup"]],
};

const CACHE_TTL_MS = 15 * 60 * 1000;
const MIN_REQUEST_INTERVAL_MS = 2000;
const DEFAULT_RETRY_AFTER_SECONDS = 60;
const REQUEST_TIMEOUT_MS = 55000;
const MAX_RESULTS = 100;
const MAX_CACHE_ENTRIES = 250;

const resultCache = new Map();
const inFlightRequests = new Map();

let lastRequestAt = 0;
let blockedUntil = 0;
let requestQueue = Promise.resolve();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeHttpError(message, status, extra = {}) {
  const error = new Error(message);
  error.status = status;
  Object.assign(error, extra);
  return error;
}

function parseRetryAfter(value) {
  if (!value) return DEFAULT_RETRY_AFTER_SECONDS;

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.ceil(seconds);
  }

  const retryDate = Date.parse(value);

  if (Number.isFinite(retryDate)) {
    return Math.max(
      1,
      Math.ceil((retryDate - Date.now()) / 1000)
    );
  }

  return DEFAULT_RETRY_AFTER_SECONDS;
}

function escapeOverpassRegex(value) {
  const cleaned = String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/["\\]/g, "")
    .trim()
    .slice(0, 80);

  return cleaned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTagFilters(category) {
  const normalized = String(category || "")
    .trim()
    .toLowerCase();

  const known = CATEGORY_TAGS[normalized];

  if (known) return known;

  // Custom categories are matched against mapped business names.
  const safe = escapeOverpassRegex(normalized);

  if (!safe) {
    throw makeHttpError(
      "Choose a valid business category to search for.",
      400
    );
  }

  return [["name", safe]];
}

function buildQuery(latitude, longitude, radiusMeters, filters) {
  const clauses = filters
    .map(([key, value]) => {
      if (key === "name") {
        return `nwr(around:${radiusMeters},${latitude},${longitude})["name"~"${value}",i];`;
      }

      return `nwr(around:${radiusMeters},${latitude},${longitude})["${key}"="${value}"];`;
    })
    .join("\n");

  return `[out:json][timeout:50];
(
${clauses}
);
out center tags;`;
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180;

  const earthRadius = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

function normalizeElement(element, origin) {
  const tags = element.tags || {};

  const latitude = Number(
    element.lat ?? element.center?.lat
  );

  const longitude = Number(
    element.lon ?? element.center?.lon
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  // Ignore records without a useful business name.
  const name =
    tags.name ||
    tags.brand ||
    tags.operator;

  if (!name) return null;

  const distanceMeters = haversineMeters(
    origin.latitude,
    origin.longitude,
    latitude,
    longitude
  );

  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"] ||
      tags["addr:town"] ||
      tags["addr:village"],
    tags["addr:postcode"],
  ].filter(Boolean);

  const osmId = `${element.type}/${element.id}`;

  const category =
    tags.amenity ||
    tags.shop ||
    tags.leisure ||
    tags.tourism ||
    tags.office ||
    tags.healthcare ||
    "business";

  return {
    osmId,

    name,

    category: String(category).replaceAll("_", " "),

    address: addressParts.join(", ") || null,

    latitude,

    longitude,

    distanceMeters: Math.round(distanceMeters),

    website:
      tags.website ||
      tags["contact:website"] ||
      null,

    phone:
      tags.phone ||
      tags["contact:phone"] ||
      null,

    openingHours:
      tags.opening_hours ||
      null,

    source: "OpenStreetMap",

    sourceUrl: `https://www.openstreetmap.org/${osmId}`,
  };
}

async function sendOverpassQuery(query, apiKey) {
  const response = await fetch(OVERPASS_URL, {
    method: "POST",

    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded;charset=UTF-8",

      Accept: "application/json",

      "X-API-Key": apiKey,

      "User-Agent":
        process.env.OVERPASS_USER_AGENT ||
        "StartForgeAI/1.0 (+https://github.com/bhavith07/StartForgeAI)",
    },

    body: new URLSearchParams({
      data: query,
    }),

    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // Handle rate limiting.
  if (response.status === 429) {
    const retryAfterSeconds = parseRetryAfter(
      response.headers.get("retry-after")
    );

    blockedUntil =
      Date.now() + retryAfterSeconds * 1000;

    throw makeHttpError(
      `Your Overpass hosted API plan is rate-limited. Please wait about ${retryAfterSeconds} seconds before trying again.`,
      429,
      { retryAfterSeconds }
    );
  }

  // Handle authentication errors.
  if (
    response.status === 401 ||
    response.status === 403
  ) {
    throw makeHttpError(
      "Overpass authentication failed. Check OVERPASS_API_KEY in backend/.env and confirm the key is active.",
      response.status
    );
  }

  // Handle other HTTP errors.
  if (!response.ok) {
    const detail = await response.text().catch(() => "");

    throw makeHttpError(
      `Hosted Overpass service returned HTTP ${response.status}.${detail ? ` ${detail.slice(0, 220)}` : ""}`,
      response.status
    );
  }

  const payload = await response.json();

  // Overpass can return errors inside a successful response.
  if (payload.remark) {
    throw makeHttpError(
      `Overpass could not complete the query: ${String(payload.remark).slice(0, 220)}`,
      502
    );
  }

  if (!Array.isArray(payload.elements)) {
    throw makeHttpError(
      "Overpass returned an unexpected response format.",
      502
    );
  }

  return payload;
}

function cacheResult(key, value) {
  resultCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  if (resultCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = resultCache.keys().next().value;
    resultCache.delete(oldestKey);
  }
}

function enqueueQuery(query, apiKey) {
  const task = requestQueue.then(async () => {
    const remainingCooldown =
      blockedUntil - Date.now();

    if (remainingCooldown > 0) {
      throw makeHttpError(
        `Overpass is cooling down after a rate limit. Please wait about ${Math.ceil(remainingCooldown / 1000)} seconds.`,
        429,
        {
          retryAfterSeconds: Math.ceil(
            remainingCooldown / 1000
          ),
        }
      );
    }

    const elapsed = Date.now() - lastRequestAt;

    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await wait(
        MIN_REQUEST_INTERVAL_MS - elapsed
      );
    }

    // Only one upstream query at a time.
    lastRequestAt = Date.now();

    return sendOverpassQuery(query, apiKey);
  });

  requestQueue = task.catch(() => {});

  return task;
}

async function performSearch({
  latitude,
  longitude,
  radiusMeters,
  category,
  apiKey,
}) {
  const filters = buildTagFilters(category);

  const query = buildQuery(
    latitude,
    longitude,
    radiusMeters,
    filters
  );

  const payload = await enqueueQuery(query, apiKey);

  const results = payload.elements
    .map((element) =>
      normalizeElement(element, {
        latitude,
        longitude,
      })
    )
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.distanceMeters - b.distanceMeters
    )
    .slice(0, MAX_RESULTS);

  return {
    results,

    returnedCount: results.length,

    provider: "OpenStreetMap via overpass.ch",

    attribution: "© OpenStreetMap contributors",

    attributionUrl:
      "https://www.openstreetmap.org/copyright",

    dataTimestamp:
      payload.osm3s?.timestamp_osm_base || null,

    dataNotice:
      "OpenStreetMap community data may be incomplete. Ratings and customer reviews are not included.",
  };
}

export async function searchOverpass({
  latitude,
  longitude,
  radiusMeters,
  category,
}) {
  const apiKey = String(
    process.env.OVERPASS_API_KEY || ""
  ).trim();

  if (!apiKey) {
    throw makeHttpError(
      "OVERPASS_API_KEY is missing. Add your overpass.ch API key to backend/.env and restart the backend.",
      500
    );
  }

  const lat = Number(latitude);
  const lon = Number(longitude);
  const radius = Number(radiusMeters);

  const cleanCategory = String(category || "").trim();

  // Validate coordinates.
  if (
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    !Number.isFinite(lon) ||
    lon < -180 ||
    lon > 180
  ) {
    throw makeHttpError(
      "The location coordinates are invalid.",
      400
    );
  }

  // Validate supported search radii.
  if (
    ![500, 1000, 2000, 3000, 5000, 10000].includes(radius)
  ) {
    throw makeHttpError(
      "Choose a supported search radius.",
      400
    );
  }

  if (
    !cleanCategory ||
    cleanCategory.length > 80
  ) {
    throw makeHttpError(
      "Enter a business category between 1 and 80 characters.",
      400
    );
  }

  const cacheKey =
    `${lat.toFixed(5)}|${lon.toFixed(5)}|${radius}|${cleanCategory.toLowerCase()}`;

  // Return cached results when available.
  const cached = resultCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    console.log(
      "[Competitors] Returning cached Overpass results."
    );

    return cached.value;
  }

  if (cached) {
    resultCache.delete(cacheKey);
  }

  // Avoid duplicate simultaneous searches.
  const existingRequest =
    inFlightRequests.get(cacheKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = performSearch({
    latitude: lat,
    longitude: lon,
    radiusMeters: radius,
    category: cleanCategory,
    apiKey,
  })
    .then((result) => {
      cacheResult(cacheKey, result);
      return result;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, request);

  return request;
}

export { haversineMeters };
