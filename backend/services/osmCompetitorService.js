const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const INDUSTRY_TAGS = {
  food: [
    ['["amenity"~"restaurant|cafe|fast_food|food_court|bar|pub"]'],
    ['["shop"~"bakery|confectionery|supermarket|convenience|greengrocer"]'],
  ],
  restaurant: [
    ['["amenity"~"restaurant|fast_food|food_court"]'],
  ],
  cafe: [
    ['["amenity"="cafe"]'],
  ],
  retail: [
    ['["shop"]'],
  ],
  ecommerce: [
    ['["shop"]'],
  ],
  education: [
    ['["amenity"~"school|college|university|training"]'],
    ['["office"="educational_institution"]'],
  ],
  healthcare: [
    ['["amenity"~"hospital|clinic|doctors|dentist|pharmacy"]'],
    ['["healthcare"]'],
  ],
  fitness: [
    ['["leisure"~"fitness_centre|sports_centre"]'],
    ['["sport"]'],
  ],
  beauty: [
    ['["shop"~"beauty|hairdresser|cosmetics"]'],
    ['["craft"="beauty"]'],
  ],
  technology: [
    ['["office"~"it|company|software"]'],
    ['["shop"~"computer|electronics|mobile_phone"]'],
  ],
  services: [
    ['["office"]'],
    ['["craft"]'],
  ],
  general: [
    ['["shop"]'],
    ['["amenity"~"restaurant|cafe|clinic|school|bank|fuel|marketplace"]'],
    ['["office"="company"]'],
  ],
};

function normalizeIndustry(industry = "") {
  const value = industry.toLowerCase();
  if (/food|beverage|restaurant|cafe|café|bakery/.test(value)) return "food";
  if (/e.?commerce|retail|shopping/.test(value)) return "retail";
  if (/education|learning|school|training/.test(value)) return "education";
  if (/health|medical|hospital|clinic|pharma/.test(value)) return "healthcare";
  if (/fitness|gym|sport/.test(value)) return "fitness";
  if (/beauty|salon|cosmetic/.test(value)) return "beauty";
  if (/technology|software|information technology|it services|computer/.test(value)) return "technology";
  if (/restaurant/.test(value)) return "restaurant";
  if (/cafe|café/.test(value)) return "cafe";
  if (/service|consult/.test(value)) return "services";
  return "general";
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function geocodeLocation(location) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", location);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "StartForgeAI/1.0 (competitor research feature)",
      "Accept": "application/json",
    },
  }, 15000);

  if (!response.ok) {
    throw new Error("Location lookup is temporarily unavailable. Please try again.");
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    const error = new Error("We couldn't find that location. Try a city, town or area name.");
    error.status = 404;
    throw error;
  }

  const place = results[0];
  return {
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    displayName: place.display_name,
    boundingBox: place.boundingbox,
  };
}

function buildOverpassQuery(latitude, longitude, radius, industry) {
  const key = normalizeIndustry(industry);
  const selectors = INDUSTRY_TAGS[key] || INDUSTRY_TAGS.general;
  const clauses = selectors.flat().map((selector) =>
    `nwr(around:${radius},${latitude},${longitude})["name"]${selector};`
  );

  return `[out:json][timeout:45];( ${clauses.join(" ")} );out center tags 80;`;
}

function toBusiness(element) {
  const tags = element.tags || {};
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (!tags.name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
    tags["addr:postcode"],
  ].filter(Boolean);

  const category =
    tags.amenity ||
    tags.shop ||
    tags.office ||
    tags.healthcare ||
    tags.leisure ||
    tags.craft ||
    tags.tourism ||
    "business";

  return {
    id: `${element.type}/${element.id}`,
    name: tags.name,
    category: String(category).replaceAll("_", " "),
    address: addressParts.join(", ") || null,
    latitude,
    longitude,
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    openingHours: tags.opening_hours || null,
    rating: null,
    reviewCount: null,
    source: "OpenStreetMap",
    mapUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
  };
}

async function queryOverpass(query) {
  let lastError;

  for (const endpoint of OVERPASS_URLS) {
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "StartForgeAI/1.0",
          "Accept": "application/json",
        },
        body: new URLSearchParams({ data: query }).toString(),
      });

      if (!response.ok) {
        lastError = new Error(`OpenStreetMap search returned status ${response.status}`);
        continue;
      }

      const data = await response.json();
      return Array.isArray(data.elements) ? data.elements : [];
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error("The OpenStreetMap search took too long. Please try a smaller radius, such as 3 km or 5 km.");
  }
  throw lastError || new Error("Competitor search is temporarily unavailable.");
}

export async function searchOpenStreetMapCompetitors({ industry, location, radius = 5000 }) {
  const place = await geocodeLocation(location);
  const query = buildOverpassQuery(
    place.latitude,
    place.longitude,
    radius,
    industry
  );

  const elements = await queryOverpass(query);
  const seen = new Set();

  const businesses = elements
    .map(toBusiness)
    .filter(Boolean)
    .filter((business) => {
      if (seen.has(business.id)) return false;
      seen.add(business.id);
      return true;
    })
    .slice(0, 80);

  return {
    location: place.displayName,
    coordinates: {
      latitude: place.latitude,
      longitude: place.longitude,
    },
    radius,
    industry,
    total: businesses.length,
    businesses,
    dataNotice: "Results are based on OpenStreetMap community data. Coverage may be incomplete. Ratings and customer reviews are not provided by this search.",
  };
}
