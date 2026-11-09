import { Lightbulb, FileText, Sparkles, Rocket, ArrowRight } from "lucide-react";

const steps = [
  { icon: Lightbulb, title: "Describe your idea", desc: "Share your startup name, concept, industry and target audience." },
  { icon: Sparkles, title: "Analyse the opportunity", desc: "Review market potential, competition and estimated costs." },
  { icon: FileText, title: "Explore your report", desc: "See strengths, weaknesses, differentiation and recommendations." },
  { icon: Rocket, title: "Plan your next move", desc: "Use the insights to refine your idea and plan the next steps." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Simple process</span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">From idea to insight in four steps</h2>
          <p className="mt-4 text-lg text-slate-600">A straightforward workflow to help you assess your startup concept.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, desc }, index) => (
            <article key={title} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700"><Icon size={24}/></span>
                <span className="text-4xl font-black text-slate-200">0{index + 1}</span>
              </div>
              <h3 className="mt-7 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
              {index < steps.length - 1 && <ArrowRight className="absolute -right-4 top-12 z-10 hidden text-teal-500 lg:block" size={22}/>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
