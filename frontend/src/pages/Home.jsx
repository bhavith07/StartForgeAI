import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import AIDemo from "../components/AIDemo";
import IdeaForm from "../components/IdeaForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <Hero />

      <Features />
      <HowItWorks />
      <AIDemo />
      <IdeaForm />
    </div>
  );
}