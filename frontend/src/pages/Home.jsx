import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import WorkspaceLayout from "../components/WorkspaceLayout";
import Dashboard from "./Dashboard";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import IdeaForm from "../components/IdeaForm";

export default function Home() {
  const { isLoggedIn } = useAuth();

  // Signed-in founders land in the product workspace, not the public marketing page.
  if (isLoggedIn) {
    return (
      <WorkspaceLayout>
        <Dashboard />
      </WorkspaceLayout>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <IdeaForm />
    </div>
  );
}
