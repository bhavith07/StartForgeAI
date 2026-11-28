import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { jsPDF } from "jspdf";
import {
  MapPin,
  Search,
  ExternalLink,
  Globe2,
  Phone,
  Clock3,
  Store,
  AlertCircle,
  LoaderCircle,
  MapPinned,
  History,
  RefreshCw,
  Ruler,
  Map as MapIcon,
  Layers3,
  ListFilter,
  ArrowDownUp,
  Crosshair,
  BarChart3,
  Sparkles,
  Lightbulb,
  Target,
  ShieldAlert,
  FileDown,
} from "lucide-react";
import L from "leaflet";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const RADII = [500, 1000, 2000, 3000, 5000, 10000];

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status}).`);
    error.status = response.status;
    error.retryAfterSeconds = data.retryAfterSeconds;
    throw error;
  }
  return data;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

function distanceLabel(value) {
  const meters = Number(value);
  if (!Number.isFinite(meters)) return "Distance unavailable";
  return meters < 1000
    ? `${Math.round(meters)} m away`
    : `${(meters / 1000).toFixed(1)} km away`;
}

function validCoordinates(business) {
  return (
    business?.latitude !== null &&
    business?.latitude !== undefined &&
    business?.longitude !== null &&
    business?.longitude !== undefined &&
    Number.isFinite(Number(business.latitude)) &&
    Number.isFinite(Number(business.longitude)) &&
    Number(business.latitude) >= -90 &&
    Number(business.latitude) <= 90 &&
    Number(business.longitude) >= -180 &&
    Number(business.longitude) <= 180
  );
}

function FitMapToResults({ results, location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    const businessPoints = results
      .filter(validCoordinates)
      .map((business) => [Number(business.latitude), Number(business.longitude)]);

    const points = [
      [Number(location.latitude), Number(location.longitude)],
      ...businessPoints,
    ];

    if (points.length > 1) {
      map.fitBounds(points, { padding: [36, 36], maxZoom: 16 });
    } else {
      map.setView(points[0], 13);
    }
  }, [map, results, location]);

  return null;
}

function FocusMapMarker({ business }) {
  const map = useMap();

  useEffect(() => {
    if (!business || !validCoordinates(business)) return;

    map.flyTo(
      [Number(business.latitude), Number(business.longitude)],
      Math.max(map.getZoom(), 16),
      { animate: true, duration: 0.7 }
    );
  }, [map, business]);

  return null;
}

// Keeps the map zoom level in React state so labels can become visible
// automatically when the user zooms in close to a business.
function MapZoomObserver({ setZoomLevel }) {
  const map = useMap();

  useEffect(() => {
    setZoomLevel(map.getZoom());
  }, [map, setZoomLevel]);

  useMapEvents({
    zoomend: () => setZoomLevel(map.getZoom()),
  });

  return null;
}

function getBusinessKey(business, index = 0) {
  return business.osmId || `${business.name || "business"}-${business.latitude}-${business.longitude}-${index}`;
}

function categoryLabel(value) {
  return String(value || "business")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function createNumberedMarkerIcon(number, selected = false) {
  const size = selected ? 38 : 30;
  const background = selected ? "#facc15" : "#14b8a6";
  const border = selected ? "#78350f" : "#115e59";
  const textColor = selected ? "#422006" : "#ffffff";

  // Marker numbers are generated from the visible result index, not user input.
  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      display:flex;
      align-items:center;
      justify-content:center;
      border:3px solid ${border};
      border-radius:50%;
      background:${background};
      color:${textColor};
      font-family:Arial,sans-serif;
      font-size:12px;
      font-weight:800;
      line-height:1;
      box-shadow:0 2px 7px rgba(15,23,42,.38);
      box-sizing:border-box;
    ">${number}</div>
  `;

  return L.divIcon({
    className: "competitor-numbered-marker",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function BusinessCard({ business, index, displayNumber, isSelected, onSelect }) {
  const sourceUrl = business.sourceUrl || (
    business.osmId ? `https://www.openstreetmap.org/${business.osmId}` : null
  );
  const cardId = `competitor-card-${encodeURIComponent(getBusinessKey(business, index))}`;

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(business);
    }
  }

  return (
    <article
      id={cardId}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect?.(business)}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-teal-500/10 ${
        isSelected ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isSelected ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700"}`}
            aria-label={`Map marker ${displayNumber}`}
            title={`Map marker ${displayNumber}`}
          >
            <span className="text-base font-extrabold tabular-nums">{displayNumber}</span>
          </span>
          <div className="min-w-0">
            <h3 className="break-words font-bold text-slate-900">
              {business.name || "Unnamed mapped business"}
            </h3>
            <p className="mt-1 text-xs capitalize text-teal-700">
              {categoryLabel(business.category)}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Map marker #{displayNumber}
            </p>
          </div>
        </div>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
          >
            OSM <ExternalLink size={13} />
          </a>
        )}
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex items-start gap-2">
          <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
          <span>{business.address || "Address not listed in OpenStreetMap"}</span>
        </p>
        {business.distanceMeters != null && (
          <p className="flex items-center gap-2">
            <Ruler size={15} className="text-slate-400" />
            {distanceLabel(business.distanceMeters)}
          </p>
        )}
        {business.phone && (
          <p className="flex items-center gap-2">
            <Phone size={15} className="text-slate-400" />
            {business.phone}
          </p>
        )}
        {business.website && (
          <p className="flex min-w-0 items-center gap-2">
            <Globe2 size={15} className="shrink-0 text-slate-400" />
            <a
              className="truncate text-teal-700 hover:underline"
              href={business.website}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {business.website}
            </a>
          </p>
        )}
        {business.openingHours && (
          <p className="flex items-start gap-2">
            <Clock3 size={15} className="mt-0.5 text-slate-400" />
            <span>{business.openingHours}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-500">Ratings and reviews unavailable</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
          <Crosshair size={13} /> {isSelected ? "Selected on map" : "Locate on map"}
        </span>
      </div>
    </article>
  );
}

function CompetitorMap({ location, results, visibleResults, radiusMeters, searchId, activeBusiness, activeBusinessId, onSelectBusiness }) {
  const center = [Number(location.latitude), Number(location.longitude)];
  const [mapZoom, setMapZoom] = useState(13);

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-teal-700">
            <MapIcon size={17} /> Interactive competitor map
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Numbered markers match the business cards below. Hover to see a name, or select a marker for full details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-200" /> Search centre
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-teal-700 bg-teal-500 text-[9px] font-extrabold text-white">1</span> Numbered businesses
          </span>
        </div>
      </div>

      <div className="relative z-0 h-[440px] w-full sm:h-[500px]">
        <MapContainer
          key={`competitor-map-${searchId || `${center[0]}-${center[1]}`}`}
          center={center}
          zoom={13}
          scrollWheelZoom
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <ZoomControl position="topright" />
          <MapZoomObserver setZoomLevel={setMapZoom} />
          <FitMapToResults results={results} location={location} />
          <FocusMapMarker business={activeBusiness} />

          <Circle
            center={center}
            radius={Number(radiusMeters)}
            pathOptions={{
              color: "#0f766e",
              weight: 2,
              opacity: 0.8,
              fillColor: "#14b8a6",
              fillOpacity: 0.06,
              dashArray: "6 6",
            }}
          />

          <CircleMarker
            center={center}
            radius={9}
            pathOptions={{
              color: "#b45309",
              weight: 3,
              fillColor: "#fbbf24",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="min-w-36">
                <strong>Search centre</strong>
                <p>{location.name}</p>
                <p className="text-xs">Search radius: {radiusMeters >= 1000 ? `${radiusMeters / 1000} km` : `${radiusMeters} m`}</p>
              </div>
            </Popup>
          </CircleMarker>

          {visibleResults.filter(validCoordinates).map((business, displayIndex) => {
            const originalIndex = results.indexOf(business);
            const businessId = getBusinessKey(business, originalIndex);
            const selected = activeBusinessId === businessId;
            const displayNumber = visibleResults.indexOf(business) + 1;

            return (
              <Marker
                key={businessId}
                position={[Number(business.latitude), Number(business.longitude)]}
                icon={createNumberedMarkerIcon(displayNumber, selected)}
                zIndexOffset={selected ? 1000 : 0}
                eventHandlers={{
                  click: () => onSelectBusiness?.(business, "map", originalIndex),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -15]}
                  opacity={0.98}
                  sticky
                  permanent={selected || mapZoom >= 17}
                  className="competitor-name-tooltip"
                >
                  <div className="flex max-w-52 flex-col gap-0.5">
                    <span className="font-bold text-slate-900">
                      {displayNumber}. {business.name || "Mapped business"}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {categoryLabel(business.category)}
                      {business.distanceMeters != null ? ` · ${distanceLabel(business.distanceMeters)}` : ""}
                    </span>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="min-w-48 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-extrabold text-white">
                        {displayNumber}
                      </span>
                      <strong className="block text-sm text-slate-900">
                        {business.name || "Mapped business"}
                      </strong>
                    </div>
                    <p className="text-xs capitalize text-slate-600">
                      {categoryLabel(business.category)}
                    </p>
                    {business.address && (
                      <p className="text-xs text-slate-600">{business.address}</p>
                    )}
                    {business.distanceMeters != null && (
                      <p className="text-xs font-semibold text-teal-700">
                        {distanceLabel(business.distanceMeters)} from search centre
                      </p>
                    )}
                    {business.phone && (
                      <p className="text-xs text-slate-600">Phone: {business.phone}</p>
                    )}
                    {business.website && (
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noreferrer"
                        className="block break-all text-xs font-semibold text-teal-700 hover:underline"
                      >
                        {business.website}
                      </a>
                    )}
                    {business.openingHours && (
                      <p className="text-xs text-slate-600">Hours: {business.openingHours}</p>
                    )}
                    {business.sourceUrl && (
                      <a
                        href={business.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700"
                      >
                        View OpenStreetMap <ExternalLink size={11} />
                      </a>
                    )}
                    <p className="border-t border-slate-100 pt-1 text-[11px] font-medium text-teal-700">
                      Matching business card #{displayNumber} is highlighted below.
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex flex-col gap-1 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="inline-flex items-center gap-1.5">
          <Layers3 size={13} /> {visibleResults.filter(validCoordinates).length} numbered business markers shown
        </span>
        <span>Map data © OpenStreetMap contributors</span>
      </div>
    </section>
  );
}


function pdfSafeText(value, fallback = "Not listed") {
  const raw = value == null || value === "" ? fallback : String(value);
  return raw
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2022/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function addPdfPageHeader(doc, title) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 17, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("STARTFORGE AI  |  COMPETITOR RESEARCH", 12, 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(pdfSafeText(title), 12, 12.5);
  return 24;
}

function addPdfFooter(doc, attributionUrl) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(226, 232, 240);
    doc.line(12, pageHeight - 11, pageWidth - 12, pageHeight - 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("OpenStreetMap data - coverage varies; this is not a complete business census.", 12, pageHeight - 6);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - 12, pageHeight - 6, { align: "right" });
    // Keep the attribution URL in the document as plain text for portability.
    if (attributionUrl) {
      doc.setTextColor(13, 116, 144);
      doc.text("openstreetmap.org/copyright", pageWidth - 58, pageHeight - 6, { align: "right" });
    }
  }
}

function addPdfSectionTitle(doc, title, x, y, maxWidth) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  const lines = doc.splitTextToSize(pdfSafeText(title), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 5 + 2;
}

function addPdfParagraph(doc, value, x, y, width, options = {}) {
  const fontSize = options.fontSize || 8.5;
  const lineHeight = options.lineHeight || 4.2;
  const text = pdfSafeText(value, "");
  if (!text) return y;
  doc.setFont("helvetica", options.bold ? "bold" : "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...(options.color || [51, 65, 85]));
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight + (options.after == null ? 2 : options.after);
}

function addPdfBulletSection(doc, title, items, startY, options = {}) {
  if (!Array.isArray(items) || items.length === 0) return startY;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 14;
  const contentWidth = pageWidth - 28;
  const lineHeight = options.lineHeight || 4;
  const itemGap = options.itemGap ?? 2;
  let y = startY;
  const titleLines = doc.splitTextToSize(pdfSafeText(title), contentWidth);
  const firstItemLines = doc.splitTextToSize(pdfSafeText(items[0]), contentWidth - 8);
  const titleHeight = titleLines.length * 5 + 2;
  const firstItemHeight = Math.max(4.5, firstItemLines.length * lineHeight + itemGap);
  if (y + titleHeight + firstItemHeight > pageHeight - 17) {
    doc.addPage();
    y = addPdfPageHeader(doc, "AI competitor insights");
  }
  y = addPdfSectionTitle(doc, title, left, y, contentWidth);
  for (const item of items) {
    const lines = doc.splitTextToSize(pdfSafeText(item), contentWidth - 8);
    const rowHeight = Math.max(4.5, lines.length * lineHeight + itemGap);
    if (y + rowHeight > pageHeight - 17) {
      doc.addPage();
      y = addPdfPageHeader(doc, "AI competitor insights (continued)");
      y = addPdfSectionTitle(doc, title + " (continued)", left, y, contentWidth);
    }
    doc.setFillColor(13, 148, 136);
    doc.circle(left + 1.5, y - 1.1, 0.8, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(options.fontSize || 8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(lines, left + 6, y);
    y += rowHeight;
  }
  return y + 3;
}

function drawCompetitorDistributionPlot(doc, businesses, location, radiusMeters, x, y, width, height) {
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, width, height, 3, 3, "FD");

  const centerLat = Number(location?.latitude);
  const centerLon = Number(location?.longitude);
  const radius = Math.max(1, Number(radiusMeters) || 1);
  const plotRadius = Math.min(width * 0.31, height * 0.34);
  const centerX = x + width * 0.43;
  const centerY = y + height * 0.53;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Competitor location distribution", x + 5, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Schematic coordinate plot - not a street map", x + 5, y + 12);

  doc.setDrawColor(13, 148, 136);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.circle(centerX, centerY, plotRadius);
  doc.setLineDashPattern([], 0);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.line(centerX - plotRadius, centerY, centerX + plotRadius, centerY);
  doc.line(centerX, centerY - plotRadius, centerX, centerY + plotRadius);

  let plotted = 0;
  if (Number.isFinite(centerLat) && Number.isFinite(centerLon)) {
    const metersPerLatDegree = 111132;
    const metersPerLonDegree = 111320 * Math.cos((centerLat * Math.PI) / 180);
    businesses.forEach((business) => {
      if (!validCoordinates(business)) return;
      const dx = (Number(business.longitude) - centerLon) * metersPerLonDegree;
      const dy = (Number(business.latitude) - centerLat) * metersPerLatDegree;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > radius * 1.08) return;
      const px = centerX + (dx / radius) * plotRadius;
      const py = centerY - (dy / radius) * plotRadius;
      doc.setFillColor(20, 184, 166);
      doc.setDrawColor(15, 118, 110);
      doc.circle(px, py, 1.05, "FD");
      plotted += 1;
    });
  }

  doc.setFillColor(250, 204, 21);
  doc.setDrawColor(146, 64, 14);
  doc.circle(centerX, centerY, 2, "FD");

  const legendX = x + width * 0.76;
  let legendY = y + 27;
  doc.setFillColor(20, 184, 166);
  doc.setDrawColor(15, 118, 110);
  doc.circle(legendX, legendY, 1.3, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`Mapped businesses (${plotted})`, legendX + 4, legendY + 1);
  legendY += 10;
  doc.setFillColor(250, 204, 21);
  doc.setDrawColor(146, 64, 14);
  doc.circle(legendX, legendY, 1.8, "FD");
  doc.text("Search centre", legendX + 4, legendY + 1);
  legendY += 10;
  doc.setDrawColor(13, 148, 136);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.circle(legendX, legendY, 3.2);
  doc.setLineDashPattern([], 0);
  doc.text(`Search radius (${radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`})`, legendX + 7, legendY + 1);
}

function buildCompetitorResearchPdf({
  results,
  visibleResults,
  searchedLocation,
  searchedCategory,
  searchedRadius,
  searchId,
  densityMetrics,
  insights,
  insightsCached,
  insightsGeneratedAt,
  selectedStartupAnalysis,
  attributionUrl,
  provider,
  categoryFilter,
  sortOrder,
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const generatedAt = new Date();
  const locationName = searchedLocation?.name || "Unknown location";
  const areaKm2 = Number(densityMetrics?.areaKm2 || 0);
  const density = Number(densityMetrics?.density || 0);
  const linkedName = selectedStartupAnalysis?.startup_name || insights?.linkedStartupName || "General market overview";
  const filenameBase = pdfSafeText(selectedStartupAnalysis?.startup_name || searchedCategory || "competitor-research", "competitor-research")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "competitor-research";

  // PAGE 1: Search overview and a vector location plot.
  let y = addPdfPageHeader(doc, "Local competitor discovery and market research");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(15, 23, 42);
  doc.text("Competitor Research Report", margin, y + 5);
  y += 13;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(pdfSafeText(`${locationName} | ${searchedCategory} | ${Number(searchedRadius) >= 1000 ? `${Number(searchedRadius) / 1000} km radius` : `${searchedRadius} m radius`}`), margin, y);
  y += 8;

  const metadata = [
    [`Linked startup`, linkedName],
    [`Search ID`, searchId ? `#${searchId}` : "Not saved"],
    [`Records returned`, String(results.length)],
    [`Rows included in table`, `${visibleResults.length} of ${results.length}`],
    [`Category filter`, categoryFilter === "all" ? "All categories" : categoryFilter],
    [`Sort order`, sortOrder === "nearest" ? "Nearest first" : sortOrder === "farthest" ? "Farthest first" : "Name A-Z"],
    [`Generated`, generatedAt.toLocaleString()],
    [`Data provider`, provider || "OpenStreetMap"],
  ];
  const cardGap = 3;
  const cardWidth = (contentWidth - cardGap) / 2;
  metadata.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const cardX = margin + col * (cardWidth + cardGap);
    const cardY = y + row * 13;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, cardY, cardWidth, 11, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), cardX + 3, cardY + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(pdfSafeText(value), cardWidth - 6).slice(0, 1);
    doc.text(lines, cardX + 3, cardY + 8.5);
  });
  y += 4 * 13 + 6;

  // KPI strip.
  const kpis = [
    ["MAPPED BUSINESSES", String(results.length)],
    ["MAPPED DENSITY", `${density.toFixed(1)} / km2`],
    ["SEARCH AREA", `${areaKm2.toFixed(1)} km2`],
    ["MAPPED CATEGORIES", String(densityMetrics?.categoryCount || 0)],
  ];
  const kpiGap = 3;
  const kpiWidth = (contentWidth - kpiGap * 3) / 4;
  kpis.forEach(([label, value], index) => {
    const kx = margin + index * (kpiWidth + kpiGap);
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(kx, y, kpiWidth, 18, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(15, 118, 110);
    doc.text(label, kx + 3, y + 5);
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(value, kx + 3, y + 13.5);
  });
  y += 24;

  const panelY = y;
  const panelHeight = Math.min(77, pageHeight - panelY - 18);
  const plotWidth = 143;
  drawCompetitorDistributionPlot(doc, visibleResults, searchedLocation, searchedRadius, margin, panelY, plotWidth, panelHeight);

  const summaryX = margin + plotWidth + 5;
  const summaryWidth = contentWidth - plotWidth - 5;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(summaryX, panelY, summaryWidth, panelHeight, 3, 3, "FD");
  let summaryY = addPdfSectionTitle(doc, "Research summary", summaryX + 5, panelY + 9, summaryWidth - 10);
  summaryY = addPdfParagraph(doc, `Most common mapped category: ${densityMetrics?.leadingCategory ? `${categoryLabel(densityMetrics.leadingCategory[0])} (${densityMetrics.leadingCategory[1]} records)` : "Not available"}.`, summaryX + 5, summaryY, summaryWidth - 10, { fontSize: 8 });
  summaryY = addPdfParagraph(doc, `Search centre: ${locationName}. Search radius: ${Number(searchedRadius) >= 1000 ? `${Number(searchedRadius) / 1000} km` : `${searchedRadius} m`}.`, summaryX + 5, summaryY, summaryWidth - 10, { fontSize: 8 });
  summaryY = addPdfParagraph(doc, `Mapped density is approximately ${density.toFixed(1)} records per square kilometre over an estimated circular area of ${areaKm2.toFixed(1)} square kilometres.`, summaryX + 5, summaryY, summaryWidth - 10, { fontSize: 8 });
  if (selectedStartupAnalysis) {
    summaryY = addPdfParagraph(doc, `Startup industry: ${selectedStartupAnalysis.industry || "Not specified"}. Existing startup score: ${selectedStartupAnalysis.startup_score ?? "Not provided"}.`, summaryX + 5, summaryY, summaryWidth - 10, { fontSize: 8 });
  }
  if (insights?.competitionSignal) {
    summaryY = addPdfParagraph(doc, `Gemini competition signal: ${insights.competitionSignal}. This is a qualitative estimate, not a market-share measurement.`, summaryX + 5, summaryY, summaryWidth - 10, { fontSize: 8, bold: true, color: [15, 118, 110] });
  } else {
    summaryY = addPdfParagraph(doc, "Gemini competitor insights were not included because no saved AI comparison was available at export time.", summaryX + 5, summaryY, summaryWidth - 10, { fontSize: 7.5 });
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(13, 116, 144);
  doc.textWithLink("Open interactive area map in OpenStreetMap", summaryX + 5, panelY + panelHeight - 6, {
    url: `https://www.openstreetmap.org/?mlat=${searchedLocation?.latitude}&mlon=${searchedLocation?.longitude}#map=15/${searchedLocation?.latitude}/${searchedLocation?.longitude}`,
  });

  // PAGE(S): Competitor comparison table.
  doc.addPage("a4", "landscape");
  let tableY = addPdfPageHeader(doc, "Competitor comparison table");
  tableY = addPdfParagraph(doc, `The table follows the currently selected category filter and sort order. ${visibleResults.length} mapped records are included.`, margin, tableY, contentWidth, { fontSize: 8 });

  const columns = [
    { title: "#", width: 9, value: (_b, index) => String(index + 1) },
    { title: "Business", width: 38, value: (b) => `${b.name || "Unnamed mapped business"}\nOSM: ${b.osmId || "ID unavailable"}` },
    { title: "Category", width: 25, value: (b) => categoryLabel(b.category) },
    { title: "Distance", width: 22, value: (b) => b.distanceMeters != null ? distanceLabel(b.distanceMeters) : "Not available" },
    { title: "Address", width: 51, value: (b) => b.address || "Not listed in OpenStreetMap" },
    { title: "Phone / website", width: 48, value: (b) => `Phone: ${b.phone || "not listed"}\nWeb: ${b.website || "not listed"}` },
    { title: "Opening hours", width: 42, value: (b) => b.openingHours || "Not listed" },
    { title: "OSM source", width: 38, value: (b) => b.osmId ? `openstreetmap.org/${b.osmId}` : "Not available" },
  ];
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const tableX = (pageWidth - tableWidth) / 2;
  const drawTableHeader = () => {
    doc.setFillColor(15, 118, 110);
    doc.rect(tableX, tableY, tableWidth, 8, "F");
    let cx = tableX;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    columns.forEach((column) => {
      doc.text(column.title, cx + 2, tableY + 5.2);
      cx += column.width;
    });
    tableY += 8;
  };
  drawTableHeader();

  visibleResults.forEach((business, index) => {
    const cells = columns.map((column) => pdfSafeText(column.value(business, index)));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.7);
    const cellLines = cells.map((text, cellIndex) => doc.splitTextToSize(text, columns[cellIndex].width - 4));
    const maxLines = Math.max(1, ...cellLines.map((lines) => lines.length));
    const rowHeight = Math.max(8, maxLines * 3.15 + 4);
    if (tableY + rowHeight > pageHeight - 15) {
      doc.addPage("a4", "landscape");
      tableY = addPdfPageHeader(doc, "Competitor comparison table (continued)");
      drawTableHeader();
    }
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(tableX, tableY, tableWidth, rowHeight, "F");
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(tableX, tableY + rowHeight, tableX + tableWidth, tableY + rowHeight);
    let cx = tableX;
    cellLines.forEach((lines, cellIndex) => {
      doc.setFont("helvetica", cellIndex === 1 ? "bold" : "normal");
      doc.setFontSize(6.7);
      doc.setTextColor(cellIndex === 0 ? 15 : 51, cellIndex === 0 ? 118 : 65, cellIndex === 0 ? 110 : 85);
      doc.text(lines, cx + 2, tableY + 4.2);
      cx += columns[cellIndex].width;
    });
    tableY += rowHeight;
  });
  if (visibleResults.length === 0) {
    addPdfParagraph(doc, "No businesses match the selected category filter.", margin, tableY + 7, contentWidth);
  }

  // PAGE(S): Gemini insights when present.
  if (insights) {
    doc.addPage("a4", "landscape");
    let insightY = addPdfPageHeader(doc, "Gemini-powered competitor insights");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("AI Market Assessment", margin, insightY + 4);
    insightY += 12;

    const signal = pdfSafeText(insights.competitionSignal || "Insufficient data");
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(margin, insightY - 4, 58, 17, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(15, 118, 110);
    doc.text("COMPETITION SIGNAL", margin + 3, insightY + 1);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(signal, margin + 3, insightY + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${insights.businessRecordsConsidered ?? "-"} of ${insights.totalMappedRecords ?? results.length} records considered | ${insights.analysisType === "startup_comparison" ? "Linked startup comparison" : "General market overview"} | ${insightsCached ? "Saved AI result" : "Generated by Gemini"}`, margin + 64, insightY + 4);
    if (insightsGeneratedAt || insights.generatedAt) {
      doc.text(`Generated: ${formatDate(insightsGeneratedAt || insights.generatedAt)}`, margin + 64, insightY + 9);
    }
    insightY += 20;
    insightY = addPdfParagraph(doc, insights.summary, margin, insightY, contentWidth, { fontSize: 9, lineHeight: 4.5 });
    insightY = addPdfParagraph(doc, insights.competitionSignalReason, margin, insightY, contentWidth, { fontSize: 8, color: [71, 85, 105] });
    insightY += 2;

    insightY = addPdfBulletSection(doc, "Observed patterns", insights.observations, insightY);
    if (Array.isArray(insights.possibleComparables) && insights.possibleComparables.length) {
      const comparableLines = insights.possibleComparables.map((item) => `${item.name} | ${categoryLabel(item.category)} | ${distanceLabel(item.distanceMeters)} | ${item.reason}`);
      insightY = addPdfBulletSection(doc, "Possible mapped comparables", comparableLines, insightY);
    }
    insightY = addPdfBulletSection(doc, "Opportunity ideas to validate", insights.opportunityIdeas, insightY);
    insightY = addPdfBulletSection(doc, "Recommended next steps", insights.recommendedActions, insightY);
    insightY = addPdfBulletSection(doc, "Data limitations", insights.limitations, insightY, {
      fontSize: 7.6,
      lineHeight: 3.5,
      itemGap: 1,
    });
    const limitationNote = "AI interpretations are hypotheses, not verified business facts. Mapped business records are not a complete census, and OpenStreetMap does not provide customer ratings or reviews in this integration.";
    const limitationNoteLines = doc.splitTextToSize(pdfSafeText(limitationNote), contentWidth);
    if (insightY + 2 + limitationNoteLines.length * 3.5 > pageHeight - 15) {
      doc.addPage();
      insightY = addPdfPageHeader(doc, "AI competitor insights (continued)");
    }
    addPdfParagraph(doc, limitationNote, margin, insightY + 2, contentWidth, {
      fontSize: 7.2,
      lineHeight: 3.5,
      color: [100, 116, 139],
    });
  } else {
    doc.addPage("a4", "landscape");
    const noteY = addPdfPageHeader(doc, "AI competitor insights");
    addPdfSectionTitle(doc, "Gemini comparison not generated", margin, noteY + 4, contentWidth);
    addPdfParagraph(doc, "No saved Gemini comparison was available when this report was exported. Generate AI competitor insights in StartForge AI and export again to include the analysis.", margin, noteY + 14, contentWidth);
  }

  addPdfFooter(doc, attributionUrl);
  doc.save(`${filenameBase}-competitor-research-report.pdf`);
}

export default function CompetitorAnalysis() {
  const { token } = useAuth();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("3000");
  const [results, setResults] = useState([]);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [searchedCategory, setSearchedCategory] = useState("");
  const [searchedRadius, setSearchedRadius] = useState(3000);
  const [searchId, setSearchId] = useState(null);
  const [provider, setProvider] = useState("OpenStreetMap via Overpass API");
  const [attribution, setAttribution] = useState("© OpenStreetMap contributors");
  const [attributionUrl, setAttributionUrl] = useState("https://www.openstreetmap.org/copyright");
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("nearest");
  const [activeBusinessId, setActiveBusinessId] = useState(null);
  const [selectionSource, setSelectionSource] = useState("map");
  const [startupAnalyses, setStartupAnalyses] = useState([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState("");
  const [insights, setInsights] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [insightsCached, setInsightsCached] = useState(false);
  const [insightsGeneratedAt, setInsightsGeneratedAt] = useState(null);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [pdfExportError, setPdfExportError] = useState("");

  const loadHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/competitors/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await parseResponse(response);
      setHistory(Array.isArray(data.searches) ? data.searches : []);
    } catch (err) {
      console.warn("Could not load competitor search history:", err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  const loadStartupAnalyses = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/api/analyze/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await parseResponse(response);
      setStartupAnalyses(Array.isArray(data.analyses) ? data.analyses : []);
    } catch (err) {
      console.warn("Could not load startup reports for competitor comparison:", err.message);
      setStartupAnalyses([]);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
    loadStartupAnalyses();
  }, [loadHistory, loadStartupAnalyses]);

  async function handleSearch(event) {
    event.preventDefault();
    setError("");
    setInsightError("");
    setInsights(null);
    setInsightsGeneratedAt(null);
    setInsightsCached(false);

    if (!token) {
      setError("Your login session is unavailable. Please log in again.");
      return;
    }

    if (!category.trim() || !location.trim()) {
      setError("Enter a business category and a city or area to search.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/competitors/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: location.trim(),
          category: category.trim(),
          radiusMeters: Number(radiusMeters),
          analysisId: selectedAnalysisId ? Number(selectedAnalysisId) : null,
        }),
      });

      const data = await parseResponse(response);

      const nextResults = Array.isArray(data.results) ? data.results : [];
      setResults(nextResults);
      setCategoryFilter("all");
      setSortOrder("nearest");
      setActiveBusinessId(null);
      setSearchedLocation(data.location || null);
      setSearchedCategory(data.category || category.trim());
      setSearchedRadius(Number(data.radiusMeters || radiusMeters));
      setSearchId(data.searchId || null);
      setProvider(data.provider || "OpenStreetMap via Overpass API");
      setAttribution(data.attribution || "© OpenStreetMap contributors");
      setAttributionUrl(data.attributionUrl || "https://www.openstreetmap.org/copyright");
      setNotice(
        data.note ||
          "OpenStreetMap coverage varies by area. Results may not include every business. Ratings and reviews are not provided in this phase."
      );
      await loadHistory();
    } catch (err) {
      const retryMessage = err.retryAfterSeconds
        ? ` Try again in about ${err.retryAfterSeconds} seconds.`
        : "";
      setError(`${err.message || "Unable to search right now. Please try again."}${retryMessage}`);
      setResults([]);
      setSearchedLocation(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateInsights() {
    setInsightError("");

    if (!token) {
      setInsightError("Your login session is unavailable. Please log in again.");
      return;
    }
    if (!searchId || !results.length) {
      setInsightError("Run a competitor search with at least one mapped business first.");
      return;
    }

    try {
      setInsightLoading(true);
      const response = await fetch(`${API_BASE}/api/competitors/${searchId}/insights`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ regenerate: Boolean(insights) }),
      });
      const data = await parseResponse(response);
      setInsights(data.insights || null);
      setInsightsCached(Boolean(data.cached));
      setInsightsGeneratedAt(data.generatedAt || data.insights?.generatedAt || null);
    } catch (err) {
      setInsightError(err.message || "Unable to generate AI competitor insights.");
    } finally {
      setInsightLoading(false);
    }
  }

  async function handleExportPdf() {
    setPdfExportError("");
    if (!results.length || !searchedLocation) {
      setPdfExportError("Run a competitor search before exporting a report.");
      return;
    }
    if (!searchId) {
      setPdfExportError("This competitor search is not saved. Run the search again before exporting.");
      return;
    }
    if (!token) {
      setPdfExportError("Your login session is unavailable. Please log in again.");
      return;
    }

    try {
      setPdfExporting(true);
      // Resolve against this saved search so the report uses its persisted AI result.
      // The endpoint returns cached insights, and generates/persists them when absent.
      const response = await fetch(`${API_BASE}/api/competitors/${searchId}/insights`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ regenerate: false }),
      });
      const data = await parseResponse(response);
      if (!data.insights || typeof data.insights !== "object") {
        throw new Error("Gemini did not return competitor insights, so the PDF was not created.");
      }
      setInsights(data.insights);
      setInsightsCached(Boolean(data.cached));
      setInsightsGeneratedAt(data.generatedAt || data.insights.generatedAt || null);
      buildCompetitorResearchPdf({
        results,
        visibleResults,
        searchedLocation,
        searchedCategory,
        searchedRadius,
        searchId,
        densityMetrics,
        insights: data.insights,
        insightsCached: Boolean(data.cached),
        insightsGeneratedAt: data.generatedAt || data.insights.generatedAt || null,
        selectedStartupAnalysis,
        attributionUrl,
        provider,
        categoryFilter,
        sortOrder,
      });
    } catch (err) {
      console.error("Competitor PDF export failed:", err);
      setPdfExportError(err.message || "Could not load Gemini insights or create the competitor research PDF.");
    } finally {
      setPdfExporting(false);
    }
  }

  const selectedStartupAnalysis = useMemo(
    () => startupAnalyses.find((item) => String(item.id) === String(selectedAnalysisId)) || null,
    [startupAnalyses, selectedAnalysisId]
  );

  const mapUrl = searchedLocation
    ? `https://www.openstreetmap.org/?mlat=${searchedLocation.latitude}&mlon=${searchedLocation.longitude}#map=15/${searchedLocation.latitude}/${searchedLocation.longitude}`
    : null;

  const availableCategories = useMemo(() => {
    return [...new Set(results.map((business) => String(business.category || "business").trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }, [results]);

  const visibleResults = useMemo(() => {
    const filtered = results.filter((business) =>
      categoryFilter === "all" || String(business.category || "business").trim() === categoryFilter
    );

    return [...filtered].sort((a, b) => {
      if (sortOrder === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      const aDistance = Number.isFinite(Number(a.distanceMeters)) ? Number(a.distanceMeters) : Number.POSITIVE_INFINITY;
      const bDistance = Number.isFinite(Number(b.distanceMeters)) ? Number(b.distanceMeters) : Number.POSITIVE_INFINITY;
      return sortOrder === "farthest" ? bDistance - aDistance : aDistance - bDistance;
    });
  }, [results, categoryFilter, sortOrder]);

  const densityMetrics = useMemo(() => {
    const radiusKm = Number(searchedRadius) / 1000;
    const areaKm2 = Math.PI * radiusKm * radiusKm;
    const density = areaKm2 > 0 ? results.length / areaKm2 : 0;
    const categoryCounts = results.reduce((counts, business) => {
      const key = String(business.category || "business").trim() || "business";
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
    const leadingCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      areaKm2,
      density,
      categoryCount: Object.keys(categoryCounts).length,
      leadingCategory,
    };
  }, [results, searchedRadius]);

  useEffect(() => {
    if (!activeBusinessId) return;
    const index = results.findIndex((business, resultIndex) => getBusinessKey(business, resultIndex) === activeBusinessId);
    if (index < 0) return;

    const isVisible = visibleResults.some((business) =>
      getBusinessKey(business, results.indexOf(business)) === activeBusinessId
    );
    if (!isVisible) {
      setActiveBusinessId(null);
      return;
    }

    if (selectionSource === "map") {
      const cardId = `competitor-card-${encodeURIComponent(activeBusinessId)}`;
      document.getElementById(cardId)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeBusinessId, results, visibleResults, selectionSource]);

  function selectBusiness(business, source = "card", index = 0) {
    setActiveBusinessId(getBusinessKey(business, index));
    setSelectionSource(source);
  }

  function usePreviousSearch(item) {
    setCategory(item.category || "");
    setLocation(item.location_name || "");
    setRadiusMeters(String(item.radius_meters || 3000));
    setSelectedAnalysisId(item.analysis_id ? String(item.analysis_id) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 pb-16 pt-28 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-white to-teal-50 p-7 shadow-sm sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
            <MapPinned size={14} /> Local technology market research
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Find tech companies and startups nearby
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Search mapped software, IT, technology and telecom offices near your target location. Startup listings appear only when tagged in OpenStreetMap.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_1fr_150px_1fr_auto] xl:items-end"
          >
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Technology category
              </span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. technology companies, tech startups, software company"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                maxLength={80}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                City / area
              </span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Mysuru, Karnataka"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                maxLength={160}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Search radius
              </span>
              <select
                value={radiusMeters}
                onChange={(event) => setRadiusMeters(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white"
              >
                {RADII.map((radius) => (
                  <option key={radius} value={radius}>
                    {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Link startup report (optional)
              </span>
              <select
                value={selectedAnalysisId}
                onChange={(event) => setSelectedAnalysisId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="">General market overview</option>
                {startupAnalyses.map((analysis) => (
                  <option key={analysis.id} value={analysis.id}>
                    {(analysis.startup_name || "Untitled startup").slice(0, 55)} · {analysis.industry || "Industry not specified"}
                  </option>
                ))}
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
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {searchedLocation && (
          <section className="mt-8">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-teal-700">Search results</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {results.length} mapped businesses found
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {searchedLocation.name} · Within {searchedRadius >= 1000 ? `${searchedRadius / 1000} km` : `${searchedRadius} m`} · {searchedCategory}
                </p>
                {searchId && <p className="mt-1 text-xs text-slate-400">Saved search #{searchId}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-teal-700 hover:bg-teal-50"
                  >
                    <MapPin size={16} /> Open area map <ExternalLink size={14} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={!results.length || pdfExporting}
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pdfExporting ? <LoaderCircle size={16} className="animate-spin" /> : <FileDown size={16} />}
                  {pdfExporting ? "Preparing PDF..." : "Download research PDF"}
                </button>
              </div>
            </div>

            {notice && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                {notice}
              </div>
            )}

            {pdfExportError && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{pdfExportError}</span>
              </div>
            )}

            {searchedLocation.latitude != null && searchedLocation.longitude != null && (
              <CompetitorMap
                location={searchedLocation}
                results={results}
                visibleResults={visibleResults}
                radiusMeters={searchedRadius}
                searchId={searchId}
                activeBusiness={results.find((business, index) => getBusinessKey(business, index) === activeBusinessId) || null}
                activeBusinessId={activeBusinessId}
                onSelectBusiness={selectBusiness}
              />
            )}

            <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-500">Mapped businesses</p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Store size={18} /></span>
                </div>
                <p className="mt-3 text-3xl font-extrabold text-slate-900">{results.length}</p>
                <p className="mt-1 text-xs text-slate-500">Records returned by OpenStreetMap</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-500">Mapped density estimate</p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><BarChart3 size={18} /></span>
                </div>
                <p className="mt-3 text-3xl font-extrabold text-slate-900">{densityMetrics.density.toFixed(1)}<span className="ml-1 text-sm font-semibold text-slate-400">/ km²</span></p>
                <p className="mt-1 text-xs text-slate-500">Across approximately {densityMetrics.areaKm2.toFixed(1)} km²</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-500">Most common mapped category</p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Layers3 size={18} /></span>
                </div>
                <p className="mt-3 truncate text-xl font-extrabold text-slate-900">{densityMetrics.leadingCategory ? categoryLabel(densityMetrics.leadingCategory[0]) : "Not available"}</p>
                <p className="mt-1 text-xs text-slate-500">{densityMetrics.leadingCategory ? `${densityMetrics.leadingCategory[1]} mapped records` : "No category details returned"} · {densityMetrics.categoryCount} categories</p>
              </article>
            </section>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Density is an estimate based on the mapped results returned for this search, not a complete count of every business in the area. OpenStreetMap coverage varies by location.
            </p>

            <section className="mt-8 overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-teal-700">
                    <Sparkles size={17} /> Gemini-powered competitor comparison
                  </div>
                  <h3 className="mt-2 text-xl font-extrabold text-slate-950">Turn mapped businesses into market insights</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Gemini will review the saved OpenStreetMap records, identify patterns and suggest opportunities to investigate.
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedStartupAnalysis
                      ? `Linked startup: ${selectedStartupAnalysis.startup_name || "Untitled startup"}`
                      : "No startup report linked. This will produce a general local-market overview."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateInsights}
                  disabled={!searchId || !results.length || insightLoading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {insightLoading ? <LoaderCircle size={17} className="animate-spin" /> : <Sparkles size={17} />}
                  {insightLoading ? "Analyzing mapped data..." : insights ? "Refresh AI comparison" : "Generate AI comparison"}
                </button>
              </div>

              {insightError && (
                <div className="m-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:m-6">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" /> {insightError}
                </div>
              )}

              {insightLoading && (
                <div className="flex items-center gap-3 p-6 text-sm text-slate-500">
                  <LoaderCircle size={19} className="animate-spin text-teal-600" />
                  Gemini is analyzing up to 40 mapped business records alongside the category counts for this search.
                </div>
              )}

              {insights && !insightLoading && (
                <div className="space-y-6 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-4xl">
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-700">AI market assessment</p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">{insights.summary}</p>
                    </div>
                    <div className="shrink-0 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Competition signal</p>
                      <p className="mt-1 text-xl font-extrabold text-teal-800">{insights.competitionSignal || "Insufficient data"}</p>
                    </div>
                  </div>

                  {insights.competitionSignalReason && (
                    <p className="-mt-3 text-xs leading-5 text-slate-500">{insights.competitionSignalReason}</p>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Records considered</p>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900">{insights.businessRecordsConsidered ?? 0}<span className="ml-1 text-sm font-semibold text-slate-400">/ {insights.totalMappedRecords ?? results.length}</span></p>
                      <p className="mt-1 text-xs text-slate-500">Detailed mapped records supplied to Gemini</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Analysis type</p>
                      <p className="mt-2 text-base font-bold text-slate-900">{insights.analysisType === "startup_comparison" ? "Linked startup comparison" : "General market overview"}</p>
                      <p className="mt-1 text-xs text-slate-500">{insights.linkedStartupName || "No startup report linked"}</p>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><BarChart3 size={16} className="text-teal-700" /> Observed patterns</h4>
                      {Array.isArray(insights.observations) && insights.observations.length ? (
                        <ul className="mt-3 space-y-2">
                          {insights.observations.map((item, index) => <li key={index} className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{item}</li>)}
                        </ul>
                      ) : <p className="mt-2 text-sm text-slate-500">No observations returned.</p>}
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Target size={16} className="text-teal-700" /> Possible mapped comparables</h4>
                      {Array.isArray(insights.possibleComparables) && insights.possibleComparables.length ? (
                        <ul className="mt-3 space-y-2">
                          {insights.possibleComparables.map((item, index) => <li key={`${item.name}-${index}`} className="rounded-xl border border-slate-200 px-4 py-3"><p className="text-sm font-bold text-slate-900">{item.name}</p><p className="mt-1 text-xs text-slate-500">{categoryLabel(item.category)} · {distanceLabel(item.distanceMeters)}</p><p className="mt-2 text-sm leading-6 text-slate-700">{item.reason}</p></li>)}
                        </ul>
                      ) : <p className="mt-2 text-sm text-slate-500">No specific comparable could be selected from the supplied records.</p>}
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Lightbulb size={16} className="text-amber-600" /> Opportunity ideas to validate</h4>
                      {Array.isArray(insights.opportunityIdeas) && insights.opportunityIdeas.length ? (
                        <ul className="mt-3 space-y-2">{insights.opportunityIdeas.map((item, index) => <li key={index} className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm leading-6 text-slate-700">{item}</li>)}</ul>
                      ) : <p className="mt-2 text-sm text-slate-500">No opportunity ideas returned.</p>}
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Target size={16} className="text-emerald-700" /> Recommended next steps</h4>
                      {Array.isArray(insights.recommendedActions) && insights.recommendedActions.length ? (
                        <ol className="mt-3 space-y-2">{insights.recommendedActions.map((item, index) => <li key={index} className="flex gap-3 rounded-xl bg-emerald-50/60 px-4 py-3 text-sm leading-6 text-slate-700"><span className="font-extrabold text-emerald-700">{index + 1}.</span><span>{item}</span></li>)}</ol>
                      ) : <p className="mt-2 text-sm text-slate-500">No next steps returned.</p>}
                    </div>
                  </div>

                  {Array.isArray(insights.limitations) && insights.limitations.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-900"><ShieldAlert size={15} /> Data limitations</h4>
                      <ul className="mt-2 space-y-1">{insights.limitations.map((item, index) => <li key={index} className="text-xs leading-5 text-amber-900">• {item}</li>)}</ul>
                    </div>
                  )}

                  <div className="flex flex-col justify-between gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400 sm:flex-row">
                    <span>{insightsCached ? "Loaded saved AI insights" : "Generated by Gemini"}{insightsGeneratedAt ? ` · ${formatDate(insightsGeneratedAt)}` : ""}</span>
                    <span>AI interpretations are hypotheses, not verified business facts. Reviews and ratings are not included.</span>
                  </div>
                </div>
              )}
            </section>

            <div className="mt-7">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Business cards</h3>
                  <p className="mt-1 text-xs text-slate-500">Select a card to focus its marker, or select a marker to highlight its card. Marker numbers match the comparison table.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><ListFilter size={12} /> Filter category</span>
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      className="w-full min-w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    >
                      <option value="all">All categories ({results.length})</option>
                      {availableCategories.map((value) => (
                        <option key={value} value={value}>{categoryLabel(value)} ({results.filter((business) => String(business.category || "business").trim() === value).length})</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"><ArrowDownUp size={12} /> Sort businesses</span>
                    <select
                      value={sortOrder}
                      onChange={(event) => setSortOrder(event.target.value)}
                      className="w-full min-w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    >
                      <option value="nearest">Nearest first</option>
                      <option value="farthest">Farthest first</option>
                      <option value="name">Name A–Z</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>Showing {visibleResults.length} of {results.length} mapped businesses in the table and cards</span>
                {activeBusinessId && (
                  <button type="button" onClick={() => setActiveBusinessId(null)} className="font-semibold text-teal-700 hover:text-teal-900">Clear map selection</button>
                )}
              </div>

              {visibleResults.length > 0 && (
                <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">Competitor comparison table</h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Compare the mapped business details side by side. The row numbers match the map markers and cards.
                      </p>
                    </div>
                    <span className="inline-flex w-fit items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                      {visibleResults.length} businesses
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-[1050px] w-full border-collapse text-left text-sm" aria-label="Competitor comparison table">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                        <tr>
                          <th scope="col" className="w-16 px-4 py-3 font-bold">#</th>
                          <th scope="col" className="min-w-48 px-4 py-3 font-bold">Business</th>
                          <th scope="col" className="min-w-32 px-4 py-3 font-bold">Category</th>
                          <th scope="col" className="min-w-28 px-4 py-3 font-bold">Distance</th>
                          <th scope="col" className="min-w-52 px-4 py-3 font-bold">Address</th>
                          <th scope="col" className="min-w-48 px-4 py-3 font-bold">Contact</th>
                          <th scope="col" className="min-w-44 px-4 py-3 font-bold">Opening hours</th>
                          <th scope="col" className="min-w-36 px-4 py-3 text-right font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visibleResults.map((business, displayIndex) => {
                          const originalIndex = results.indexOf(business);
                          const key = getBusinessKey(business, originalIndex);
                          const isSelected = activeBusinessId === key;
                          const sourceUrl = business.sourceUrl || (
                            business.osmId ? `https://www.openstreetmap.org/${business.osmId}` : null
                          );

                          return (
                            <tr
                              key={`comparison-${key}`}
                              className={`transition-colors ${isSelected ? "bg-teal-50" : "bg-white hover:bg-slate-50"}`}
                            >
                              <td className="px-4 py-3 align-top">
                                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-extrabold tabular-nums ${isSelected ? "border-amber-700 bg-amber-300 text-amber-950" : "border-teal-700 bg-teal-500 text-white"}`}>
                                  {displayIndex + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <p className="font-bold text-slate-900">{business.name || "Unnamed mapped business"}</p>
                                <p className="mt-1 text-[11px] text-slate-400">OSM record: {business.osmId || "ID unavailable"}</p>
                              </td>
                              <td className="px-4 py-3 align-top text-slate-700">{categoryLabel(business.category)}</td>
                              <td className="px-4 py-3 align-top whitespace-nowrap text-slate-700">
                                {business.distanceMeters != null ? distanceLabel(business.distanceMeters) : "Not available"}
                              </td>
                              <td className="px-4 py-3 align-top text-slate-600">
                                <span className="block max-w-64 whitespace-normal">{business.address || "Not listed in OpenStreetMap"}</span>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex max-w-52 flex-col gap-1.5">
                                  {business.phone ? (
                                    <a href={`tel:${String(business.phone).replace(/[^+\d]/g, "")}`} className="w-fit text-xs font-semibold text-teal-700 hover:underline">
                                      {business.phone}
                                    </a>
                                  ) : (
                                    <span className="text-xs text-slate-400">Phone not listed</span>
                                  )}
                                  {business.website ? (
                                    <a href={business.website} target="_blank" rel="noreferrer" className="max-w-48 truncate text-xs font-semibold text-teal-700 hover:underline" title={business.website}>
                                      Website
                                    </a>
                                  ) : (
                                    <span className="text-xs text-slate-400">Website not listed</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top text-xs leading-5 text-slate-600">
                                <span className="block max-w-48 whitespace-normal">{business.openingHours || "Not listed"}</span>
                              </td>
                              <td className="px-4 py-3 text-right align-top">
                                <div className="inline-flex flex-col items-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => selectBusiness(business, "table", originalIndex)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${isSelected ? "border-teal-600 bg-teal-600 text-white" : "border-teal-100 text-teal-700 hover:bg-teal-50"}`}
                                  >
                                    <Crosshair size={13} /> {isSelected ? "Selected" : "Locate on map"}
                                  </button>
                                  {sourceUrl && (
                                    <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-teal-700">
                                      Open OSM <ExternalLink size={11} />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] leading-5 text-slate-500">
                    Information is shown only when it is available in OpenStreetMap. Missing phone numbers, websites and opening hours are not inferred. Ratings and customer reviews are not provided by this data source.
                  </div>
                </section>
              )}

              {visibleResults.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleResults.map((business, index) => {
                    const key = getBusinessKey(business, results.indexOf(business));
                    return (
                      <BusinessCard
                        key={key}
                        index={results.indexOf(business)}
                        displayNumber={index + 1}
                        business={business}
                        isSelected={activeBusinessId === key}
                        onSelect={(selectedBusiness) => selectBusiness(selectedBusiness, "card", results.indexOf(selectedBusiness))}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                  No businesses match this category filter. Choose another category.
                </div>
              )}
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Data provider: {provider}.{" "}
              <a
                href={attributionUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-teal-700 hover:underline"
              >
                {attribution}
              </a>
            </p>
          </section>
        )}

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-teal-700">Your workspace</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-950">Recent competitor searches</h2>
            </div>
            <button
              type="button"
              onClick={loadHistory}
              disabled={historyLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-teal-200 hover:text-teal-700 disabled:opacity-60"
            >
              <RefreshCw size={14} className={historyLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {history.length ? (
            <div className="space-y-2">
              {history.slice(0, 5).map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">
                      {item.category} near {item.location_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {Number(item.radius_meters) >= 1000 ? `${Number(item.radius_meters) / 1000} km radius` : `${item.radius_meters} m radius`} · {item.result_count ?? 0} results · {formatDate(item.searched_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => usePreviousSearch(item)}
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-teal-100 px-3 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-50"
                  >
                    <History size={14} /> Use search
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              {historyLoading ? "Loading your saved searches..." : "Your saved competitor searches will appear here."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
