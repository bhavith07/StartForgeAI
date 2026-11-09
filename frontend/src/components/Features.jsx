import { Brain, TrendingUp, Search, BarChart3, ArrowUpRight } from "lucide-react";

const features = [
  { icon: Brain, title: "Startup Validation", desc: "Evaluate your startup concept with structured AI-assisted insights." },
  { icon: TrendingUp, title: "Market Analysis", desc: "Understand your target market, growth potential and challenges." },
  { icon: Search, title: "Competitor Research", desc: "Explore competitors, their positioning, strengths and weaknesses." },
  { icon: BarChart3, title: "Business Reports", desc: "Get a clear report with scores, opportunities and recommendations." },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">What you get</span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">Everything to shape your next big idea</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">Useful insights to help you move from an early concept to a more informed plan.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-200/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-600 group-hover:text-white">
                <Icon size={24} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-teal-700">Explore <ArrowUpRight size={15}/></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
