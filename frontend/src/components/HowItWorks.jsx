import { ClipboardList, FileSearch, RefreshCw } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Describe what you're building",
    desc: "Add the problem, your solution, industry, audience and business model.",
  },
  {
    icon: FileSearch,
    title: "Review the assessment",
    desc: "Read the market and competition overview, estimated costs, risks and recommendations.",
  },
  {
    icon: RefreshCw,
    title: "Research and refine",
    desc: "Explore nearby mapped businesses, save your findings and revisit the idea as it develops.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-[#f5f8f6] px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
            From first draft to a more informed next step.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Start with what you know. The report helps organize what to examine next; your research and judgment still lead the decision.
          </p>
        </div>

        <ol className="divide-y divide-slate-200 border-y border-slate-200">
          {steps.map(({ icon: Icon, title, desc }, index) => (
            <li key={title} className="grid gap-3 py-5 sm:grid-cols-[42px_1fr] sm:gap-5 sm:py-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-teal-800 ring-1 ring-slate-200"><Icon size={17} /></div>
              <div className="grid gap-1 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-6">
                <h3 className="text-sm font-semibold text-slate-900"><span className="mr-2 text-xs font-medium text-slate-400">0{index + 1}</span>{title}</h3>
                <p className="text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
