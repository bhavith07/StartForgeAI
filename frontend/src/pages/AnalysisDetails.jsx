import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useAuth } from "../context/AuthContext";

export default function AnalysisDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalysis() {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/analyze/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load analysis."
          );
        }

        setAnalysis(data.analysis);
      } catch (error) {
        console.error("Analysis details error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [id, token, navigate]);

  // ==========================================
  // DOWNLOAD PDF
  // ==========================================

  const downloadPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();

    let y = 20;

    const pageWidth = 170;
    const bottomMargin = 275;

    // ==========================================
    // PAGE MANAGEMENT
    // ==========================================

    const checkPage = (requiredSpace = 10) => {
      if (y + requiredSpace > bottomMargin) {
        doc.addPage();
        y = 20;
      }
    };

    const newPage = () => {
      doc.addPage();
      y = 20;
    };

    // ==========================================
    // WRAPPED TEXT
    // ==========================================

    const addWrappedText = (text, x = 20) => {
      const lines = doc.splitTextToSize(
        String(text || ""),
        pageWidth
      );

      lines.forEach((line) => {
        checkPage(7);

        doc.text(line, x, y);

        y += 6;
      });

      y += 2;
    };

    // ==========================================
    // TITLE
    // ==========================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);

    doc.text("StartForge AI", 20, y);

    y += 12;

    doc.setFontSize(16);

    doc.text("Startup Analysis Report", 20, y);

    y += 15;

    // ==========================================
    // STARTUP INFORMATION
    // ==========================================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    addWrappedText(
      `Startup Name: ${analysis.startup_name}`
    );

    addWrappedText(
      `Industry: ${analysis.industry || "Not specified"}`
    );

    addWrappedText(
      `Target Audience: ${
        analysis.audience || "Not specified"
      }`
    );

    addWrappedText(
      `Business Model: ${
        analysis.business_model || "Not specified"
      }`
    );

    y += 5;

    // ==========================================
    // STARTUP IDEA
    // ==========================================

    checkPage(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text("Startup Idea", 20, y);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    addWrappedText(analysis.idea);

    // ==========================================
    // SCORE
    // ==========================================

    checkPage(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text(
      `Startup Score: ${
        analysis.startup_score ?? "--"
      }/100`,
      20,
      y
    );

    y += 12;

    // ==========================================
    // MARKET POTENTIAL
    // ==========================================

    checkPage(20);

    doc.setFontSize(14);

    doc.text("Market Potential:", 20, y);

    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    addWrappedText(
      analysis.market_potential || "Not available"
    );

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

    addWrappedText(
      analysis.competition || "Not available"
    );

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

    addWrappedText(
      analysis.estimated_cost || "Not available"
    );

    // ==========================================
    // STRENGTHS
    // ==========================================

    newPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text("Strengths", 20, y);

    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const strengths = Array.isArray(analysis.strengths)
      ? analysis.strengths
      : [];

    strengths.forEach((item, index) => {
      checkPage(15);

      const lines = doc.splitTextToSize(
        `${index + 1}. ${item}`,
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
    // WEAKNESSES
    // ==========================================

    newPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text("Weaknesses", 20, y);

    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const weaknesses = Array.isArray(
      analysis.weaknesses
    )
      ? analysis.weaknesses
      : [];

    weaknesses.forEach((item, index) => {
      checkPage(15);

      const lines = doc.splitTextToSize(
        `${index + 1}. ${item}`,
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
    // AI RECOMMENDATIONS
    // ==========================================

    newPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text("AI Recommendations", 20, y);

    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const suggestions = Array.isArray(
      analysis.suggestions
    )
      ? analysis.suggestions
      : [];

    suggestions.forEach((item, index) => {
      checkPage(15);

      const lines = doc.splitTextToSize(
        `${index + 1}. ${item}`,
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
      analysis.startup_name
        ?.trim()
        .replace(/\s+/g, "-") ||
      "Startup";

    doc.save(
      `${fileName}-Startup-Report.pdf`
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">

          <div className="w-14 h-14 mx-auto border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>

          <p className="text-gray-400 mt-6">
            Loading startup analysis...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-6 py-24">

        <div className="max-w-3xl mx-auto">

          <button
            onClick={() => navigate("/dashboard")}
            className="text-cyan-400 hover:text-cyan-300 mb-8"
          >
            ← Back to Dashboard
          </button>

          <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-8">

            <h1 className="text-2xl font-bold text-red-400">
              Unable to load analysis
            </h1>

            <p className="text-gray-300 mt-3">
              {error}
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // NO ANALYSIS
  // ==========================================

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-6 py-24">

        <div className="max-w-3xl mx-auto text-center">

          <h1 className="text-3xl font-bold">
            Analysis not found
          </h1>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-6 py-3 rounded-xl"
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // ARRAYS
  // ==========================================

  const strengths = Array.isArray(
    analysis.strengths
  )
    ? analysis.strengths
    : [];

  const weaknesses = Array.isArray(
    analysis.weaknesses
  )
    ? analysis.weaknesses
    : [];

  const suggestions = Array.isArray(
    analysis.suggestions
  )
    ? analysis.suggestions
    : [];

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-24">

      <div className="max-w-6xl mx-auto">

        {/* BACK BUTTON */}

        <button
          onClick={() => navigate("/dashboard")}
          className="text-cyan-400 hover:text-cyan-300 transition mb-8"
        >
          ← Back to Dashboard
        </button>

        {/* HEADER */}

        <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-8 md:p-10">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            <div>

              <p className="text-cyan-400 font-semibold">
                Startup Analysis Report
              </p>

              <h1 className="text-4xl md:text-5xl font-bold mt-3">
                {analysis.startup_name}
              </h1>

              <p className="text-gray-400 text-lg mt-3">
                {analysis.industry ||
                  "Industry not specified"}
              </p>

              {analysis.created_at && (
                <p className="text-gray-500 text-sm mt-3">
                  Analyzed on{" "}
                  {new Date(
                    analysis.created_at
                  ).toLocaleString()}
                </p>
              )}

            </div>

            {/* SCORE */}

            <div className="text-center bg-slate-800 rounded-2xl px-10 py-6">

              <p className="text-gray-400">
                Startup Score
              </p>

              <p className="text-6xl font-extrabold text-cyan-400 mt-2">
                {analysis.startup_score ?? "--"}
              </p>

              <p className="text-gray-500">
                out of 100
              </p>

            </div>

          </div>

        </div>

        {/* STARTUP INFORMATION */}

        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-8">

          <h2 className="text-2xl font-bold">
            Startup Information
          </h2>

          <div className="grid md:grid-cols-3 gap-5 mt-6">

            <div className="bg-slate-800 rounded-xl p-5">

              <p className="text-gray-400">
                Target Audience
              </p>

              <p className="text-lg font-semibold mt-2">
                {analysis.audience ||
                  "Not specified"}
              </p>

            </div>

            <div className="bg-slate-800 rounded-xl p-5">

              <p className="text-gray-400">
                Business Model
              </p>

              <p className="text-lg font-semibold mt-2">
                {analysis.business_model ||
                  "Not specified"}
              </p>

            </div>

            <div className="bg-slate-800 rounded-xl p-5">

              <p className="text-gray-400">
                Industry
              </p>

              <p className="text-lg font-semibold mt-2">
                {analysis.industry ||
                  "Not specified"}
              </p>

            </div>

          </div>

          <div className="mt-6 bg-slate-800 rounded-xl p-6">

            <p className="text-gray-400">
              Startup Idea
            </p>

            <p className="text-gray-200 text-lg leading-8 mt-3">
              {analysis.idea}
            </p>

          </div>

        </div>

        {/* KEY METRICS */}

        <div className="grid md:grid-cols-3 gap-6 mt-8">

          <div className="bg-slate-900 border border-green-500/30 rounded-2xl p-7">

            <p className="text-gray-400">
              📈 Market Potential
            </p>

            <p className="text-green-400 text-xl font-semibold leading-8 mt-4">
              {analysis.market_potential ||
                "Not available"}
            </p>

          </div>

          <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-7">

            <p className="text-gray-400">
              ⚔️ Competition
            </p>

            <p className="text-yellow-400 text-xl font-semibold leading-8 mt-4">
              {analysis.competition ||
                "Not available"}
            </p>

          </div>

          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-7">

            <p className="text-gray-400">
              💰 Estimated Cost
            </p>

            <p className="text-cyan-400 text-xl font-semibold leading-8 mt-4">
              {analysis.estimated_cost ||
                "Not available"}
            </p>

          </div>

        </div>

        {/* STRENGTHS */}

        <div className="mt-8 bg-slate-900 border border-green-500/30 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-green-400">
            ✅ Strengths
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mt-6">

            {strengths.length > 0 ? (
              strengths.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-5"
                >

                  <span className="text-green-400 font-bold mr-2">
                    {index + 1}.
                  </span>

                  <span className="text-gray-200">
                    {item}
                  </span>

                </div>
              ))
            ) : (
              <p className="text-gray-400">
                No strengths available.
              </p>
            )}

          </div>

        </div>

        {/* WEAKNESSES */}

        <div className="mt-8 bg-slate-900 border border-red-500/30 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-red-400">
            ❌ Weaknesses
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mt-6">

            {weaknesses.length > 0 ? (
              weaknesses.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-5"
                >

                  <span className="text-red-400 font-bold mr-2">
                    {index + 1}.
                  </span>

                  <span className="text-gray-200">
                    {item}
                  </span>

                </div>
              ))
            ) : (
              <p className="text-gray-400">
                No weaknesses available.
              </p>
            )}

          </div>

        </div>

        {/* RECOMMENDATIONS */}

        <div className="mt-8 bg-slate-900 border border-cyan-500/30 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-cyan-400">
            💡 AI Recommendations
          </h2>

          <div className="space-y-4 mt-6">

            {suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-5"
                >

                  <span className="text-cyan-400 font-bold mr-2">
                    {index + 1}.
                  </span>

                  <span className="text-gray-200">
                    {item}
                  </span>

                </div>
              ))
            ) : (
              <p className="text-gray-400">
                No recommendations available.
              </p>
            )}

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">

          <button
            onClick={() => navigate("/dashboard")}
            className="border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 px-8 py-4 rounded-xl font-bold transition"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={downloadPDF}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-8 py-4 rounded-xl font-bold transition"
          >
            📄 Download Report
          </button>

          <button
            onClick={() => navigate("/")}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-8 py-4 rounded-xl font-bold transition"
          >
            🚀 Analyze Another Startup
          </button>

        </div>

      </div>

    </div>
  );
}