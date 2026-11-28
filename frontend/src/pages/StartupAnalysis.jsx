import IdeaForm from "../components/IdeaForm";

export default function StartupAnalysis() {
  return (
    <main className="min-h-screen bg-[#f3f6f8] px-4 py-8 text-slate-900 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Startup tools / Analysis</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Analyze a startup idea</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Enter the details of your idea to build a structured assessment of its market, competition and estimated investment.</p>
          </div>
          <span className="w-fit rounded-full border border-teal-100 bg-white px-3 py-1.5 text-xs font-semibold text-teal-800">Founder workspace</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <IdeaForm />
        </div>
      </div>
    </main>
  );
}
