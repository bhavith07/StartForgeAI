import { BarChart3, MapPinned, FolderClock } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    number: "01",
    title: "Assess the idea",
    desc: "Get a structured review of market potential, competition, estimated costs, strengths and risks.",
  },
  {
    icon: MapPinned,
    number: "02",
    title: "Look around locally",
    desc: "Search mapped businesses by category, location and radius, then compare the results on a map.",
  },
  {
    icon: FolderClock,
    number: "03",
    title: "Keep your research together",
    desc: "Save startup reports and competitor searches in your workspace, and download reports as PDFs.",
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 border-y border-slate-200 bg-white px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">What you can do</p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Useful groundwork for an early decision.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600 md:justify-self-end md:text-base">
            Start with a structured assessment, then add local competitor research when you have a place and category in mind.
          </p>
        </div>

        <div className="grid border-y border-slate-200 md:grid-cols-3 md:divide-x md:divide-slate-200">
          {features.map(({ icon: Icon, number, title, desc }) => (
            <article key={title} className="flex gap-4 border-b border-slate-200 py-6 md:border-b-0 md:px-6 md:py-7 first:md:pl-0 last:md:pr-0">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1f6f3] text-teal-800"><Icon size={19} /></span>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-slate-400"><span>{number}</span><span className="h-px w-6 bg-slate-200" /></div>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
