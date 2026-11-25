const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_REQUEST_INTERVAL_MS = 1100;
const cache = new Map();
let lastRequestAt = 0;
let requestQueue = Promise.resolve();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scheduleNominatimRequest(url) {
  const task = requestQueue.then(async () => {
    const elapsed = Date.now() - lastRequestAt;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await wait(MIN_REQUEST_INTERVAL_MS - elapsed);
    }

    lastRequestAt = Date.now();
    const response = await fetch(url, {
      headers: {
        "User-Agent": process.env.NOMINATIM_USER_AGENT || "StartForgeAI/1.0 (competitor discovery)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`Location lookup service returned ${response.status}.`);
    }

    return response.json();
  });

  requestQueue = task.catch(() => {});
  return task;
}

export async function geocodeLocation(location) {
  const normalized = String(location || "").trim();
  if (normalized.length < 2 || normalized.length > 160) {
    throw new Error("Enter a valid city, area or address (2–160 characters)." );
  }

  const key = normalized.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", normalized);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const results = await scheduleNominatimRequest(url);
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("We couldn't find that location. Try a nearby city or a more specific area.");
  }

  const result = {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
    displayName: results[0].display_name,
  };

  if (!Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
    throw new Error("The location service returned invalid coordinates.");
  }

  cache.set(key, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}
