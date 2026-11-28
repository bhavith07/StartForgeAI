import { Link } from "react-router-dom";

function Value({ value }) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" || typeof value === "number") {
    return <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{value}</p>;
  }
  return null;
}

function List({ items }) {
  if (!Array.isArray(items) || !items.length) return <p className="mt-2 text-sm text-slate-500">Not provided.</p>;
  return <ul className="mt-3 space-y-2">{items.map((item, index) => <li key={`${index}-${typeof item === "string" ? item : item?.name || item?.phase || item?.layer || "item"}`} className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{typeof item === "string" ? item : JSON.stringify(item)}</li>)}</ul>;
}

function Card({ title, children, className = "" }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 ${className}`}><h3 className="text-lg font-extrabold text-slate-900">{title}</h3>{children}</section>;
}

function CompetitorCard({ competitor }) {
  return <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold text-slate-900">{competitor.name || "Candidate competitor"}</h4><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">{competitor.evidenceStatus || "Unverified candidate"}</span></div>
    <p className="mt-3 text-sm leading-6 text-slate-700"><strong>Likely offering:</strong> {competitor.offering || "Not provided"}</p>
    {competitor.targetUsers && <p className="mt-2 text-sm text-slate-600"><strong>Users:</strong> {competitor.targetUsers}</p>}
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div><h5 className="text-sm font-bold text-emerald-800">Possible strengths</h5><List items={competitor.strengths} /></div>
      <div><h5 className="text-sm font-bold text-rose-800">Possible weaknesses</h5><List items={competitor.weaknesses} /></div>
    </div>
    <div className="mt-4"><h5 className="text-sm font-bold text-teal-800">Differentiation opportunities</h5><List items={competitor.differentiationOpportunities} /></div>
    {Array.isArray(competitor.sourceUrls) && competitor.sourceUrls.length > 0 && <div className="mt-4"><h5 className="text-sm font-bold">Sources</h5><ul className="mt-2 list-inside list-disc">{competitor.sourceUrls.map((url) => <li key={url}><a className="text-teal-700 underline" href={url} target="_blank" rel="noreferrer">{url}</a></li>)}</ul></div>}
  </article>;
}

export default function FounderGuideSections({ guide }) {
  if (!guide) return null;
  const market = guide.marketPotential || {};
  const costs = guide.costEstimates || {};
  const competition = guide.competitorResearch || {};
  const technical = guide.technicalSolution || {};
  return <div className="mt-8 space-y-5">
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-950 sm:p-6">
      This is an AI-assisted planning estimate for a college demo and early product. Cost ranges and market assumptions are directional, not quotes or verified forecasts.
    </div>
    <Card title="Problem, use case and users"><Value value={guide.problemUseCase} /><p className="mt-4 text-sm font-bold text-slate-800">Target users</p><Value value={guide.targetUsers} /></Card>
    <Card title="Technical solution and architecture"><Value value={technical.overview} /><div className="mt-4 grid gap-3 md:grid-cols-2">{(technical.architectureComponents || []).map((part, index) => <div key={`${part.component}-${index}`} className="rounded-xl bg-slate-50 p-4"><p className="font-bold text-slate-900">{part.component}</p><p className="mt-1 text-sm leading-6 text-slate-600">{part.responsibility}</p></div>)}</div></Card>
    <Card title="Core MVP features"><List items={guide.coreMvpFeatures} /></Card>
    <Card title="Recommended technology stack"><div className="mt-3 grid gap-3 md:grid-cols-2">{(guide.recommendedTechStack || []).map((item, index) => <div key={`${item.layer}-${index}`} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-teal-800">{item.layer}</p><p className="mt-1 font-bold text-slate-900">{item.recommendation}</p><p className="mt-2 text-sm leading-6 text-slate-600">{item.reason}</p></div>)}</div></Card>
    <Card title="Development phases and milestones"><div className="mt-3 space-y-3">{(guide.developmentPhases || []).map((item, index) => <div key={`${item.phase}-${index}`} className="rounded-xl bg-slate-50 p-4"><p className="font-bold text-slate-900">{item.phase} <span className="font-medium text-slate-500">· {item.duration}</span></p><List items={item.deliverables} /></div>)}</div></Card>
    <Card title="Estimated development and operating costs"><p className="mt-3 text-2xl font-extrabold text-teal-800">{costs.developmentRange || "Not provided"} <span className="text-sm font-semibold">{costs.currency || "INR"} · one-time MVP estimate</span></p><p className="mt-4 text-sm font-bold text-slate-800">Development assumptions</p><List items={costs.developmentAssumptions} /><p className="mt-5 text-sm font-bold text-slate-800">Estimated monthly operating costs</p><div className="mt-3 grid gap-3 md:grid-cols-2">{(costs.monthlyOperatingCosts || []).map((item, index) => <div key={`${item.category}-${index}`} className="rounded-xl bg-slate-50 p-4"><p className="font-bold">{item.category}: {item.range}</p><p className="mt-1 text-sm leading-6 text-slate-600">{item.assumption}</p></div>)}</div></Card>
    <Card title="Risks, security and scalability"><div className="mt-3 space-y-3">{(guide.risks || []).map((item, index) => <div key={`${item.risk}-${index}`} className="rounded-xl bg-slate-50 p-4"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-900">{item.risk}</p>{item.severity && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">{item.severity}</span>}</div><p className="mt-2 text-sm leading-6 text-slate-700"><strong>Mitigation:</strong> {item.mitigation}</p></div>)}</div></Card>
    <Card title="Market potential and validation"><Value value={market.opportunity} /><p className="mt-4 text-sm font-bold">Assumptions to check</p><List items={market.assumptions} /><p className="mt-4 text-sm font-bold">Validation steps</p><List items={market.validationSteps} /></Card>
    <Card title="Competitor research and alternatives" className="border-violet-200">
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>{competition.evidenceStatus || "Evidence status: unverified"}</strong><p className="mt-1">{competition.limitation || "This assessment did not perform live web research. Treat these names and product descriptions as candidates to verify, not sourced facts."}</p></div>
      <div className="mt-4 space-y-4">{(competition.candidates || []).map((item, index) => <CompetitorCard key={`${item.name}-${index}`} competitor={item} />)}</div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{competition.followUp || "Verify each candidate against its official product pages and record dated source links before presenting the comparison as fact."}</p>
      <p className="mt-4 rounded-xl bg-violet-50 p-4 text-sm leading-6 text-violet-950">This assessment does not call live search. To gather cited results, open <Link className="font-bold underline" to="/dashboard/competitors?scope=industry">Competitor Workspace</Link> and run industry research. Google Search grounding may require a paid Gemini API project and can incur charges if that project has billing enabled.
      </p>
    </Card>
    <Card title="Assumptions and items to verify"><List items={guide.assumptions} /></Card>
  </div>;
}
