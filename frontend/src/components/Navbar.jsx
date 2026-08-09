import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  function goToSection(section) {
    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        const element = document.getElementById(section);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } else {
      const element = document.getElementById(section);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }

  function goHome() {
    navigate("/");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleLogout() {
    logout();

    navigate("/");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={goHome}
          className="text-2xl font-bold text-cyan-400"
        >
          🚀 StartForge AI
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">

          {/* HOME */}
          <button
            onClick={goHome}
            className="text-gray-300 hover:text-cyan-400 transition"
          >
            Home
          </button>

          {/* FEATURES */}
          <button
            onClick={() => goToSection("features")}
            className="text-gray-300 hover:text-cyan-400 transition"
          >
            Features
          </button>

          {/* HOW IT WORKS */}
          <button
            onClick={() => goToSection("how-it-works")}
            className="text-gray-300 hover:text-cyan-400 transition"
          >
            How It Works
          </button>

          {isLoggedIn ? (
            <>
              {/* DASHBOARD */}
              <button
                onClick={() => {
                  navigate("/dashboard");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="text-gray-300 hover:text-cyan-400 transition"
              >
                Dashboard
              </button>

              {/* USER */}
              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-slate-950">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                <span className="text-gray-200">
                  {user?.name}
                </span>

              </div>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* LOGIN */}
              <button
                onClick={() => navigate("/login")}
                className="text-gray-300 hover:text-cyan-400 transition"
              >
                Login
              </button>

              {/* GET STARTED */}
              <button
                onClick={() => navigate("/register")}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-5 py-2.5 rounded-lg transition"
              >
                Get Started
              </button>
            </>
          )}

        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="border border-red-500 text-red-400 px-3 py-2 rounded-lg"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-lg"
            >
              Login
            </button>
          )}

        </div>

      </div>
    </nav>
  );
}