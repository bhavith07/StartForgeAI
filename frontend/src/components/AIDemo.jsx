import { useState } from "react";

export default function AIDemo() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState(null);

  const analyzeIdea = () => {
    if (!idea.trim()) {
      alert("Please enter your startup idea.");
      return;
    }

    // Temporary demo result
    setResult({
      market: "89%",
      competition: "Medium",
      cost: "₹10L",
      success: "High",
    });
  };

  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6">

        <h2 className="text-5xl font-bold text-center">
          Try StartForge AI
        </h2>

        <p className="text-center text-gray-400 mt-4">
          Enter your startup idea and see how AI analyzes it.
        </p>

        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-2xl p-8">

          <textarea
            rows="5"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Example: An AI app that helps college students find internships..."
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-4 text-white focus:outline-none focus:border-cyan-400"
          />

          <button
            onClick={analyzeIdea}
            className="mt-6 bg-cyan-500 hover:bg-cyan-600 px-8 py-3 rounded-xl font-semibold transition"
          >
            Analyze with AI
          </button>

          {result && (
            <div className="mt-10 grid md:grid-cols-2 gap-6">

              <div className="bg-slate-900 p-6 rounded-xl">
                <h3 className="text-cyan-400 font-bold">
                  📈 Market Potential
                </h3>
                <p className="text-3xl mt-3">{result.market}</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl">
                <h3 className="text-cyan-400 font-bold">
                  🏆 Competition
                </h3>
                <p className="text-3xl mt-3">{result.competition}</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl">
                <h3 className="text-cyan-400 font-bold">
                  💰 Estimated Cost
                </h3>
                <p className="text-3xl mt-3">{result.cost}</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl">
                <h3 className="text-cyan-400 font-bold">
                  🚀 Success Probability
                </h3>
                <p className="text-3xl mt-3">{result.success}</p>
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}