const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const PHOTON_URL = "https://photon.komoot.io/api/";
const geocodeCache = new Map();
const competitorCache = new Map();

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const INDUSTRY_FILTERS = [
  { pattern: /restaurant|food|beverage|cafe|café|bakery/, selector: '["amenity"~"restaurant|cafe|fast_food|food_court"]' },
  { pattern: /education|learning|school|college|training/, selector: '["amenity"~"school|college|university|training"]' },
  { pattern: /health|medical|hospital|clinic|pharma/, selector: '["amenity"~"hospital|clinic|doctors|dentist|pharmacy"]' },
  { pattern: /fitness|gym|sport/, selector: '["leisure"~"fitness_centre|sports_centre"]' },
  { pattern: /beauty|salon|cosmetic/, selector: '["shop"~"beauty|hairdresser|cosmetics"]' },
  { pattern: /technology|software|information technology|it services|computer/, selector: '["shop"~"computer|electronics|mobile_phone"]' },
  { pattern: /retail|shopping|e.?commerce/, selector: '["shop"]' },
  { pattern: /service|consult/, selector: '["office"]' },
];

function getIndustrySelector(industry = "") {
  const normalized = industry.toLowerCase().trim();
  const match = INDUSTRY_FILTERS.find((item) => item.pattern.test(normalized));
  return match?.selector || '["shop"]';
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function geocodeLocation(location) {
  const cacheKey = location.toLowerCase().trim();
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.place;

  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", location);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");

    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "StartForgeAI/1.0 (competitor research feature)",
        "Accept": "application/json",
      },
    }, 15000);

    if (!response.ok) {
      throw new Error(`Nominatim returned HTTP ${response.status}`);
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
      throw new Error("Nominatim did not find this location.");
    }

    const result = results[0];
    const place = {
      latitude: Number(result.lat),
      longitude: Number(result.lon),
      displayName: result.display_name,
    };
    geocodeCache.set(cacheKey, { place, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    return place;
  } catch (nominatimError) {
    console.warn("[Competitors] Nominatim unavailable; trying Photon geocoding:", nominatimError.message);
    const url = new URL(PHOTON_URL);
    url.searchParams.set("q", location);
    url.searchParams.set("limit", "1");
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "StartForgeAI/1.0 (competitor research feature)",
        "Accept": "application/geo+json, application/json",
      },
    }, 10000);

    if (!response.ok) {
      throw new Error("We couldn't look up that location. Please check the city or area name and try again.");
    }

    const data = await response.json();
    const feature = data.features?.[0];
    const coordinates = feature?.geometry?.coordinates;
    if (!coordinates || !Number.isFinite(Number(coordinates[0])) || !Number.isFinite(Number(coordinates[1]))) {
      const error = new Error("We couldn't find that location. Try a city, town or area name.");
      error.status = 404;
      throw error;
    }

    const properties = feature.properties || {};
    const displayName = [
      properties.name,
      properties.city,
      properties.state,
      properties.country,
    ].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index).join(", ");
    const place = {
      longitude: Number(coordinates[0]),
      latitude: Number(coordinates[1]),
      displayName: displayName || location,
    };
    geocodeCache.set(cacheKey, { place, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    return place;
  }
}

function buildOverpassQuery(latitude, longitude, radius, industry) {
  const normalized = industry.toLowerCase().trim();
  const selector = /restaurant/.test(normalized)
    ? '["amenity"="restaurant"]'
    : getIndustrySelector(industry);
  return `[out:json][timeout:20];node(around:${radius},${latitude},${longitude})${selector}["name"];out 40;`;
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
    tags.amenity || tags.shop || tags.office || tags.healthcare ||
    tags.leisure || tags.craft || tags.tourism || "business";

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
  const body = new URLSearchParams({ data: query }).toString();
  const failures = [];

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log("[Competitors] Trying Overpass endpoint:", endpoint);
      const response = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "StartForgeAI/1.0 (competitor research)",
          "Accept": "application/json",
        },
        body,
      }, 10000);

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        const message = `HTTP ${response.status}${detail ? ": " + detail.slice(0, 140) : ""}`;
        failures.push(`${endpoint} -> ${message}`);
        console.warn("[Competitors] Overpass endpoint failed:", message);
        if (response.status === 429 || response.status >= 500) continue;
        throw new Error(`OpenStreetMap search failed: ${message}`);
      }

      const data = await response.json();
      return {
        elements: Array.isArray(data.elements) ? data.elements : [],
        provider: "Overpass API",
      };
    } catch (error) {
      failures.push(`${endpoint} -> ${error.message}`);
      console.warn("[Competitors] Overpass endpoint request failed:", error.message);
    }
  }

  const error = new Error("All public Overpass endpoints failed.");
  error.failures = failures;
  throw error;
}

function distanceInMeters(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function photonFeatureToBusiness(feature, index) {
  const properties = feature?.properties || {};
  const coordinates = feature?.geometry?.coordinates;
  const longitude = Number(coordinates?.[0]);
  const latitude = Number(coordinates?.[1]);
  const name = properties.name || properties["name:en"];

  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const addressParts = [
    properties.housenumber,
    properties.street,
    properties.district,
    properties.city,
    properties.state,
  ].filter(Boolean);

  const osmType = properties.osm_type;
  const osmId = properties.osm_id;
  const osmPath = osmType && osmId
    ? `${osmType === "N" ? "node" : osmType === "W" ? "way" : "relation"}/${osmId}`
    : null;

  return {
    id: osmPath || `photon/${properties.osm_key || "place"}/${properties.osm_value || index}/${latitude}/${longitude}`,
    name,
    category: String(properties.osm_value || properties.type || properties.osm_key || "business").replaceAll("_", " "),
    address: addressParts.join(", ") || null,
    latitude,
    longitude,
    phone: null,
    website: null,
    openingHours: null,
    rating: null,
    reviewCount: null,
    source: "OpenStreetMap via Photon",
    mapUrl: osmPath
      ? `https://www.openstreetmap.org/${osmPath}`
      : `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`,
  };
}

async function searchWithPhoton({ industry, place, radius }) {
  const url = new URL(PHOTON_URL);
  url.searchParams.set("q", industry);
  url.searchParams.set("lat", String(place.latitude));
  url.searchParams.set("lon", String(place.longitude));
  url.searchParams.set("zoom", "14");
  url.searchParams.set("limit", "50");
  url.searchParams.set("lang", "en");

  console.log("[Competitors] Falling back to Photon:", url.toString());
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "StartForgeAI/1.0 (competitor research feature)",
      "Accept": "application/geo+json, application/json",
    },
  }, 12000);

  if (!response.ok) {
    throw new Error(`Photon search returned HTTP ${response.status}.`);
  }

  const data = await response.json();
  const features = Array.isArray(data.features) ? data.features : [];
  const businesses = features
    .map(photonFeatureToBusiness)
    .filter(Boolean)
    .filter((business) =>
      distanceInMeters(
        place.latitude,
        place.longitude,
        business.latitude,
        business.longitude
      ) <= radius
    );

  return {
    businesses,
    provider: "Photon",
  };
}

function uniqueBusinesses(items) {
  const seen = new Set();
  return items.filter((business) => {
    if (!business) return false;
    const key = business.id || `${business.name.toLowerCase()}:${business.latitude}:${business.longitude}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 60);
}

export async function searchOpenStreetMapCompetitors({ industry, location, radius = 5000 }) {
  const cacheKey = `${industry.toLowerCase().trim()}|${location.toLowerCase().trim()}|${radius}`;
  const cached = competitorCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    console.log("[Competitors] Returning cached competitor results.");
    return cached.result;
  }

  console.log("[Competitors] Geocoding location:", location);
  const place = await geocodeLocation(location);
  console.log("[Competitors] Geocoded:", place.latitude, place.longitude);

  let businesses = [];
  let provider = "Overpass API";
  let fallbackUsed = false;
  const query = buildOverpassQuery(
    place.latitude,
    place.longitude,
    radius,
    industry
  );

  try {
    console.log("[Competitors] Querying Overpass:", industry, radius);
    const result = await queryOverpass(query);
    businesses = result.elements.map(toBusiness).filter(Boolean);
    provider = result.provider;
    console.log("[Competitors] Overpass returned:", businesses.length, "businesses");
  } catch (overpassError) {
    console.warn("[Competitors] Overpass unavailable; trying Photon fallback.");
    try {
      const result = await searchWithPhoton({ industry, place, radius });
      businesses = result.businesses;
      provider = result.provider;
      fallbackUsed = true;
      console.log("[Competitors] Photon returned:", businesses.length, "businesses");
    } catch (photonError) {
      console.error("[Competitors] Photon fallback failed:", photonError.message);
      const error = new Error(
        "Competitor search is temporarily unavailable. Please try again later. " +
        "The free OpenStreetMap search providers did not respond."
      );
      error.status = 502;
      error.details = {
        overpass: overpassError.failures || [overpassError.message],
        photon: photonError.message,
      };
      throw error;
    }
  }

  const unique = uniqueBusinesses(businesses);

  const result = {
    location: place.displayName,
    coordinates: {
      latitude: place.latitude,
      longitude: place.longitude,
    },
    radius,
    industry,
    total: unique.length,
    businesses: unique,
    provider,
    fallbackUsed,
    dataNotice: fallbackUsed
      ? "Overpass was unavailable, so these are limited search matches from Photon using OpenStreetMap data. They are not a complete list of nearby competitors. Coverage may be incomplete; ratings and customer reviews are not provided."
      : "Results are based on OpenStreetMap community data. Coverage may be incomplete. Ratings and customer reviews are not provided by this search.",
  };

  competitorCache.set(cacheKey, { result, expiresAt: Date.now() + 15 * 60 * 1000 });
  if (competitorCache.size > 300) {
    const oldestKey = competitorCache.keys().next().value;
    competitorCache.delete(oldestKey);
  }
  return result;
}
