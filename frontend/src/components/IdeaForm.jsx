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

    console.log(response.data);

   setResult(response.data.data);

  } catch (error) {
    console.error(error);

    alert("Failed to connect to backend.");
  }
};
  

  return (
    <section className="py-24 bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto">

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
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition rounded-xl py-4 text-lg font-bold"
          >
            🚀 Analyze Startup
          </button>

        </form>

        {result && (
  <div className="mt-10 bg-slate-900 border border-cyan-500 rounded-2xl p-8">

    <h2 className="text-3xl font-bold text-cyan-400 mb-6">
      Analysis Result
    </h2>

    <div className="space-y-4">

      <div>
        <span className="font-bold">Startup Name:</span>
        <p>{result.startupName}</p>
      </div>

      <div>
        <span className="font-bold">Idea:</span>
        <p>{result.idea}</p>
      </div>

      <div>
        <span className="font-bold">Industry:</span>
        <p>{result.industry}</p>
      </div>

      <div>
        <span className="font-bold">Audience:</span>
        <p>{result.audience}</p>
      </div>

      <div>
        <span className="font-bold">Business Model:</span>
        <p>{result.model}</p>
      </div>

    </div>

  </div>
)}
      </div>
    </section>
  );
}