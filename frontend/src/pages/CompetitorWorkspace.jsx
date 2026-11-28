import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Globe2, Code2 } from "lucide-react";
import CompetitorAnalysis from "./CompetitorAnalysis";
import IndustryCompetitors from "./IndustryCompetitors";

export default function CompetitorWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const requestedScope = new URLSearchParams(location.search).get("scope");
  const [scope, setScope] = useState(requestedScope === "industry" ? "industry" : "local");

  function changeScope(next) {
    setScope(next);
    navigate("/dashboard/competitors" + (next === "industry" ? "?scope=industry" : ""), { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[72px]">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#102b3b] via-[#155b5b] to-[#087f75] px-4 py-8 text-white sm:px-7">
        <div className="pointer-events-none absolute -right-16 -top-28 -z-10 h-80 w-80 rounded-full border border-white/10" />
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-100"><Code2 size={14}/> Technology market intelligence</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Understand the competition around your tech startup.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-teal-50 sm:text-base">Research nearby businesses and digital products in your target market from one workspace. Compare what exists, identify gaps and decide what your product needs to do differently.</p>
          <div className="mt-6 inline-flex flex-wrap gap-2 rounded-2xl border border-white/15 bg-slate-950/15 p-1.5">
            <button type="button" onClick={() => changeScope("local")} aria-pressed={scope === "local"} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${scope === "local" ? "bg-white text-teal-900 shadow" : "text-white/85 hover:bg-white/10"}`}><MapPin size={16}/> Nearby businesses</button>
            <button type="button" onClick={() => changeScope("industry")} aria-pressed={scope === "industry"} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${scope === "industry" ? "bg-white text-teal-900 shadow" : "text-white/85 hover:bg-white/10"}`}><Globe2 size={16}/> Digital & industry competitors</button>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-0 sm:px-2">
        {scope === "local" ? <CompetitorAnalysis /> : <IndustryCompetitors />}
      </div>
    </div>
  );
}
