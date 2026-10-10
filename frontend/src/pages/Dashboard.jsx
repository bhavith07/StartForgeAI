import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalyses() {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/analyze/history",
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
            data.message || "Failed to load analysis history."
          );
        }

        setAnalyses(data.analyses || []);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadAnalyses();
  }, [token, navigate]);

  const latestAnalysis = analyses[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-cyan-400 font-semibold">
              StartForge AI
            </p>

            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              Welcome, {user?.name || "Founder"} 👋
            </h1>

            <p className="text-gray-400 mt-3">
              Manage your startup ideas and AI-powered analyses.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition"
          >
            🚀 Analyze New Startup
          </button>
        </div>

        {/* OVERVIEW CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-400">
              Total Analyses
            </p>

            <p className="text-4xl font-bold text-cyan-400 mt-3">
              {analyses.length}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-400">
              Latest Startup
            </p>

            <p className="text-2xl font-bold text-white mt-3 truncate">
              {latestAnalysis?.startup_name || "No analyses yet"}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-400">
              Latest Score
            </p>

            <p className="text-4xl font-bold text-green-400 mt-3">
              {latestAnalysis?.startup_score ?? "--"}
            </p>
          </div>

        </div>

        {/* LATEST ANALYSIS */}
        {latestAnalysis && (
          <div className="mt-10 bg-slate-900 border border-cyan-500/30 rounded-3xl p-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <p className="text-gray-400">
                  Latest Analysis
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {latestAnalysis.startup_name}
                </h2>

                <p className="text-gray-400 mt-2">
                  {latestAnalysis.industry || "Industry not specified"}
                </p>
              </div>

              <div className="text-center">
                <p className="text-gray-400">
                  Startup Score
                </p>

                <p className="text-5xl font-extrabold text-cyan-400 mt-2">
                  {latestAnalysis.startup_score ?? "--"}
                </p>

                <p className="text-gray-500">
                  / 100
                </p>
              </div>

            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-8">

              <div className="bg-slate-800 rounded-xl p-5">
                <p className="text-gray-400">
                  📈 Market Potential
                </p>

                <p className="text-lg font-semibold text-green-400 mt-3">
                  {latestAnalysis.market_potential || "Not available"}
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl p-5">
                <p className="text-gray-400">
                  ⚔️ Competition
                </p>

                <p className="text-lg font-semibold text-yellow-400 mt-3">
                  {latestAnalysis.competition || "Not available"}
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl p-5">
                <p className="text-gray-400">
                  💰 Estimated Cost
                </p>

                <p className="text-lg font-semibold text-cyan-400 mt-3">
                  {latestAnalysis.estimated_cost || "Not available"}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ANALYSIS HISTORY */}
        <div className="mt-10">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">
                Analysis History
              </h2>

              <p className="text-gray-400 mt-2">
                Your previously analyzed startup ideas.
              </p>
            </div>
          </div>

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <div className="w-10 h-10 mx-auto border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>

              <p className="text-gray-400 mt-5">
                Loading your analyses...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-2xl p-6">
              {error}
            </div>
          )}

          {!loading && !error && analyses.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

              <div className="text-5xl">
                🚀
              </div>

              <h3 className="text-2xl font-bold mt-4">
                No startup analyses yet
              </h3>

              <p className="text-gray-400 mt-2">
                Analyze your first startup idea to see it here.
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition"
              >
                Analyze Startup
              </button>

            </div>
          )}

          {!loading && !error && analyses.length > 0 && (
            <div className="space-y-4">

              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div>
                      <h3 className="text-xl font-bold">
                        {analysis.startup_name}
                      </h3>

                      <p className="text-gray-400 mt-1">
                        {analysis.industry || "Industry not specified"}
                      </p>

                      <p className="text-gray-500 text-sm mt-2">
                        {analysis.created_at
                          ? new Date(
                              analysis.created_at
                            ).toLocaleString()
                          : "Date unavailable"}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">

                      <div className="text-center">
                        <p className="text-gray-500 text-sm">
                          Score
                        </p>

                        <p className="text-3xl font-bold text-cyan-400">
                          {analysis.startup_score ?? "--"}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/analysis/${analysis.id}`
                          )
                        }
                        className="border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 px-4 py-2 rounded-lg transition"
                      >
                        View
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}