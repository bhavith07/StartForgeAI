const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_PRIMARY = "https://overpass-api.de/api/interpreter";
const OVERPASS_BACKUP = "https://overpass.kumi.systems/api/interpreter";

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

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
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
    throw new Error(`Location lookup failed with HTTP ${response.status}. Please try again.`);
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
  };
}

function buildOverpassQuery(latitude, longitude, radius, industry) {
  const selector = getIndustrySelector(industry);
  // Start with the lightweight node-only query that was verified manually.
  return `[out:json][timeout:20];node(around:${radius},${latitude},${longitude})${selector}["name"];out 20;`;
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

async function requestOverpass(endpoint, query) {
  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "StartForgeAI/1.0 (competitor research)",
      "Accept": "application/json",
    },
    body: `data=${encodeURIComponent(query)}`,
  }, 25000);

  if (!response.ok) {
    const error = new Error(`OpenStreetMap search returned HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return Array.isArray(data.elements) ? data.elements : [];
}

async function queryOverpass(query) {
  // Use the endpoint confirmed working by the manual PowerShell test.
  const body = new URLSearchParams({ data: query }).toString();
  const response = await fetchWithTimeout(OVERPASS_PRIMARY, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "StartForgeAI/1.0 (competitor research)",
      "Accept": "application/json",
    },
    body,
  }, 30000);

  if (!response.ok) {
    throw new Error(`OpenStreetMap search returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.elements) ? data.elements : [];
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
    .slice(0, 60);

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
