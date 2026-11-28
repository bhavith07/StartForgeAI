import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AnalysisDetails from "./pages/AnalysisDetails";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import IndustryCompetitors from "./pages/IndustryCompetitors";
import StartupAnalysis from "./pages/StartupAnalysis";

import ProtectedRoute from "./components/ProtectedRoute";
import WorkspaceLayout from "./components/WorkspaceLayout";

function WorkspacePage({ children }) {
  return <ProtectedRoute><WorkspaceLayout>{children}</WorkspaceLayout></ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      {/* The entry URL is always the login screen. */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Home and Dashboard are separate destinations inside the signed-in app. */}
      <Route path="/home" element={<WorkspacePage><Home /></WorkspacePage>} />
      <Route path="/dashboard" element={<WorkspacePage><Dashboard /></WorkspacePage>} />
      <Route path="/dashboard/analyze" element={<WorkspacePage><StartupAnalysis /></WorkspacePage>} />
      <Route path="/dashboard/analysis/:id" element={<WorkspacePage><AnalysisDetails /></WorkspacePage>} />
      <Route path="/dashboard/competitors" element={<WorkspacePage><CompetitorAnalysis /></WorkspacePage>} />
      <Route path="/dashboard/industry-competitors" element={<WorkspacePage><IndustryCompetitors /></WorkspacePage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
