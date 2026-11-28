import { Lightbulb, Code2, Search, WalletCards, ChartNoAxesCombined, Route, ShieldAlert, FolderClock, FileDown } from "lucide-react";

const features = [
  { icon: Lightbulb, title: "Problem and idea validation", desc: "Define the problem, target users, value proposition and assumptions your tech product needs to test." },
  { icon: Code2, title: "Technology product planning", desc: "Shape ideas for SaaS platforms, mobile apps, AI products, marketplaces, developer tools and IT services." },
  { icon: Search, title: "Unified competitor intelligence", desc: "Study nearby businesses as well as digital products and companies competing in your target market." },
  { icon: WalletCards, title: "Build and operating cost planning", desc: "Estimate development resources, cloud services, software tools, staffing, marketing and operating needs." },
  { icon: ChartNoAxesCombined, title: "Business model and financial thinking", desc: "Explore pricing assumptions, revenue models, monthly costs, runway and break-even planning." },
  { icon: Route, title: "Startup roadmap", desc: "Organise discovery, MVP development, testing, launch preparation and early growth into milestones." },
  { icon: ShieldAlert, title: "Risks and validation checklist", desc: "Identify technical, market, security, legal and operational questions to investigate before launch." },
  { icon: FolderClock, title: "Founder research workspace", desc: "Keep assessments, competitor findings and planning work organised for future review." },
  { icon: FileDown, title: "Shareable reports", desc: "Export key findings and planning summaries to support project reviews and founder discussions." },
];

export default function Features() {
  return (
    <section id="features" className="relative isolate scroll-mt-24 overflow-hidden bg-[#fbfdfd] px-5 py-20 sm:px-8 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_25%,rgba(45,212,191,0.12),transparent_30%),radial-gradient(ellipse_at_88%_75%,rgba(167,139,250,0.12),transparent_32%)]"/>
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">The technology founder guide</p><h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#102b3b] sm:text-4xl lg:text-5xl">From problem discovery to a launch-ready plan.</h2></div><p className="max-w-lg text-sm leading-7 text-slate-600 sm:text-base">A connected toolkit for exploring whether a software or technology idea is worth pursuing, what it may take to build and how to validate it with real users.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map(({icon:Icon,title,desc},index)=><article key={title} className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-[#f8fbfa] p-6 shadow-[0_8px_28px_-24px_rgba(15,45,55,0.35)] transition duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 transition group-hover:bg-teal-700 group-hover:text-white"><Icon size={21}/></span><span className="text-xs font-bold tracking-widest text-slate-300">0{index+1}</span></div><h3 className="mt-5 text-base font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p></article>)}
        </div>
        <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-[#142f43] via-[#155b5b] to-[#087f75] p-7 text-white sm:p-9"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-200">Our approach</p><h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Build with evidence. Learn before you scale.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50">StartForge AI is a founder support and research tool. Its estimates and AI-generated suggestions are starting points to validate, not guarantees of product-market fit or business success.</p></div><div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold"><Code2 size={18} className="text-lime-200"/> Made for tech founders</div></div></div>
      </div>
    </section>
  );
}
