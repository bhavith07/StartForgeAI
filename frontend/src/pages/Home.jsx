import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import IdeaForm from "../components/IdeaForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />
      <Features />
      <HowItWorks />
      <IdeaForm />
    </main>
  );
}
