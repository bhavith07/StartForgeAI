import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AnalysisDetails from "./pages/AnalysisDetails";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>

      {/* ================================
          PUBLIC PAGES
      ================================= */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ================================
          PROTECTED DASHBOARD
      ================================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ================================
          PROTECTED ANALYSIS DETAILS
      ================================= */}

      <Route
        path="/dashboard/analysis/:id"
        element={
          <ProtectedRoute>
            <AnalysisDetails />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}