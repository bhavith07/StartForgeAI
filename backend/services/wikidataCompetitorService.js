const WIKIDATA_QUERY_URL = "https://query.wikidata.org/sparql";
const REQUEST_TIMEOUT_MS = 18000;
const MAX_RESULTS = 50;
const CACHE_TTL_MS = 60 * 60 * 1000;
const resultCache = new Map();

const TECH_CATEGORY_PATTERN = /tech|software|information technology|\bit\b|computer|startup|artificial intelligence|\bai\b|telecom|fintech|saas|digital product/i;

export function isTechnologyCompetitorCategory(category = "") {
  return TECH_CATEGORY_PATTERN.test(String(category));
}

function parseWikidataCoordinate(value) {
  const match = String(value || "").match(/Point\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!match) return null;

  const longitude = Number(match[1]);
  const latitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function bindingValue(binding, key) {
  return binding?.[key]?.value || null;
}

function toCompetitor(binding) {
  const id = bindingValue(binding, "company")?.split("/").pop();
  const name = bindingValue(binding, "companyLabel");
  const coordinates = parseWikidataCoordinate(bindingValue(binding, "coordinates"));
  if (!id || !name || !coordinates) return null;

  const distanceKm = Number(bindingValue(binding, "distance"));
  return {
    wikidataId: id,
    name,
    category: "technology company or startup",
    description: bindingValue(binding, "description"),
    address: null,
    ...coordinates,
    distanceMeters: Number.isFinite(distanceKm) ? Math.round(distanceKm * 1000) : null,
    website: bindingValue(binding, "website"),
    phone: null,
    openingHours: null,
    source: "Wikidata",
    sourceUrl: `https://www.wikidata.org/wiki/${id}`,
  };
}

function buildQuery(latitude, longitude, radiusMeters) {
  const radiusKm = Math.max(0.5, Math.min(10, radiusMeters / 1000)).toFixed(2);
  return `
SELECT ?company ?companyLabel ?description ?coordinates ?distance (SAMPLE(?website) AS ?website) WHERE {
  SERVICE wikibase:around {
    ?company wdt:P625 ?coordinates .
    bd:serviceParam wikibase:center "Point(${longitude} ${latitude})"^^geo:wktLiteral ;
      wikibase:radius "${radiusKm}" ;
      wikibase:distance ?distance .
  }
  VALUES ?type { wd:Q18388277 wd:Q1058914 wd:Q129238 }
  ?company wdt:P31/wdt:P279* ?type .
  OPTIONAL { ?company wdt:P856 ?website . }
  OPTIONAL {
    ?company schema:description ?description .
    FILTER(LANG(?description) = "en")
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
GROUP BY ?company ?companyLabel ?description ?coordinates ?distance
ORDER BY ?distance
LIMIT ${MAX_RESULTS}
`;
}

export async function searchWikidataTechCompanies({ latitude, longitude, radiusMeters, category }) {
  if (!isTechnologyCompetitorCategory(category)) {
    return { results: [], provider: null, available: false };
  }

  const cacheKey = `${Number(latitude).toFixed(3)}|${Number(longitude).toFixed(3)}|${Number(radiusMeters)}`;
  const cached = resultCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const query = buildQuery(Number(latitude), Number(longitude), Number(radiusMeters));
  const url = new URL(WIKIDATA_QUERY_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");

  const requestOptions = {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": process.env.WIKIDATA_USER_AGENT || "StartForgeAI/1.0 (nearby technology company search)",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  };

  // WDQS occasionally returns a transient gateway error. Retry once so a
  // brief upstream hiccup does not immediately turn an otherwise valid search
  // into an empty result set.
  let response = await fetch(url, requestOptions);
  if ([502, 503, 504].includes(response.status)) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    response = await fetch(url, requestOptions);
  }

  if (!response.ok) {
    throw new Error(`Wikidata search returned HTTP ${response.status}.`);
  }

  const payload = await response.json();
  const results = (payload?.results?.bindings || [])
    .map(toCompetitor)
    .filter(Boolean);

  const value = { results, provider: "Wikidata", available: true };
  resultCache.set(cacheKey, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  if (resultCache.size > 150) resultCache.delete(resultCache.keys().next().value);
  return value;
}
