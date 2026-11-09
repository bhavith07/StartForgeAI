import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileText,
  Lightbulb,
  LoaderCircle,
  Rocket,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";

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

export default function IdeaForm() {
  const [form, setForm] = useState({
    startupName: "",
    idea: "",
    industry: "",
    audience: "",
    model: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // ANALYZE STARTUP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login before analyzing a startup.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/analyze",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const parsedResult =
        typeof response.data.analysis === "string"
          ? JSON.parse(response.data.analysis)
          : response.data.analysis;

      setResult(parsedResult);

      console.log("Analysis saved with ID:", response.data.analysisId);
    } catch (error) {
      console.error("Analysis error:", error);

      if (error.response?.status === 401) {
        alert("Your login session has expired. Please login again.");
        return;
      }

      alert(error.response?.data?.message || "Failed to analyze startup.");
    } finally {
      setLoading(false);
    }
  };

  // DOWNLOAD PDF - matches the full report exported from Analysis Details
  const downloadPDF = () => {
    if (!result) return;

    const analysis = {
      startup_name: form.startupName,
      industry: form.industry,
      audience: form.audience,
      business_model: form.model,
      idea: form.idea,
      startup_score: result.startupScore ?? result.startup_score,
      market_potential: result.marketPotential ?? result.market_potential,
      competition: result.competition,
      estimated_cost: result.estimatedCost ?? result.estimated_cost,
      target_market: result.targetMarket ?? result.target_market,
      growth_potential: result.growthPotential ?? result.growth_potential,
      market_challenges: result.marketChallenges ?? result.market_challenges,
      competitors: result.competitors,
      competitor_strengths: result.competitorStrengths ?? result.competitor_strengths,
      competitor_weaknesses: result.competitorWeaknesses ?? result.competitor_weaknesses,
      differentiation_opportunities:
        result.differentiationOpportunities ?? result.differentiation_opportunities,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
      created_at: new Date().toISOString(),
    };

    const asArray = (value) => {
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
    };

    const strengths = asArray(analysis.strengths);
    const weaknesses = asArray(analysis.weaknesses);
    const suggestions = asArray(analysis.suggestions);
    const marketChallenges = asArray(analysis.market_challenges);
    const competitors = asArray(analysis.competitors);
    const competitorStrengths = asArray(analysis.competitor_strengths);
    const competitorWeaknesses = asArray(analysis.competitor_weaknesses);
    const differentiationOpportunities = asArray(analysis.differentiation_opportunities);

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

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10";

  const selectClass =
    "mt-2 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10";

  return (
    <section id="idea-form" className="scroll-mt-24 bg-slate-50 px-5 py-20 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-800 shadow-sm">
            <Sparkles size={15} /> Your next big idea starts here
          </span>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Validate Your <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Startup</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Tell us about your idea. Get a structured view of its market,
            competition, costs and potential opportunities.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9"
          >
            <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Rocket size={22} />
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Startup details</h3>
                <p className="mt-0.5 text-sm text-slate-500">A few details help us prepare your analysis.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="startupName" className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Building2 size={16} className="text-teal-700" /> Startup name
                </label>
                <input
                  id="startupName"
                  type="text"
                  name="startupName"
                  placeholder="e.g. Foodzy"
                  value={form.startupName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="idea" className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Lightbulb size={16} className="text-teal-700" /> Describe your startup idea
                </label>
                <textarea
                  id="idea"
                  rows={5}
                  name="idea"
                  placeholder="What problem does your startup solve? How will your product or service work?"
                  value={form.idea}
                  onChange={handleChange}
                  required
                  className={`${inputClass} resize-y leading-7`}
                />
                <p className="mt-2 text-xs text-slate-400">Include the problem, your solution and who would use it.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="industry" className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <ChartNoAxesCombined size={16} className="text-teal-700" /> Industry
                  </label>
                  <select id="industry" name="industry" value={form.industry} onChange={handleChange} required className={selectClass}>
                    <option value="">Select industry</option>
                    <option>Education</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>E-Commerce</option>
                    <option>AI</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="audience" className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Users size={16} className="text-teal-700" /> Target audience
                  </label>
                  <select id="audience" name="audience" value={form.audience} onChange={handleChange} required className={selectClass}>
                    <option value="">Select audience</option>
                    <option>Students</option>
                    <option>Businesses</option>
                    <option>Professionals</option>
                    <option>General Public</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="model" className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Wallet size={16} className="text-teal-700" /> Business model
                  </label>
                  <select id="model" name="model" value={form.model} onChange={handleChange} required className={selectClass}>
                    <option value="">Select business model</option>
                    <option>SaaS</option>
                    <option>Subscription</option>
                    <option>Marketplace</option>
                    <option>Freemium</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" /> Analyzing your startup...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Analyze Startup <ArrowRight size={18} />
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">
                Your analysis will be saved to your dashboard.
              </p>
            </div>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                <Sparkles size={22} />
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-slate-900">What you'll explore</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Your report brings important startup considerations together in one place.</p>
              <div className="mt-5 space-y-4">
                {[
                  ["Market potential", "Understand the opportunity", ChartNoAxesCombined],
                  ["Competition", "Explore the competitive landscape", Target],
                  ["Estimated cost", "Review potential investment needs", CircleDollarSign],
                  ["Recommendations", "Identify possible next steps", BadgeCheck],
                ].map(([title, description, Icon]) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm">
                      <Icon size={16} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-800">{title}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileText size={17} className="text-teal-700" /> Keep your report
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Once analysis is complete, you can review the results and download a PDF report.
              </p>
            </div>
          </aside>
        </div>

        {loading && (
          <div className="mt-8 rounded-3xl border border-teal-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <LoaderCircle size={30} className="animate-spin" />
            </div>
            <h3 className="mt-5 text-xl font-extrabold text-slate-900">Analyzing your startup...</h3>
            <p className="mt-2 text-sm text-slate-500">Reviewing your market, competition and business potential.</p>
          </div>
        )}

        {result && !loading && (
          <div className="mt-12">
            <div className="mb-6 rounded-3xl border border-teal-100 bg-gradient-to-r from-white to-teal-50 p-7 shadow-sm sm:p-9">
              <p className="text-sm font-semibold text-teal-700">Your startup analysis is ready</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{form.startupName}</h2>
              <p className="mt-2 text-sm text-slate-500">Review your results below and download your report when you're ready.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">Startup Score</p>
                <p className="mt-3 text-5xl font-extrabold text-teal-700">{result.startupScore ?? "--"}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">out of 100</p>
                <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-teal-500 transition-all duration-1000" style={{ width: `${Math.max(0, Math.min(100, Number(result.startupScore) || 0))}%` }} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">📈 Market Potential</p>
                <p className="mt-4 text-lg font-bold leading-7 text-emerald-700">{result.marketPotential}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">⚔️ Competition</p>
                <p className="mt-4 text-lg font-bold leading-7 text-amber-700">{result.competition}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">💰 Estimated Cost</p>
                <p className="mt-4 text-lg font-bold leading-7 text-teal-700">{result.estimatedCost}</p>
              </div>
            </div>

            {[
              { title: "Strengths", items: result.strengths || [], icon: "✓", color: "text-emerald-700", iconColor: "text-emerald-600" },
              { title: "Weaknesses", items: result.weaknesses || [], icon: "!", color: "text-rose-700", iconColor: "text-rose-600" },
              { title: "AI Recommendations", items: result.suggestions || [], icon: "→", color: "text-teal-700", iconColor: "text-teal-700" },
            ].map((group) => (
              <section key={group.title} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h3 className={`text-xl font-extrabold ${group.color}`}>{group.title}</h3>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {group.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      <span className={`font-extrabold ${group.iconColor}`}>{group.icon}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="mt-8 text-center">
              <button
                onClick={downloadPDF}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-700"
              >
                <FileText size={19} /> Download Startup Report
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
