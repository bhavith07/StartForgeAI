import { useNavigate } from "react-router-dom";
import {
  ArrowRight, BarChart3, MapPinned, FileText, ShieldCheck,
  TrendingUp, Search, Sparkles, CheckCircle2
} from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();
  const scrollToFeatures = () =>
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section className="relative isolate overflow-hidden bg-[#f3f7f6] px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_20%,rgba(13,148,136,0.15),transparent_34%),radial-gradient(circle_at_8%_10%,rgba(132,204,22,0.10),transparent_26%)]" />
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-teal-800 shadow-sm">
            <Sparkles size={14} /> STARTUP RESEARCH, MADE CLEARER
          </div>
          <h1 className="text-4xl font-bold leading-[1.06] tracking-[-0.04em] text-[#102b3b] sm:text-5xl lg:text-[4.15rem]">
            Turn your startup idea into a <span className="text-teal-700">clearer plan.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            StartForge AI brings startup idea assessment, local competitor discovery and research reports together, helping founders understand what to investigate before taking the next step.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 rounded-xl bg-[#087f75] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-[#066b64]">
              Explore your workspace <ArrowRight size={17} />
            </button>
            <button onClick={scrollToFeatures} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50">
              Discover features
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-700" /> Idea assessment</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-700" /> Local competitor research</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-700" /> Saved reports</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[650px] lg:justify-self-end">
          <div className="absolute -inset-5 -z-10 rounded-[34px] bg-gradient-to-br from-teal-200/60 via-white to-lime-100/70 blur-xl" />
          <div className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-38px_rgba(15,45,55,0.45)]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#fbfdfd] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white"><BarChart3 size={18} /></span>
                <div><p className="text-sm font-bold text-slate-900">Founder overview</p><p className="text-[11px] text-slate-500">Your research workspace</p></div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Workspace</span>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-[#f5f8f8] p-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[11px] font-medium text-slate-500">Idea assessments</p><div className="mt-3 flex items-end justify-between"><span className="text-2xl font-bold text-slate-900">Reports</span><FileText className="text-teal-700" size={19} /></div><p className="mt-1 text-[10px] text-slate-400">Organised in one place</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[11px] font-medium text-slate-500">Market research</p><div className="mt-3 flex items-end justify-between"><span className="text-2xl font-bold text-slate-900">Insights</span><TrendingUp className="text-blue-700" size={19} /></div><p className="mt-1 text-[10px] text-slate-400">Potential and risks</p></div>
              <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-1"><p className="text-[11px] font-medium text-slate-500">Local discovery</p><div className="mt-3 flex items-end justify-between"><span className="text-2xl font-bold text-slate-900">Places</span><MapPinned className="text-orange-600" size={19} /></div><p className="mt-1 text-[10px] text-slate-400">Mapped around an area</p></div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-bold text-slate-900">Research toolkit</p><p className="mt-1 text-xs text-slate-500">A connected view of your early-stage research</p></div><Sparkles className="text-teal-700" size={20} /></div>
              <div className="space-y-3">
                {[
                  { icon: BarChart3, title: "Startup idea assessment", detail: "Market potential, estimated costs and key risks", color: "bg-teal-50 text-teal-700" },
                  { icon: Search, title: "Competitor intelligence", detail: "Find and compare mapped local businesses", color: "bg-blue-50 text-blue-700" },
                  { icon: FileText, title: "Reports you can revisit", detail: "Keep research together and export PDF summaries", color: "bg-amber-50 text-amber-700" },
                ].map(({ icon: Icon, title, detail, color }) => (
                  <div key={title} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon size={18} /></span>
                    <div className="min-w-0"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{detail}</p></div>
                    <ShieldCheck className="ml-auto shrink-0 text-emerald-600" size={17} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-teal-100 bg-white px-4 py-3 shadow-xl sm:flex sm:items-center sm:gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-100 text-teal-800"><Sparkles size={17} /></span>
            <div><p className="text-xs font-bold text-slate-800">One founder workspace</p><p className="text-[10px] text-slate-500">Research • Compare • Plan</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
