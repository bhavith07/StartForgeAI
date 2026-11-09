import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChartNoAxesCombined,
  Clock3,
  FileSearch,
  Lightbulb,
  Plus,
  Rocket,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

function scoreTone(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return "text-slate-500 bg-slate-100";
  if (value >= 70) return "text-emerald-700 bg-emerald-50";
  if (value >= 40) return "text-amber-700 bg-amber-50";
  return "text-rose-700 bg-rose-50";
}

function SummaryCard({ icon: Icon, label, value, detail, tint = "teal" }) {
  const tints = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 max-w-full truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
          {detail && <p className="mt-2 text-xs text-slate-500">{detail}</p>}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tints[tint] || tints.teal}`}>
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    async function loadAnalyses() {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/analyze/history", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load analysis history.");
        }

        setAnalyses(data.analyses || []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message || "Something went wrong while loading your analyses.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalyses();
  }, [token, navigate]);

  const latestAnalysis = analyses[0];

  const scoredAnalyses = analyses.filter((item) => {
    const score = Number(item.startup_score);
    return item.startup_score !== null && item.startup_score !== undefined && Number.isFinite(score);
  });

  const averageScore = scoredAnalyses.length
    ? Math.round(scoredAnalyses.reduce((sum, item) => sum + Number(item.startup_score), 0) / scoredAnalyses.length)
    : null;

  const highestScoringStartup = scoredAnalyses.reduce((best, item) => {
    if (!best || Number(item.startup_score) > Number(best.startup_score)) return item;
    return best;
  }, null);

  const scoreDistribution = [
    { label: "Needs work", range: "0–39", count: scoredAnalyses.filter((item) => Number(item.startup_score) < 40).length, color: "bg-rose-500" },
    { label: "Promising", range: "40–69", count: scoredAnalyses.filter((item) => Number(item.startup_score) >= 40 && Number(item.startup_score) < 70).length, color: "bg-amber-500" },
    { label: "Strong", range: "70–100", count: scoredAnalyses.filter((item) => Number(item.startup_score) >= 70).length, color: "bg-emerald-500" },
  ];

  const industries = [...new Set(
    analyses
      .map((item) => item.industry?.trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const industryCounts = analyses.reduce((counts, item) => {
    const industry = item.industry?.trim() || "Unspecified";
    counts[industry] = (counts[industry] || 0) + 1;
    return counts;
  }, {});
  const industryDistribution = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxIndustryCount = Math.max(1, ...industryDistribution.map(([, count]) => count));

  const filteredAnalyses = analyses
    .filter((analysis) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        analysis.startup_name?.toLowerCase().includes(query) ||
        analysis.industry?.toLowerCase().includes(query);
      const matchesIndustry =
        industryFilter === "all" || analysis.industry === industryFilter;
      return matchesSearch && matchesIndustry;
    })
    .sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortOrder === "score-high") {
        return Number(b.startup_score ?? -1) - Number(a.startup_score ?? -1);
      }
      if (sortOrder === "score-low") {
        return Number(a.startup_score ?? 101) - Number(b.startup_score ?? 101);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  return (
    <main className="min-h-screen bg-slate-50 px-5 pb-16 pt-28 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Welcome header */}
        <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-white to-teal-50 p-7 shadow-sm sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal-100/70 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-28 w-28 rounded-full bg-cyan-100/60 blur-2xl" />

          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
                <Sparkles size={14} /> Founder workspace
              </div>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Welcome back, {user?.name || "Founder"} <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                Your startup ideas, insights and analysis reports — all in one place.
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-700"
            >
              <Plus size={18} /> Analyze New Startup
            </button>
          </div>
        </section>

        {/* Overview cards */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            icon={BarChart3}
            label="Total analyses"
            value={analyses.length}
            detail="Startup ideas evaluated"
            tint="teal"
          />
          <SummaryCard
            icon={Lightbulb}
            label="Latest startup"
            value={latestAnalysis?.startup_name || "No analyses yet"}
            detail={latestAnalysis?.industry || "Your next idea starts here"}
            tint="blue"
          />
          <SummaryCard
            icon={Target}
            label="Latest score"
            value={latestAnalysis?.startup_score ?? "--"}
            detail={latestAnalysis ? "Out of 100 points" : "No score available yet"}
            tint="violet"
          />
        </section>

        {/* Latest analysis spotlight */}
        {latestAnalysis && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-6 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-teal-700">
                  <Sparkles size={16} /> Latest analysis
                </div>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                  {latestAnalysis.startup_name}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                    {latestAnalysis.industry || "Industry not specified"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} /> {formatDate(latestAnalysis.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-teal-50 px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Startup score</p>
                  <p className="mt-1 text-4xl font-extrabold leading-none text-teal-700">
                    {latestAnalysis.startup_score ?? "--"}
                    <span className="ml-1 text-sm font-semibold text-slate-500">/100</span>
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                  <ChartNoAxesCombined size={22} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 bg-slate-50/70 p-6 sm:grid-cols-3 sm:p-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <ChartNoAxesCombined size={17} className="text-emerald-600" /> Market potential
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-800">
                  {latestAnalysis.market_potential || "Not available"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Target size={17} className="text-amber-600" /> Competition
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-800">
                  {latestAnalysis.competition || "Not available"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Wallet size={17} className="text-teal-700" /> Estimated cost
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-800">
                  {latestAnalysis.estimated_cost || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-4 sm:px-8">
              <button
                onClick={() => navigate(`/dashboard/analysis/${latestAnalysis.id}`)}
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition hover:text-teal-900"
              >
                View full report <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {/* Analytics overview */}
        {!loading && !error && analyses.length > 0 && (
          <section className="mt-10">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">At a glance</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Your startup analytics
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                A quick overview of the scores and industries across your saved analyses.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">Average startup score</p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <ChartNoAxesCombined size={20} />
                  </span>
                </div>
                <p className="mt-4 text-4xl font-extrabold tracking-tight text-teal-700">
                  {averageScore ?? "--"}
                  <span className="ml-1 text-base font-semibold text-slate-400">/100</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Calculated from {scoredAnalyses.length} {scoredAnalyses.length === 1 ? "scored report" : "scored reports"}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">Highest-scoring startup</p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Target size={20} />
                  </span>
                </div>
                {highestScoringStartup ? (
                  <>
                    <p className="mt-4 truncate text-xl font-extrabold text-slate-900">
                      {highestScoringStartup.startup_name || "Untitled startup"}
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-emerald-700">
                      {highestScoringStartup.startup_score}<span className="ml-1 text-sm font-semibold text-slate-400">/100</span>
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No scored reports yet.</p>
                )}
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">Industries explored</p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                    <Lightbulb size={20} />
                  </span>
                </div>
                <p className="mt-4 text-4xl font-extrabold text-slate-900">{Object.keys(industryCounts).length}</p>
                <p className="mt-2 text-xs text-slate-500">Different industry categories in your reports</p>
              </article>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Score distribution</h3>
                    <p className="mt-1 text-xs text-slate-500">Reports grouped by score range</p>
                  </div>
                  <BarChart3 className="text-teal-700" size={20} />
                </div>
                <div className="space-y-5">
                  {scoreDistribution.map((group) => {
                    const percentage = scoredAnalyses.length
                      ? (group.count / scoredAnalyses.length) * 100
                      : 0;
                    return (
                      <div key={group.label}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-700">{group.label} <span className="font-normal text-slate-400">({group.range})</span></span>
                          <span className="font-bold tabular-nums text-slate-700">{group.count}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${group.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Analyses by industry</h3>
                    <p className="mt-1 text-xs text-slate-500">Your most explored categories</p>
                  </div>
                  <ChartNoAxesCombined className="text-teal-700" size={20} />
                </div>
                {industryDistribution.length ? (
                  <div className="space-y-4">
                    {industryDistribution.map(([industry, count]) => (
                      <div key={industry}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="truncate font-semibold text-slate-700">{industry}</span>
                          <span className="shrink-0 text-xs font-bold text-slate-500">{count}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                            style={{ width: `${(count / maxIndustryCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No industry information available.</p>
                )}
              </article>
            </div>
          </section>
        )}

        {/* Analysis history */}
        <section className="mt-10">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">Your workspace</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Analysis history
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Search, filter and revisit your previously evaluated startup ideas.
              </p>
            </div>
            {!loading && !error && analyses.length > 0 && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                <FileSearch size={14} /> {filteredAnalyses.length} of {analyses.length} reports
              </span>
            )}
          </div>

          {!loading && !error && analyses.length > 0 && (
            <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)]">
              <label className="relative block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Search reports</span>
                <span className="pointer-events-none absolute bottom-3.5 left-3 text-slate-400">
                  <FileSearch size={17} />
                </span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search startup name or industry..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Industry</span>
                <select
                  value={industryFilter}
                  onChange={(event) => setIndustryFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                >
                  <option value="all">All industries</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Sort by</span>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="score-high">Highest score</option>
                  <option value="score-low">Lowest score</option>
                </select>
              </label>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
              <p className="mt-5 text-sm font-medium text-slate-500">Loading your analyses...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && analyses.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Rocket size={30} />
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-slate-900">No startup analyses yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your reports will appear here after you analyse your first startup idea.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
              >
                <Plus size={17} /> Analyze your first startup
              </button>
            </div>
          )}

          {!loading && !error && analyses.length > 0 && filteredAnalyses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FileSearch size={23} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">No matching reports</h3>
              <p className="mt-1 text-sm text-slate-500">Try a different search term or industry filter.</p>
              <button
                onClick={() => { setSearchTerm(""); setIndustryFilter("all"); setSortOrder("newest"); }}
                className="mt-4 text-sm font-bold text-teal-700 hover:text-teal-900"
              >
                Clear filters
              </button>
            </div>
          )}

          {!loading && !error && analyses.length > 0 && filteredAnalyses.length > 0 && (
            <div className="space-y-3">
              {filteredAnalyses.map((analysis) => (
                <article
                  key={analysis.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-bold text-slate-900">
                          {analysis.startup_name || "Untitled startup"}
                        </h3>
                        {analysis.id === latestAnalysis?.id && (
                          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {analysis.industry || "Industry not specified"}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock3 size={13} /> {formatDate(analysis.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className={`min-w-20 rounded-xl px-4 py-2 text-center ${scoreTone(analysis.startup_score)}`}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Score</p>
                        <p className="mt-0.5 text-2xl font-extrabold leading-none">
                          {analysis.startup_score ?? "--"}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/dashboard/analysis/${analysis.id}`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                      >
                        View report <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
