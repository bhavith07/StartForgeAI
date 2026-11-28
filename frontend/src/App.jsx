import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AnalysisDetails from "./pages/AnalysisDetails";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";

import ProtectedRoute from "./components/ProtectedRoute";
import WorkspaceLayout from "./components/WorkspaceLayout";

function WorkspacePage({ children }) {
  return <ProtectedRoute><WorkspaceLayout>{children}</WorkspaceLayout></ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<WorkspacePage><Dashboard /></WorkspacePage>} />
      <Route path="/dashboard/analysis/:id" element={<WorkspacePage><AnalysisDetails /></WorkspacePage>} />
      <Route path="/dashboard/competitors" element={<WorkspacePage><CompetitorAnalysis /></WorkspacePage>} />
    </Routes>
  );
}
