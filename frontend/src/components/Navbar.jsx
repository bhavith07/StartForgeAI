import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Rocket, LayoutDashboard, LogOut, UserCircle } from "lucide-react";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function goToSection(section) {
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return;
    }
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goHome() {
    setMenuOpen(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const navButton = "text-sm font-medium text-slate-600 transition hover:text-teal-700";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <button onClick={goHome} className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
            <Rocket size={19} />
          </span>
          <span>StartForge <span className="text-teal-600">AI</span></span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          <button onClick={goHome} className={navButton}>Home</button>
          <button onClick={() => goToSection("features")} className={navButton}>Features</button>
          <button onClick={() => goToSection("how-it-works")} className={navButton}>How It Works</button>
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate("/dashboard")} className={`${navButton} flex items-center gap-2`}>
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
                  {user?.name?.charAt(0)?.toUpperCase() || <UserCircle size={18} />}
                </span>
                <span className="max-w-28 truncate text-sm font-semibold text-slate-700">{user?.name || "Account"}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className={navButton}>Login</button>
              <button onClick={() => navigate("/register")} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700">
                Get Started
              </button>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden" aria-label="Toggle navigation">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <button onClick={goHome} className={`${navButton} text-left`}>Home</button>
            <button onClick={() => goToSection("features")} className={`${navButton} text-left`}>Features</button>
            <button onClick={() => goToSection("how-it-works")} className={`${navButton} text-left`}>How It Works</button>
            {isLoggedIn ? (
              <>
                <button onClick={() => { setMenuOpen(false); navigate("/dashboard"); }} className={`${navButton} flex items-center gap-2 text-left`}><LayoutDashboard size={16}/> Dashboard</button>
                <div className="text-sm font-semibold text-slate-500">Signed in as {user?.name || "User"}</div>
                <button onClick={handleLogout} className="rounded-xl border border-rose-200 px-4 py-2.5 text-left text-sm font-semibold text-rose-600">Logout</button>
              </>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => { setMenuOpen(false); navigate("/login"); }} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Login</button>
                <button onClick={() => { setMenuOpen(false); navigate("/register"); }} className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white">Get Started</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
