import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { jsPDF } from "jspdf";

import { useAuth } from "../context/AuthContext";

function asArray(value) {

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {

    try {

      const parsed = JSON.parse(value);

      return Array.isArray(parsed) ? parsed : [];

    } catch {

      return [];

    }

  }

  return [];

}

function displayValue(value, fallback = "Not available") {

  if (value === null || value === undefined || value === "") return fallback;

  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;

  if (typeof value === "object") return JSON.stringify(value);

  return String(value);

}

function getCompetitorName(competitor) {

  if (typeof competitor === "string") return competitor;

  return competitor?.name || competitor?.competitor || "Competitor";

}

function getCompetitorDescription(competitor) {

  if (typeof competitor === "string") return "";

  return competitor?.description || competitor?.overview || competitor?.summary || "";

}

function getCompetitorStrength(competitor) {

  if (typeof competitor === "string") return "";

  return competitor?.strength || competitor?.strengths || "";

}

function getCompetitorWeakness(competitor) {

  if (typeof competitor === "string") return "";

  return competitor?.weakness || competitor?.weaknesses || "";

}

export default function AnalysisDetails() {

  const { id } = useParams();

  const { token } = useAuth();

  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    let cancelled = false;

    async function loadAnalysis() {

      try {

        setLoading(true);

        setError("");

        if (!token) {

          navigate("/login");

          return;

        }

        const response = await fetch(

          `http://localhost:5000/api/analyze/${id}`,

          {

            method: "GET",

            headers: {

              Authorization: `Bearer ${token}`,

            },

          }

        );

        const data = await response.json();

        if (!response.ok) {

          throw new Error(data.message || "Failed to load analysis.");

        }

        if (!cancelled) setAnalysis(data.analysis);

      } catch (err) {

        console.error("Analysis details error:", err);

        if (!cancelled) setError(err.message || "Failed to load analysis.");

      } finally {

        if (!cancelled) setLoading(false);

      }

    }

    loadAnalysis();

    return () => {

      cancelled = true;

    };

  }, [id, token, navigate]);

  const strengths = asArray(analysis?.strengths);

  const weaknesses = asArray(analysis?.weaknesses);

  const suggestions = asArray(analysis?.suggestions);

  const marketChallenges = asArray(analysis?.market_challenges);

  const competitors = asArray(analysis?.competitors);

  const competitorStrengths = asArray(analysis?.competitor_strengths);

  const competitorWeaknesses = asArray(analysis?.competitor_weaknesses);

  const differentiationOpportunities = asArray(
    analysis?.differentiation_opportunities ??
    analysis?.differentiationOpportunities
  );

  const downloadPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const left = 18;
    const right = 18;
    const contentWidth = pageWidth - left - right;
    const bottom = pageHeight - 20;
    let y = 20;

    const colors = {
      ink: [25, 38, 56],
      muted: [100, 116, 139],
      cyan: [8, 145, 178],
      pale: [236, 254, 255],
      line: [226, 232, 240],
      green: [22, 163, 74],
      red: [220, 38, 38],
      amber: [217, 119, 6],
      purple: [126,  58, 242],
      white: [255, 255, 255],
    };

    const safeText = (value, fallback = "Not available") => {
      if (value === null || value === undefined || value === "") return fallback;
      if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    };

    const ensureSpace = (height = 12) => {
      if (y + height > bottom) {
        doc.addPage();
        y = 20;
      }
    };

    const addWrapped = (value, options = {}) => {
      const {
        x = left,
        width = contentWidth,
        fontSize = 10,
        color = colors.ink,
        bold = false,
        lineHeight = 5,
        after = 2,
      } = options;
      const text = safeText(value);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, width);
      lines.forEach((line) => {
        ensureSpace(lineHeight + 1);
        doc.text(line, x, y);
        y += lineHeight;
      });
      y += after;
    };

    const addSection = (title, color = colors.cyan) => {
      // Keep each section heading with enough room for its first content card.
      ensureSpace(38);
      y += 3;
      doc.setFillColor(...color);
      doc.roundedRect(left, y - 5, 2.2, 9, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...colors.ink);
      doc.text(title, left + 7, y + 1);
      y += 10;
      doc.setDrawColor(...colors.line);
      doc.setLineWidth(0.3);
      doc.line(left, y, pageWidth - right, y);
      y += 7;
    };

    const addLabelValue = (label, value) => {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.muted);
      doc.text(label.toUpperCase(), left, y);
      y += 4.5;
      addWrapped(value, { fontSize: 10, lineHeight: 5, after: 3 });
    };

    const normalizeListItem = (item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return [
          item.name || item.title || "",
          item.description || item.overview || "",
          item.strength ? `Strength: ${item.strength}` : "",
          item.weakness ? `Weakness: ${item.weakness}` : "",
        ].filter(Boolean).join(" — ") || JSON.stringify(item);
      }
      return String(item);
    };

    const addList = (items, accent = colors.cyan) => {
      const list = Array.isArray(items) ? items : [];
      if (!list.length) {
        addWrapped("No information available.", { color: colors.muted, after: 4 });
        return;
      }

      // If the complete list fits on one page, keep its cards together.
      // This avoids leaving the last card of a short section on a new page.
      const preparedItems = list.map((item, index) => {
        const text = normalizeListItem(item);
        const lines = doc.splitTextToSize(text, contentWidth - 18);
        const cardHeight = Math.max(12, 8 + lines.length * 4.8);
        return { index, text, lines, cardHeight };
      });
      const totalListHeight = preparedItems.reduce(
        (total, item) => total + item.cardHeight + 4,
        0
      );
      const usablePageHeight = bottom - 20;

      if (
        totalListHeight <= usablePageHeight &&
        y + totalListHeight > bottom
      ) {
        doc.addPage();
        y = 20;
      }

      preparedItems.forEach(({ index, lines, cardHeight }) => {
        // Each card is moved as a whole if it cannot fit in the remaining space.
        ensureSpace(cardHeight + 4);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(...colors.line);
        doc.roundedRect(left, y - 4, contentWidth, cardHeight, 2, 2, "FD");

        doc.setFillColor(...accent);
        doc.roundedRect(left + 3, y - 1, 9, 7, 1.5, 1.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...colors.white);
        doc.text(String(index + 1).padStart(2, "0"), left + 4.1, y + 3.8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...colors.ink);
        doc.text(lines, left + 17, y + 1);
        y += cardHeight + 4;
      });
    };

    // Cover / report header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 48, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(103, 232, 249);
    doc.text("STARTFORGE AI", left, 17);
    doc.setFontSize(21);
    doc.setTextColor(...colors.white);
    doc.text("Startup Analysis Report", left, 29);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text("AI-assisted startup assessment", left, 37);

    y = 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(...colors.ink);
    const startupName = safeText(analysis.startup_name, "Untitled Startup");
    doc.text(doc.splitTextToSize(startupName, contentWidth), left, y);
    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    const analyzedAt = analysis.created_at
      ? new Date(analysis.created_at).toLocaleString()
      : "Date not available";
    doc.text(`${safeText(analysis.industry, "Industry not specified")}  |  Analyzed ${analyzedAt}`, left, y);
    y += 10;

    // Score panel
    ensureSpace(25);
    doc.setFillColor(...colors.pale);
    doc.setDrawColor(165, 243, 252);
    doc.roundedRect(left, y - 4, contentWidth, 21, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text("STARTUP SCORE", left + 6, y + 4);
    doc.setFontSize(18);
    doc.setTextColor(...colors.cyan);
    doc.text(`${safeText(analysis.startup_score, "--")} / 100`, left + 6, y + 13);
    y += 27;

    addSection("Startup Information");
    addLabelValue("Target Audience", analysis.audience);
    addLabelValue("Business Model", analysis.business_model);
    addLabelValue("Startup Idea", analysis.idea);

    addSection("Core Assessment");
    addLabelValue("Market Potential", analysis.market_potential);
    addLabelValue("Competition", analysis.competition);
    addLabelValue("Estimated Cost", analysis.estimated_cost);

    addSection("Market Analysis");
    addLabelValue("Target Market", analysis.target_market);
    addLabelValue("Growth Potential", analysis.growth_potential);
    addSection("Market Challenges", colors.amber);
    addList(marketChallenges, colors.amber);

    addSection("Competitor Analysis", colors.purple);
    if (competitors.length) {
      competitors.forEach((competitor, index) => {
        ensureSpace(22);
        const name = getCompetitorName(competitor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...colors.purple);
        doc.text(`${index + 1}. ${name}`, left, y);
        y += 6;
        const description = getCompetitorDescription(competitor);
        const strength = getCompetitorStrength(competitor);
        const weakness = getCompetitorWeakness(competitor);
        if (description) addWrapped(description, { fontSize: 9.5, after: 2 });
        if (strength) addWrapped(strength, { fontSize: 9, color: colors.green, after: 2 });
        if (weakness) addWrapped(weakness, { fontSize: 9, color: colors.red, after: 5 });
      });
    } else {
      addWrapped("No competitor details available.", { color: colors.muted });
    }

    addSection("Competitor Strengths", colors.green);
    addList(competitorStrengths, colors.green);

    addSection("Competitor Weaknesses", colors.red);
    addList(competitorWeaknesses, colors.red);

    addSection("Differentiation Opportunities", colors.cyan);
    addList(differentiationOpportunities, colors.cyan);

    addSection("Startup Strengths", colors.green);
    addList(strengths, colors.green);

    addSection("Startup Weaknesses", colors.red);
    addList(weaknesses, colors.red);

    addSection("AI Recommendations", colors.purple);
    addList(suggestions, colors.purple);

    // Consistent footer and page numbering on every page.
    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(...colors.line);
      doc.setLineWidth(0.3);
      doc.line(left, pageHeight - 13, pageWidth - right, pageHeight - 13);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text("Generated by StartForge AI", left, pageHeight - 8);
      doc.text(`Page ${page} of ${totalPages}`, pageWidth - right, pageHeight - 8, {
        align: "right",
      });
    }

    const fileName = (analysis.startup_name || "Startup")
      .trim()
      .replace(/[^\w-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "Startup";
    doc.save(`${fileName}-Startup-Report.pdf`);
  };

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-6">

        <div className="text-center">

          <div className="w-14 h-14 mx-auto border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />

          <p className="text-slate-600 mt-6">Loading startup analysis...</p>

        </div>

      </div>

    );

  }

  if (error) {

    return (

      <div className="min-h-screen bg-slate-50 text-slate-900 px-6 py-24">

        <div className="max-w-3xl mx-auto">

          <button

            onClick={() => navigate("/dashboard")}

            className="text-teal-700 hover:text-teal-800 mb-8"

          >

            ← Back to Dashboard

          </button>

          <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-8">

            <h1 className="text-2xl font-bold text-red-400">

              Unable to load analysis

            </h1>

            <p className="text-slate-700 mt-3">{error}</p>

          </div>

        </div>

      </div>

    );

  }

  if (!analysis) {

    return (

      <div className="min-h-screen bg-slate-50 text-slate-900 px-6 py-24">

        <div className="max-w-3xl mx-auto text-center">

          <h1 className="text-3xl font-bold">Analysis not found</h1>

          <button

            onClick={() => navigate("/dashboard")}

            className="mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl"

          >

            Back to Dashboard

          </button>

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-slate-50 text-slate-900 px-6 py-24">

      <div className="max-w-6xl mx-auto">

        <button

          onClick={() => navigate("/dashboard")}

          className="text-teal-700 hover:text-teal-800 transition mb-8"

        >

          ← Back to Dashboard

        </button>

        <section className="bg-white border border-teal-100 rounded-3xl p-8 md:p-10">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            <div>

              <p className="text-teal-700 font-semibold">Startup Analysis Report</p>

              <h1 className="text-4xl md:text-5xl font-bold mt-3">

                {analysis.startup_name}

              </h1>

              <p className="text-slate-600 text-lg mt-3">

                {analysis.industry || "Industry not specified"}

              </p>

              {analysis.created_at && (

                <p className="text-slate-500 text-sm mt-3">

                  Analyzed on {new Date(analysis.created_at).toLocaleString()}

                </p>

              )}

            </div>

            <div className="min-w-44 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-10 py-6 text-center shadow-lg shadow-teal-900/10">

              <p className="text-sm font-bold uppercase tracking-wider text-teal-800">Startup Score</p>

              <p className="mt-2 text-6xl font-extrabold leading-none text-teal-700">

                {analysis.startup_score ?? "--"}

              </p>

              <p className="mt-2 text-sm font-semibold text-slate-600">out of 100</p>

            </div>

          </div>

        </section>

        <section className="mt-8 bg-white border border-slate-200 rounded-3xl p-8">

          <h2 className="text-2xl font-bold">Startup Information</h2>

          <div className="grid md:grid-cols-3 gap-5 mt-6">

            <InfoCard label="Target Audience" value={analysis.audience || "Not specified"} />

            <InfoCard label="Business Model" value={analysis.business_model || "Not specified"} />

            <InfoCard label="Industry" value={analysis.industry || "Not specified"} />

          </div>

          <div className="mt-6 bg-slate-50 rounded-xl p-6">

            <p className="text-slate-600">Startup Idea</p>

            <p className="text-slate-700 text-lg leading-8 mt-3">

              {analysis.idea || "No startup idea provided."}

            </p>

          </div>

        </section>

        <div className="grid md:grid-cols-3 gap-6 mt-8">

          <MetricCard label="📈 Market Potential" value={analysis.market_potential} color="green" />

          <MetricCard label="⚔️ Competition" value={analysis.competition} color="yellow" />

          <MetricCard label="💰 Estimated Cost" value={analysis.estimated_cost} color="cyan" />

        </div>

        <section className="mt-8 bg-white border border-teal-100 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-teal-700">📊 Market Analysis</h2>

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <div className="bg-slate-50 rounded-xl p-6">

              <p className="text-slate-600">Target Market</p>

              <p className="text-gray-100 leading-7 mt-3">

                {displayValue(analysis.target_market)}

              </p>

            </div>

            <div className="bg-slate-50 rounded-xl p-6">

              <p className="text-slate-600">Growth Potential</p>

              <p className="text-gray-100 leading-7 mt-3">

                {displayValue(analysis.growth_potential)}

              </p>

            </div>

          </div>

          <div className="mt-6">

            <h3 className="text-xl font-bold text-amber-300">Market Challenges</h3>

            <InsightCardList items={marketChallenges} emptyText="No market challenges available." accent="amber" />

          </div>

        </section>

        <section className="mt-8 bg-white border border-purple-500/30 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-purple-300">🏢 Competitor Analysis</h2>

          <p className="text-slate-600 mt-2">

            Competitors identified for this startup idea and their reported positioning.

          </p>

          {competitors.length ? (

            <div className="grid md:grid-cols-2 gap-5 mt-6">

              {competitors.map((competitor, index) => (

                <div

                  key={`${getCompetitorName(competitor)}-${index}`}

                  className="bg-slate-50 border border-slate-200 rounded-2xl p-6"

                >

                  <h3 className="text-xl font-bold text-slate-900">

                    {getCompetitorName(competitor)}

                  </h3>

                  {getCompetitorDescription(competitor) && (

                    <p className="text-slate-700 leading-7 mt-3">

                      {getCompetitorDescription(competitor)}

                    </p>

                  )}

                  {getCompetitorStrength(competitor) && (

                    <div className="mt-4">

                      <p className="text-green-400 font-semibold">Strength</p>

                      <p className="text-slate-700 mt-1">

                        {displayValue(getCompetitorStrength(competitor))}

                      </p>

                    </div>

                  )}

                  {getCompetitorWeakness(competitor) && (

                    <div className="mt-4">

                      <p className="text-red-400 font-semibold">Weakness</p>

                      <p className="text-slate-700 mt-1">

                        {displayValue(getCompetitorWeakness(competitor))}

                      </p>

                    </div>

                  )}

                </div>

              ))}

            </div>

          ) : (

            <p className="text-slate-600 mt-5">No competitor details available.</p>

          )}

          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <div>

              <h3 className="text-xl font-bold text-green-400">Competitor Strengths</h3>

              <InsightCardList items={competitorStrengths} emptyText="No competitor strengths available." accent="green" />

            </div>

            <div>

              <h3 className="text-xl font-bold text-red-400">Competitor Weaknesses</h3>

              <InsightCardList items={competitorWeaknesses} emptyText="No competitor weaknesses available." accent="red" />

            </div>

          </div>

        </section>

        <section className="mt-8 bg-white border border-teal-100 rounded-3xl p-8 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-teal-700 text-sm font-semibold uppercase tracking-wider">
                Stand out from competitors
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                💡 Differentiation Opportunities
              </h2>
              <p className="text-slate-600 mt-2">
                Practical ways to make this startup distinct from existing alternatives.
              </p>
            </div>
            <span className="self-start sm:self-center rounded-full border border-teal-100 bg-teal-600/10 px-4 py-2 text-sm font-semibold text-cyan-300">
              {differentiationOpportunities.length} opportunities
            </span>
          </div>

          {differentiationOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7">
              {differentiationOpportunities.map((opportunity, index) => {
                const opportunityText =
                  typeof opportunity === "string"
                    ? opportunity
                    : opportunity && typeof opportunity === "object"
                      ? opportunity.description ||
                        opportunity.title ||
                        opportunity.name ||
                        JSON.stringify(opportunity)
                      : String(opportunity);

                return (
                  <article
                    key={`${index}-${opportunityText.slice(0, 24)}`}
                    className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/60 hover:bg-slate-50/90"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold tracking-tight text-teal-700/80">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600/10 text-cyan-300">
                        ✦
                      </span>
                    </div>
                    <div className="mt-6 h-1 w-12 rounded-full bg-cyan-400 transition-all duration-300 group-hover:w-20" />
                    <p className="mt-5 text-base leading-7 text-slate-700">
                      {opportunityText}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
              No differentiation opportunities available.
            </p>
          )}
        </section>

        <section className="mt-8 bg-white border border-green-500/30 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-green-400">✅ Strengths</h2>

          <ItemList items={strengths} emptyText="No strengths available." numbered />

        </section>

        <section className="mt-8 bg-white border border-red-500/30 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-red-400">❌ Weaknesses</h2>

          <ItemList items={weaknesses} emptyText="No weaknesses available." numbered />

        </section>

        <section className="mt-8 bg-white border border-teal-100 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-teal-700">💡 AI Recommendations</h2>

          <ItemList items={suggestions} emptyText="No recommendations available." numbered />

        </section>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">

          <button

            onClick={() => navigate("/dashboard")}

            className="border border-cyan-500 text-teal-700 hover:bg-teal-600 hover:text-white px-8 py-4 rounded-xl font-bold transition"

          >

            ← Back to Dashboard

          </button>

          <button

            onClick={downloadPDF}

            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-bold transition"

          >

            📄 Download Report

          </button>

          <button

            onClick={() => navigate("/")}

            className="bg-slate-50 hover:bg-slate-700 border border-slate-200 text-slate-900 px-8 py-4 rounded-xl font-bold transition"

          >

            🚀 Analyze Another Startup

          </button>

        </div>

      </div>

    </div>

  );

}


function InsightCardList({ items, emptyText, accent = "cyan" }) {
  const accents = {
    amber: {
      border: "border-amber-500/20 hover:border-amber-400/50",
      number: "text-amber-300",
      glow: "bg-amber-400/10",
      line: "bg-amber-400",
    },
    green: {
      border: "border-green-500/20 hover:border-green-400/50",
      number: "text-green-300",
      glow: "bg-green-400/10",
      line: "bg-green-400",
    },
    red: {
      border: "border-red-500/20 hover:border-red-400/50",
      number: "text-red-300",
      glow: "bg-red-400/10",
      line: "bg-red-400",
    },
  };

  const style = accents[accent] || {
    border: "border-cyan-500/20 hover:border-cyan-400/50",
    number: "text-cyan-300",
    glow: "bg-cyan-400/10",
    line: "bg-cyan-400",
  };

  if (!items?.length) {
    return (
      <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-5">
      {items.map((item, index) => {
        const text =
          typeof item === "string"
            ? item
            : item && typeof item === "object"
              ? [
                  item.name || item.title || "",
                  item.description || item.overview || "",
                  item.strength ? `Strength: ${item.strength}` : "",
                  item.weakness ? `Weakness: ${item.weakness}` : "",
                ].filter(Boolean).join(" — ") || JSON.stringify(item)
              : String(item);

        return (
          <article
            key={`${index}-${text.slice(0, 24)}`}
            className={`group relative overflow-hidden rounded-2xl border ${style.border} bg-slate-50 p-5 transition duration-300 hover:-translate-y-0.5`}
          >
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${style.glow}`} />
            <div className="relative flex items-start gap-4">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.glow} ${style.number} text-sm font-extrabold`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className={`mb-3 h-1 w-9 rounded-full ${style.line} transition-all duration-300 group-hover:w-14`} />
                <p className="leading-7 text-slate-700">{text}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function InfoCard({ label, value }) {

  return (

    <div className="bg-slate-50 rounded-xl p-5">

      <p className="text-slate-600">{label}</p>

      <p className="text-lg font-semibold mt-2">{value}</p>

    </div>

  );

}

function MetricCard({ label, value, color }) {

  const colorClasses = {

    green: "border-green-500/30 text-green-400",

    yellow: "border-yellow-500/30 text-yellow-400",

    cyan: "border-teal-100 text-teal-700",

  };

  return (

    <div className={`bg-white border ${colorClasses[color] || colorClasses.cyan} rounded-2xl p-7`}>

      <p className="text-slate-600">{label}</p>

      <p className={`text-xl font-semibold leading-8 mt-4 ${colorClasses[color]?.split(" ").slice(-1)[0] || "text-teal-700"}`}>

        {displayValue(value)}

      </p>

    </div>

  );

}

function ItemList({ items, emptyText, numbered = false }) {

  if (!items.length) {

    return <p className="text-slate-600 mt-4">{emptyText}</p>;

  }

  return (

    <div className="grid md:grid-cols-2 gap-4 mt-5">

      {items.map((item, index) => {

        const text =

          typeof item === "string"

            ? item

            : item && typeof item === "object"

              ? [

                  item.name || "",

                  item.description || item.overview || "",

                  item.strength ? `Strength: ${item.strength}` : "",

                  item.weakness ? `Weakness: ${item.weakness}` : "",

                ].filter(Boolean).join(" — ") || JSON.stringify(item)

              : String(item);

        return (

          <div

            key={`${index}-${text.slice(0, 24)}`}

            className="bg-slate-50 rounded-xl p-5"

          >

            {numbered && (

              <span className="text-teal-700 font-bold mr-2">{index + 1}.</span>

            )}

            <span className="text-slate-700 leading-7">{text}</span>

          </div>

        );

      })}

    </div>

  );

}
