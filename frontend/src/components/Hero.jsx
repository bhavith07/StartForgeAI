import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, ChartNoAxesCombined, Target, ShieldCheck } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white px-6 pb-24 pt-36 sm:pt-40">
      <div className="pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-64 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm">
          <Sparkles size={16} className="text-teal-600" />
          Startup intelligence, made simple
        </div>

        <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
          Turn your startup ideas into{" "}
          <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">real opportunities.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-600 sm:text-xl">
          Evaluate your idea, explore market opportunities, understand competitors and get a structured startup feasibility report — all in one place.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button onClick={() => navigate("/register")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-700">
            Get Started <ArrowRight size={19} />
          </button>
          <button onClick={() => scrollTo("features")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50">
            Explore Features
          </button>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
          {[
            { icon: <ChartNoAxesCombined size={19}/>, title: "Market insights", desc: "Understand your opportunity" },
            { icon: <Target size={19}/>, title: "Competitor research", desc: "See the competitive landscape" },
            { icon: <ShieldCheck size={19}/>, title: "Structured reports", desc: "Make informed decisions" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">{item.icon}</span>
              <span>
                <span className="block text-sm font-bold text-slate-800">{item.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{item.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
