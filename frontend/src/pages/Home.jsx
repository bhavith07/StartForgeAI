import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import AIDemo from "../components/AIDemo";
import IdeaForm from "../components/IdeaForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <Hero />

      <section id="features">
        <Features />
      </section>

      <section id="how-it-works">
        <HowItWorks />
      </section>

      <section id="demo">
        <AIDemo />
      </section>

      <section id="demo">
        <IdeaForm />
      </section>
    </div>
  );
}