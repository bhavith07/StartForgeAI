import {
  Lightbulb, BarChart3, MapPinned, WalletCards, ShieldAlert,
  FolderClock, FileDown, Search, Target
} from "lucide-react";

const features = [
  { icon: Lightbulb, title: "Startup idea assessment", desc: "Organise your idea, target audience and business model into a structured assessment." },
  { icon: BarChart3, title: "Market potential insights", desc: "Review market opportunity signals, strengths and areas that need more validation." },
  { icon: Search, title: "Competitor discovery", desc: "Find nearby businesses by category, location and search radius using mapped place data." },
  { icon: MapPinned, title: "Map-based local research", desc: "See discovered businesses on a map and compare the local competitive landscape." },
  { icon: WalletCards, title: "Estimated startup costs", desc: "Explore indicative cost considerations as a starting point for location-aware planning." },
  { icon: ShieldAlert, title: "Risks and recommendations", desc: "Highlight important questions, potential risks and practical areas to investigate next." },
  { icon: FolderClock, title: "Saved research workspace", desc: "Keep your startup assessments and competitor searches together for later review." },
  { icon: FileDown, title: "PDF reports", desc: "Export assessment reports so you can revisit findings and share your research." },
  { icon: Target, title: "Compare the landscape", desc: "Use structured findings to think about differentiation and where your idea may fit." },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">What StartForge AI does</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#102b3b] sm:text-4xl lg:text-5xl">From a rough idea to organised startup research.</h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-slate-600 sm:text-base">StartForge AI brings early idea assessment and local competitor research into one workspace, so founders can make more informed decisions about what to explore next.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, index) => (
            <article key={title} className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-[#f8fbfa] p-6 shadow-[0_8px_28px_-24px_rgba(15,45,55,0.35)] transition duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 transition group-hover:bg-teal-700 group-hover:text-white"><Icon size={21} /></span>
                <span className="text-xs font-bold tracking-widest text-slate-300">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-[#142f43] via-[#155b5b] to-[#087f75] p-7 text-white sm:p-9">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-200">The purpose</p><h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Research first. Decide with more clarity.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50">StartForge AI helps organise early research. It is a starting point for validation, not a guarantee of business success.</p></div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold"><Lightbulb size={18} className="text-lime-200" /> Built for early-stage founders</div>
          </div>
        </div>
      </div>
    </section>
  );
}
