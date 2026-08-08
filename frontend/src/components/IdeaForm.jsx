import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

export default function IdeaForm() {
  const [form, setForm] = useState({
    startupName: "",
    idea: "",
    industry: "",
    audience: "",
    model: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResult(null);

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
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DOWNLOAD PDF
  // ==========================================

  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    let y = 20;

    const pageWidth = 170;
    const bottomMargin = 275;

    // ------------------------------------------
    // Check if enough space is available
    // ------------------------------------------

    const checkPage = (requiredSpace = 10) => {
      if (y + requiredSpace > bottomMargin) {
        doc.addPage();
        y = 20;
      }
    };

    // ------------------------------------------
    // Start a completely new page
    // ------------------------------------------

    const newPage = () => {
      doc.addPage();
      y = 20;
    };

    // ------------------------------------------
    // Add wrapped text
    // ------------------------------------------

    const addWrappedText = (text, x = 20) => {
      const lines = doc.splitTextToSize(String(text), pageWidth);

      lines.forEach((line) => {
        checkPage(7);
        doc.text(line, x, y);
        y += 6;
      });

      y += 2;
    };

    // ==========================================
    // PAGE 1 - TITLE & BASIC INFORMATION
    // ==========================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);

    doc.text("StartForge AI", 20, y);

    y += 12;

    doc.setFontSize(16);

    doc.text("AI Startup Analysis Report", 20, y);

    y += 15;

    // ------------------------------------------
    // Startup Information
    // ------------------------------------------

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    addWrappedText(`Startup Name: ${form.startupName}`);
    addWrappedText(`Industry: ${form.industry}`);
    addWrappedText(`Target Audience: ${form.audience}`);
    addWrappedText(`Business Model: ${form.model}`);

    y += 5;

    // ==========================================
    // STARTUP SCORE
    // ==========================================

    checkPage(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text(
      `Startup Score: ${result.startupScore}/100`,
      20,
      y
    );

    y += 12;

    // ==========================================
    // MARKET POTENTIAL
    // ==========================================

    checkPage(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text("Market Potential:", 20, y);

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    addWrappedText(result.marketPotential);

    // ==========================================
    // COMPETITION
    // ==========================================

    checkPage(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text("Competition:", 20, y);

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    addWrappedText(result.competition);

    // ==========================================
    // ESTIMATED COST
    // ==========================================

    checkPage(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text("Estimated Cost:", 20, y);

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    addWrappedText(result.estimatedCost);

    // ==========================================
    // STRENGTHS - NEW PAGE
    // ==========================================

    newPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text("Strengths", 20, y);

    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Numbering starts from 1
    result.strengths.forEach((item, index) => {
      checkPage(15);

      const number = index + 1;

      const lines = doc.splitTextToSize(
        `${number}. ${item}`,
        165
      );

      lines.forEach((line) => {
        checkPage(7);

        doc.text(line, 25, y);

        y += 6;
      });

      y += 4;
    });

    // ==========================================
    // WEAKNESSES - NEW PAGE
    // ==========================================

    newPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text("Weaknesses", 20, y);

    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Numbering starts from 1
    result.weaknesses.forEach((item, index) => {
      checkPage(15);

      const number = index + 1;

      const lines = doc.splitTextToSize(
        `${number}. ${item}`,
        165
      );

      lines.forEach((line) => {
        checkPage(7);

        doc.text(line, 25, y);

        y += 6;
      });

      y += 4;
    });

    // ==========================================
    // AI RECOMMENDATIONS - NEW PAGE
    // ==========================================

    newPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text("AI Recommendations", 20, y);

    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Numbering starts from 1
    result.suggestions.forEach((item, index) => {
      checkPage(15);

      const number = index + 1;

      const lines = doc.splitTextToSize(
        `${number}. ${item}`,
        165
      );

      lines.forEach((line) => {
        checkPage(7);

        doc.text(line, 25, y);

        y += 6;
      });

      y += 4;
    });

    // ==========================================
    // SAVE PDF
    // ==========================================

    const fileName =
      form.startupName.trim().replace(/\s+/g, "-") ||
      "Startup";

    doc.save(`${fileName}-Startup-Report.pdf`);
  };

  // ==========================================
  // FRONTEND UI
  // ==========================================

  return (
    <section className="py-24 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="text-center">

          <h2 className="text-5xl font-bold">
            Validate Your Startup
          </h2>

          <p className="text-gray-400 mt-4 text-lg">
            Let AI analyze your startup idea and
            provide actionable insights.
          </p>

        </div>

        {/* =====================================
            FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-10 space-y-6 shadow-2xl"
        >

          {/* Startup Name */}

          <input
            type="text"
            name="startupName"
            placeholder="Startup Name"
            value={form.startupName}
            onChange={handleChange}
            required
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none transition"
          />

          {/* Idea */}

          <textarea
            rows={6}
            name="idea"
            placeholder="Describe your startup idea..."
            value={form.idea}
            onChange={handleChange}
            required
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none transition"
          />

          {/* Select Fields */}

          <div className="grid md:grid-cols-3 gap-5">

            {/* Industry */}

            <select
              name="industry"
              value={form.industry}
              onChange={handleChange}
              required
              className="p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            >
              <option value="">
                Industry
              </option>

              <option>
                Education
              </option>

              <option>
                Healthcare
              </option>

              <option>
                Finance
              </option>

              <option>
                E-Commerce
              </option>

              <option>
                AI
              </option>
            </select>

            {/* Audience */}

            <select
              name="audience"
              value={form.audience}
              onChange={handleChange}
              required
              className="p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            >
              <option value="">
                Target Audience
              </option>

              <option>
                Students
              </option>

              <option>
                Businesses
              </option>

              <option>
                Professionals
              </option>

              <option>
                General Public
              </option>
            </select>

            {/* Business Model */}

            <select
              name="model"
              value={form.model}
              onChange={handleChange}
              required
              className="p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            >
              <option value="">
                Business Model
              </option>

              <option>
                SaaS
              </option>

              <option>
                Subscription
              </option>

              <option>
                Marketplace
              </option>

              <option>
                Freemium
              </option>
            </select>

          </div>

          {/* Analyze Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:cursor-not-allowed transition rounded-xl py-4 text-lg font-bold"
          >
            {loading
              ? "🤖 Analyzing..."
              : "🚀 Analyze Startup"}
          </button>

        </form>

        {/* =====================================
            LOADING
        ===================================== */}

        {loading && (
          <div className="mt-12 text-center bg-slate-900 border border-slate-800 rounded-3xl p-12">

            <div className="w-14 h-14 mx-auto border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>

            <h3 className="text-2xl font-bold text-cyan-400 mt-6">
              AI is analyzing your startup...
            </h3>

            <p className="text-gray-400 mt-3">
              Evaluating your market, competition
              and business potential.
            </p>

          </div>
        )}

        {/* =====================================
            AI RESULT
        ===================================== */}

        {result && !loading && (
          <div className="mt-12">

            {/* Startup Name */}

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-6">

              <p className="text-gray-400">
                AI Analysis for
              </p>

              <h2 className="text-4xl font-bold text-white mt-1">
                {form.startupName}
              </h2>

            </div>

            {/* =================================
                TOP CARDS
            ================================= */}

            <div className="grid md:grid-cols-4 gap-5">

              {/* Score */}

              <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6">

                <p className="text-gray-400">
                  Startup Score
                </p>

                <p className="text-5xl font-extrabold text-cyan-400 mt-3">
                  {result.startupScore}
                </p>

                <p className="text-gray-500 mt-1">
                  out of 100
                </p>

                <div className="w-full bg-slate-800 rounded-full h-3 mt-6">

                  <div
                    className="bg-cyan-400 h-3 rounded-full transition-all duration-1000"
                    style={{
                      width: `${result.startupScore}%`,
                    }}
                  ></div>

                </div>

              </div>

              {/* Market */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  📈 Market Potential
                </p>

                <p className="text-xl font-bold text-green-400 mt-4">
                  {result.marketPotential}
                </p>

              </div>

              {/* Competition */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  ⚔️ Competition
                </p>

                <p className="text-xl font-bold text-yellow-400 mt-4">
                  {result.competition}
                </p>

              </div>

              {/* Cost */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <p className="text-gray-400">
                  💰 Estimated Cost
                </p>

                <p className="text-xl font-bold text-cyan-400 mt-4">
                  {result.estimatedCost}
                </p>

              </div>

            </div>

            {/* =================================
                STRENGTHS
            ================================= */}

            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-8">

              <h3 className="text-2xl font-bold text-green-400">
                ✅ Strengths
              </h3>

              <div className="mt-5 space-y-4">

                {result.strengths.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 rounded-xl p-4"
                  >
                    <span className="text-green-400 mr-2">
                      ✓
                    </span>

                    {item}
                  </div>
                ))}

              </div>

            </div>

            {/* =================================
                WEAKNESSES
            ================================= */}

            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-8">

              <h3 className="text-2xl font-bold text-red-400">
                ❌ Weaknesses
              </h3>

              <div className="mt-5 space-y-4">

                {result.weaknesses.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 rounded-xl p-4"
                  >
                    <span className="text-red-400 mr-2">
                      !
                    </span>

                    {item}
                  </div>
                ))}

              </div>

            </div>

            {/* =================================
                AI RECOMMENDATIONS
            ================================= */}

            <div className="mt-6 bg-slate-900 border border-cyan-500/30 rounded-2xl p-8">

              <h3 className="text-2xl font-bold text-cyan-400">
                💡 AI Recommendations
              </h3>

              <div className="mt-5 space-y-4">

                {result.suggestions.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 rounded-xl p-4"
                  >
                    <span className="text-cyan-400 mr-2">
                      →
                    </span>

                    {item}
                  </div>
                ))}

              </div>

            </div>

            {/* =================================
                DOWNLOAD PDF
            ================================= */}

            <div className="mt-8 text-center">

              <button
                onClick={downloadPDF}
                className="bg-cyan-500 hover:bg-cyan-600 transition px-8 py-4 rounded-xl text-lg font-bold"
              >
                📄 Download Startup Report
              </button>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}