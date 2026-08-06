import { Lightbulb, FileText, Sparkles, Rocket } from "lucide-react";

const steps = [
  {
    icon: <Lightbulb size={40} className="text-cyan-400" />,
    title: "1. Submit Your Idea",
    desc: "Describe your startup idea in a few sentences."
  },
  {
    icon: <Sparkles size={40} className="text-cyan-400" />,
    title: "2. AI Analysis",
    desc: "Our AI evaluates feasibility, market demand, and competition."
  },
  {
    icon: <FileText size={40} className="text-cyan-400" />,
    title: "3. Get Business Report",
    desc: "Receive a detailed report with strengths and improvements."
  },
  {
    icon: <Rocket size={40} className="text-cyan-400" />,
    title: "4. Launch Smarter",
    desc: "Use AI insights to build your startup with confidence."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-slate-950 text-white">
      <h2 className="text-5xl font-bold text-center mb-16">
        How It Works
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-slate-800 p-8 rounded-2xl text-center hover:-translate-y-2 transition-all duration-300"
          >
            <div className="flex justify-center mb-6">
              {step.icon}
            </div>

            <h3 className="text-2xl font-bold">
              {step.title}
            </h3>

            <p className="mt-4 text-gray-400">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}