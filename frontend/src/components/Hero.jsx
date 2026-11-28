import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Code2, Search, Wallet, Route, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();
  const scrollToFeatures = () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <section className="relative isolate overflow-hidden bg-[#f3f7f6] px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_18%,rgba(20,184,166,0.24),transparent_34%),radial-gradient(ellipse_at_8%_16%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(ellipse_at_92%_78%,rgba(168,85,247,0.16),transparent_30%),radial-gradient(ellipse_at_24%_90%,rgba(132,204,22,0.14),transparent_28%)]" />
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-teal-800 shadow-sm"><Code2 size={14}/> THE TECH STARTUP FOUNDER GUIDE</div>
          <h1 className="text-4xl font-bold leading-[1.06] tracking-[-0.04em] text-[#102b3b] sm:text-5xl lg:text-[4.15rem]">Build your tech idea with <span className="text-teal-700">a clearer roadmap.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">From SaaS products and mobile apps to AI tools and IT services, StartForge AI helps early-stage founders validate an idea, understand the market, estimate what it takes to build and plan the next steps.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => navigate("/dashboard/analyze")} className="inline-flex items-center gap-2 rounded-xl bg-[#087f75] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-[#066b64]">Start validating an idea <ArrowRight size={17}/></button>
            <button onClick={scrollToFeatures} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50">Explore the founder guide</button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-700"/> Validate the problem</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-700"/> Research competitors</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-teal-700"/> Plan your launch</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[650px] lg:justify-self-end">
          <div className="absolute -inset-5 -z-10 rounded-[34px] bg-gradient-to-br from-teal-200/60 via-white to-lime-100/70 blur-xl"/>
          <div className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-38px_rgba(15,45,55,0.45)]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#fbfdfd] px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white"><Code2 size={18}/></span><div><p className="text-sm font-bold text-slate-900">Tech founder workspace</p><p className="text-[11px] text-slate-500">From concept to launch planning</p></div></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Founder toolkit</span></div>
            <div className="grid grid-cols-2 gap-3 bg-[#f5f8f8] p-4 sm:grid-cols-3">
              {[["Idea validation","Problem & users",Sparkles],["Market intelligence","Competitor landscape",Search],["Build economics","Cost & runway",Wallet]].map(([label,detail,Icon])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[11px] font-medium text-slate-500">{label}</p><div className="mt-3 flex items-end justify-between"><span className="text-sm font-bold text-slate-900">{detail}</span><Icon className="text-teal-700" size={19}/></div></div>)}
            </div>
            <div className="space-y-3 p-5 sm:p-6">
              <div className="mb-4"><p className="text-sm font-bold text-slate-900">A practical startup journey</p><p className="mt-1 text-xs text-slate-500">Understand the work before investing in the build</p></div>
              {[[Sparkles,"Validate the problem","Define users, pain points and value proposition"],[Search,"Study the market","Compare nearby providers and digital products"],[Wallet,"Estimate resources","Explore development, operations and launch costs"],[Route,"Plan the launch","Turn assumptions into milestones and next steps"]].map(([Icon,title,detail])=><div key={title} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Icon size={18}/></span><div className="min-w-0"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{detail}</p></div><ShieldCheck className="ml-auto shrink-0 text-emerald-600" size={17}/></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
