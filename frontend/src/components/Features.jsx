import { Brain, TrendingUp, Search, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <Brain size={40} className="text-cyan-400" />,
    title: "AI Validation",
    desc: "Validate your startup idea instantly using AI-powered insights.",
  },
  {
    icon: <TrendingUp size={40} className="text-cyan-400" />,
    title: "Market Analysis",
    desc: "Understand market demand and discover growth opportunities.",
  },
  {
    icon: <Search size={40} className="text-cyan-400" />,
    title: "Competitor Research",
    desc: "Find your competitors and compare your idea.",
  },
  {
    icon: <BarChart3 size={40} className="text-cyan-400" />,
    title: "Business Report",
    desc: "Generate a detailed startup feasibility report.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-slate-900 text-white">
      <h2 className="text-5xl font-bold text-center mb-16">
        Powerful AI Features
      </h2>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
        {features.map((item, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-2xl p-8 hover:scale-105 transition duration-300"
          >
            {item.icon}

            <h3 className="text-2xl font-bold mt-6">
              {item.title}
            </h3>

            <p className="text-gray-400 mt-4">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}