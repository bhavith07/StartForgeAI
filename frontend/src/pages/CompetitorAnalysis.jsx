import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  MapPin, Search, ExternalLink, Globe2, Phone, Clock3,
  Store, AlertCircle, LoaderCircle, MapPinned
} from "lucide-react";

const API_BASE = "http://localhost:5000";

function BusinessCard({ business }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Store size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900">{business.name}</h3>
            <p className="mt-1 text-xs capitalize text-teal-700">{business.category}</p>
          </div>
        </div>
        <a
          href={business.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
        >
          OSM <ExternalLink size={13} />
        </a>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex items-start gap-2">
          <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
          <span>{business.address || "Address not listed in OpenStreetMap"}</span>
        </p>
        {business.phone && (
          <p className="flex items-center gap-2">
            <Phone size={15} className="shrink-0 text-slate-400" /> {business.phone}
          </p>
        )}
        {business.website && (
          <p className="flex min-w-0 items-center gap-2">
            <Globe2 size={15} className="shrink-0 text-slate-400" />
            <a className="truncate text-teal-700 hover:underline" href={business.website} target="_blank" rel="noreferrer">
              {business.website}
            </a>
          </p>
        )}
        {business.openingHours && (
          <p className="flex items-start gap-2">
            <Clock3 size={15} className="mt-0.5 shrink-0 text-slate-400" /> {business.openingHours}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-500">Ratings and reviews unavailable</span>
        <span className="text-xs font-semibold text-slate-400">{business.source || "OpenStreetMap"}</span>
      </div>
    </article>
  );
}

export default function CompetitorAnalysis() {
  const { token } = useAuth();
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("5000");
  const [businesses, setBusinesses] = useState([]);
  const [searchedLocation, setSearchedLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusinesses([]);
    setCoordinates(null);

    if (!industry.trim() || !location.trim()) {
      setError("Enter an industry and a city or area to search.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        industry: industry.trim(),
        location: location.trim(),
        radius,
      });

      const response = await fetch(`${API_BASE}/api/competitors/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Competitor search failed.");
      }

      setBusinesses(data.businesses || []);
      setSearchedLocation(data.location || location);
      setCoordinates(data.coordinates || null);
      setNotice(data.dataNotice || "");
    } catch (err) {
      setError(err.message || "Unable to search right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const mapUrl = coordinates
    ? `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=14/${coordinates.latitude}/${coordinates.longitude}`
    : "";

  return (
    <main className="min-h-screen bg-slate-50 px-5 pb-16 pt-28 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-white to-teal-50 p-7 shadow-sm sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
            <MapPinned size={14} /> Local market research
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Find local competitors
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Discover businesses listed around your target location using OpenStreetMap community data.
          </p>

          <form onSubmit={handleSearch} className="mt-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_180px_auto] md:items-end">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Industry / business type</span>
              <input
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="e.g. restaurant, education, healthcare"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                maxLength={100}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">City / area</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Mangaluru, Karnataka"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                maxLength={160}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Search radius</span>
              <select
                value={radius}
                onChange={(event) => setRadius(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="1000">1 km</option>
                <option value="3000">3 km</option>
                <option value="5000">5 km</option>
                <option value="10000">10 km</option>
                <option value="20000">20 km</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}
              {loading ? "Searching..." : "Find competitors"}
            </button>
          </form>
        </section>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {searchedLocation && (
          <section className="mt-8">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-teal-700">Search results</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {businesses.length} businesses found
                </h2>
                <p className="mt-1 text-sm text-slate-500">{searchedLocation} · Within {Number(radius) / 1000} km · {industry}</p>
              </div>
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-teal-700 hover:bg-teal-50">
                  <MapPin size={16} /> Open area map <ExternalLink size={14} />
                </a>
              )}
            </div>

            {notice && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                {notice}
              </div>
            )}

            {businesses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {businesses.map((business) => <BusinessCard key={business.id} business={business} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No matching businesses were found in this area. Try a broader industry term or larger radius.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
