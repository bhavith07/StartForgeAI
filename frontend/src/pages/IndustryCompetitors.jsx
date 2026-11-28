import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, ArrowUpRight, Building2, Globe2, LoaderCircle, Search, ShieldCheck, Sparkles, Target } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function IndustryCompetitors() {
  const { token } = useAuth();
  const [idea, setIdea] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetMarket, setTargetMarket] = useState("India");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  async function handleSearch(event) {
    event.preventDefault();
    setError("");
    setReport(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/competitors/industry-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idea, industry, targetMarket }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Industry research failed.");
      setReport(data.research);
    } catch (err) {
      setError(err.message || "Unable to research competitors right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_rgba(20,184,166,0.13),_transparent_38%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.10),_transparent_35%),#f3f6fb] px-4 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#142b43] via-[#14545a] to-[#087f75] p-7 text-white shadow-[0_18px_55px_-25px_rgba(8,127,117,.65)] sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute right-28 top-24 h-44 w-44 rounded-full border border-teal-200/15" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-100"><Globe2 size={14}/> Industry intelligence</span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">Discover competitors beyond your neighbourhood.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-teal-50 sm:text-base">Research companies and products competing in your industry, whether they operate locally, nationally or online across the world.</p>
          </div>
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(300px,390px)_1fr]">
          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><Search size={21}/></span>
              <div><h2 className="font-bold text-slate-900">Research your market</h2><p className="text-xs text-slate-500">Describe the business you plan to build</p></div>
            </div>
            <form onSubmit={handleSearch} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Startup idea
                <textarea required minLength={12} maxLength={1200} value={idea} onChange={(e)=>setIdea(e.target.value)} placeholder="Example: An online platform that helps small restaurants manage orders, inventory and delivery..." className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"/>
              </label>
              <label className="block text-sm font-semibold text-slate-700">Industry / category
                <input required maxLength={120} value={industry} onChange={(e)=>setIndustry(e.target.value)} placeholder="e.g. Restaurant technology, EdTech, FinTech" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"/>
              </label>
              <label className="block text-sm font-semibold text-slate-700">Target market
                <input maxLength={180} value={targetMarket} onChange={(e)=>setTargetMarket(e.target.value)} placeholder="e.g. India, Karnataka, Global" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"/>
              </label>
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 px-4 py-3 font-bold text-white shadow-lg shadow-teal-700/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <><LoaderCircle className="animate-spin" size={18}/> Researching companies...</> : <><Sparkles size={17}/> Find industry competitors</>}
              </button>
            </form>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-500"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-teal-600"/> Live search sources are used when available. If unavailable, results are clearly labelled unverified AI suggestions.</p>
          </section>

          <section className="min-w-0">
            {error && <div role="alert" className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle size={18} className="mt-0.5 shrink-0"/>{error}</div>}
            {!report && !loading && <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/75 p-8 text-center"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Building2 size={28}/></span><h2 className="mt-5 text-xl font-bold text-slate-900">Your competitor landscape starts here</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Enter your startup idea, industry and target market. StartForge will research relevant companies and show what can be verified from available sources.</p></div>}
            {loading && <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center"><LoaderCircle size={34} className="animate-spin text-teal-600"/><h2 className="mt-4 text-lg font-bold text-slate-900">Researching the industry</h2><p className="mt-2 text-sm text-slate-500">Checking company websites and published information. This may take a little while.</p></div>}
            {report && <div className="space-y-5">
              {report.evidenceStatus && <div role="status" className={`rounded-2xl border p-4 text-sm font-semibold ${report.sources.length ? "border-teal-200 bg-teal-50 text-teal-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{report.evidenceStatus}</div>}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-extrabold text-slate-900">Market overview</h2><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{report.competitors.length} companies</span></div><p className="mt-3 text-sm leading-7 text-slate-700">{report.overview}</p></div>
              <div className="grid gap-4 md:grid-cols-2">
                {report.competitors.map((company,index)=><article key={company.name+index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Competitor {index+1}</p><h3 className="mt-1 text-lg font-extrabold text-slate-900">{company.name}</h3></div><Building2 className="shrink-0 text-slate-400" size={20}/></div><p className="mt-3 text-sm leading-6 text-slate-600">{company.description}</p><div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs leading-5"><p><strong className="text-slate-800">Customers:</strong> {company.targetCustomers}</p><p><strong className="text-slate-800">Geography:</strong> {company.geography}</p><p><strong className="text-slate-800">Positioning:</strong> {company.differentiation}</p><p className="text-slate-500">{company.evidence}</p></div>{company.website && <a href={company.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline">Official website <ArrowUpRight size={14}/></a>}</article>)}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5"><h3 className="flex items-center gap-2 font-bold text-emerald-900"><Target size={17}/> Potential opportunities</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-950">{report.opportunities.map((item,i)=><li key={i}>• {item}</li>)}</ul></div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5"><h3 className="font-bold text-amber-900">Research limitations</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950">{report.caveats.map((item,i)=><li key={i}>• {item}</li>)}</ul></div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-900">Research sources</h3>{report.sources.length ? <ul className="mt-3 space-y-2">{report.sources.map((source,i)=><li key={source.url} className="text-sm"><a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-teal-700 hover:underline">{source.title}<ArrowUpRight size={13}/></a></li>)}</ul> : <p className="mt-2 text-sm text-slate-500">The provider did not return source links for this response. Treat company details as unverified until independently checked.</p>}<p className="mt-4 text-[11px] leading-5 text-slate-500">{report.notice}</p></div>
            </div>}
          </section>
        </div>
      </div>
    </main>
  );
}
