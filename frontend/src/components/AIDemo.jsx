import { useState } from "react";
import { Sparkles, ArrowRight, TrendingUp, Target, Wallet, Lightbulb } from "lucide-react";

export default function AIDemo() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState(null);

  const analyzeIdea = () => {
    if (!idea.trim()) {
      alert("Please enter your startup idea.");
      return;
    }
    // Demonstration-only sample output; this does not call the live analysis API.
    setResult({ market: "89%", competition: "Medium", cost: "₹10L", success: "High" });
  };

  return (
    <section id="demo" className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700"><Sparkles size={16}/> Interactive preview</span>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">See your idea from a new angle</h2>
          <p className="mt-4 text-lg text-slate-600">Try this sample preview to see the kind of insights a startup analysis can present.</p>
        </div>

        <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
          <label htmlFor="demo-idea" className="mb-3 block text-sm font-bold text-slate-800">Your startup idea</label>
          <textarea id="demo-idea" rows={5} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Example: A platform that helps college students find verified internships..." className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"/>
          <button onClick={analyzeIdea} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 font-bold text-white transition hover:bg-teal-700">Preview analysis <ArrowRight size={18}/></button>

          {result && (
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {[
                { icon: TrendingUp, label: "Market Potential", value: result.market },
                { icon: Target, label: "Competition", value: result.competition },
                { icon: Wallet, label: "Estimated Cost", value: result.cost },
                { icon: Lightbulb, label: "Sample Outlook", value: result.success },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Icon size={18} className="text-teal-700"/>{label}</div>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
                </div>
              ))}
              <p className="sm:col-span-2 text-xs text-slate-500">This is a static demonstration preview, not a live AI-generated assessment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
