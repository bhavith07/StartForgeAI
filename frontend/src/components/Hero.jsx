import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowRight, BarChart3, Check, MapPin, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Hero() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  function startAnalysis() {
    if (!isLoggedIn) {
      navigate("/register");
      return;
    }
    scrollTo("idea-form");
  }

  return (
    <section className="relative overflow-hidden bg-[#f5f8f6] px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
            StartForge AI <span className="mx-2 text-slate-300">/</span> Idea assessment
          </p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.65rem]">
            A clearer first look at your startup idea.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Work through the questions that matter early: who it serves, what the market may look like, where competition exists, and what to investigate next.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={startAnalysis}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              {isLoggedIn ? "Start an analysis" : "Create your account"}
              <ArrowRight size={17} />
            </button>
            <button
              onClick={() => scrollTo("features")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              What you can explore <ArrowDown size={16} />
            </button>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-teal-700" /> Your reports stay in your workspace</span>
            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-teal-700" /> Download a PDF when you're ready</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl lg:mx-0 lg:justify-self-end">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_22px_60px_-36px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Report preview</p>
                <p className="mt-0.5 text-xs text-slate-500">A look at the sections in your assessment</p>
              </div>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">Example</span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Startup concept</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Campus meal delivery</h2>
                  <p className="mt-1 text-xs text-slate-500">Illustrative example · not a live assessment</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                  <BarChart3 size={20} />
                </span>
              </div>

              <div className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
                {[
                  { icon: BarChart3, title: "Market potential", detail: "Audience, demand signals and open questions" },
                  { icon: Target, title: "Competition", detail: "Competitive context and differentiation" },
                  { icon: MapPin, title: "Local businesses", detail: "Mapped places around a chosen area" },
                ].map(({ icon: Icon, title, detail }) => (
                  <div key={title} className="flex items-center gap-3 py-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 text-teal-800"><Icon size={16} /></span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-800">{title}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{detail}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-[#f5f8f6] px-4 py-3">
                <p className="text-xs font-semibold text-slate-700">The goal is a better next question.</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Use the report as a starting point for research, not a substitute for it.</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-500">Example content is illustrative. Your report is based on the details you provide.</p>
        </div>
      </div>
    </section>
  );
}
