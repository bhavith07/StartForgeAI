import { useState } from "react";
import axios from "axios";

export default function IdeaForm() {
  const [form, setForm] = useState({
    startupName: "",
    idea: "",
    industry: "",
    audience: "",
    model: "",
  });

  const [result, setResult] = useState(null);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/analyze",
        form
      );

      const parsedResult = JSON.parse(response.data.analysis);

      setResult(parsedResult);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze startup.");
    }
  };

  return (
    <section className="py-24 bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto">

        <h2 className="text-5xl font-bold text-center">
          Validate Your Startup
        </h2>

        <p className="text-center text-gray-400 mt-4">
          Fill in the details below and let AI evaluate your startup idea.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-10 space-y-6"
        >
          <input
            type="text"
            name="startupName"
            placeholder="Startup Name"
            value={form.startupName}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none"
          />

          <textarea
            rows={6}
            name="idea"
            placeholder="Describe your startup idea..."
            value={form.idea}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none"
          />

          <div className="grid md:grid-cols-3 gap-5">

            <select
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className="p-4 rounded-xl bg-slate-800 border border-slate-700"
            >
              <option value="">Industry</option>
              <option>Education</option>
              <option>Healthcare</option>
              <option>Finance</option>
              <option>E-Commerce</option>
              <option>AI</option>
            </select>

            <select
              name="audience"
              value={form.audience}
              onChange={handleChange}
              className="p-4 rounded-xl bg-slate-800 border border-slate-700"
            >
              <option value="">Target Audience</option>
              <option>Students</option>
              <option>Businesses</option>
              <option>Professionals</option>
              <option>General Public</option>
            </select>

            <select
              name="model"
              value={form.model}
              onChange={handleChange}
              className="p-4 rounded-xl bg-slate-800 border border-slate-700"
            >
              <option value="">Business Model</option>
              <option>SaaS</option>
              <option>Subscription</option>
              <option>Marketplace</option>
              <option>Freemium</option>
            </select>

          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition rounded-xl py-4 text-lg font-bold"
          >
            🚀 Analyze Startup
          </button>

        </form>

        {result && (
          <div className="mt-12 bg-slate-900 border border-cyan-500 rounded-3xl p-10">

            <h2 className="text-4xl font-bold text-cyan-400 mb-8">
              AI Startup Report
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="font-bold text-xl mb-2">
                  Startup Score
                </h3>

                <p className="text-5xl font-bold text-cyan-400">
                  {result.startupScore}/100
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="font-bold text-xl mb-2">
                  Estimated Cost
                </h3>

                <p>{result.estimatedCost}</p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="font-bold text-xl mb-2">
                  Market Potential
                </h3>

                <p>{result.marketPotential}</p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="font-bold text-xl mb-2">
                  Competition
                </h3>

                <p>{result.competition}</p>
              </div>

            </div>

            <div className="mt-10">
              <h3 className="text-2xl font-bold text-green-400 mb-4">
                ✅ Strengths
              </h3>

              <ul className="list-disc ml-8 space-y-2">
                {result.strengths.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <h3 className="text-2xl font-bold text-red-400 mb-4">
                ❌ Weaknesses
              </h3>

              <ul className="list-disc ml-8 space-y-2">
                {result.weaknesses.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                💡 Suggestions
              </h3>

              <ul className="list-disc ml-8 space-y-2">
                {result.suggestions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}