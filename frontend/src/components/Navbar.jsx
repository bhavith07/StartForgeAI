import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Home, LayoutDashboard, Rocket, Search, LogOut,
  UserCircle, Sparkles, ChevronRight
} from "lucide-react";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function go(path) {
    setMenuOpen(false);
    navigate(path);
  }

  function goToSection(section) {
    setMenuOpen(false);
    if (location.pathname !== "/home") {
      navigate("/home#" + section);
      return;
    }
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const homePath = isLoggedIn ? "/home" : "/";
  const itemClass = "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-800";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="flex h-[68px] items-center gap-4 px-4 sm:px-7">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <button onClick={() => go(homePath)} className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">🚀</span>
            <span>StartForge <span className="text-teal-600">AI</span></span>
          </button>

          <div className="ml-auto flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="hidden text-sm font-medium text-slate-600 sm:inline">Welcome, {user?.name || "Founder"}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
                  {user?.name?.charAt(0)?.toUpperCase() || <UserCircle size={18} />}
                </span>
              </>
            ) : (
              <>
                <button onClick={() => go("/login")} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Login</button>
                <button onClick={() => go("/register")} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">Get Started</button>
              </>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <button aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-slate-950/35" />
          <aside className="fixed bottom-0 left-0 top-[68px] z-50 flex w-[min(88vw,310px)] flex-col border-r border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-[#20364d] to-[#0f766e] p-4 text-white">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-100">
                <Sparkles size={14} /> {isLoggedIn ? "Founder workspace" : "Explore StartForge"}
              </div>
              <p className="mt-2 text-lg font-bold">{isLoggedIn ? user?.name || "Welcome back" : "Build your next big idea"}</p>
              <p className="mt-1 text-xs leading-5 text-slate-200">Your startup research tools, all in one place.</p>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto">
              <div>
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Main</p>
                <button className={itemClass} onClick={() => go(homePath)}>
                  <Home size={18} /> Home <ChevronRight className="ml-auto" size={15} />
                </button>
                {isLoggedIn && (
                  <button className={itemClass} onClick={() => go("/dashboard")}>
                    <LayoutDashboard size={18} /> Dashboard <ChevronRight className="ml-auto" size={15} />
                  </button>
                )}
              </div>

              {isLoggedIn && (
                <div>
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Startup tools</p>
                  <button className={itemClass} onClick={() => go("/dashboard/analyze")}>
                    <Rocket size={18} /> Analyze Startup <ChevronRight className="ml-auto" size={15} />
                  </button>
                  <button className={itemClass} onClick={() => go("/dashboard/competitors")}>
                    <Search size={18} /> Competitor Intelligence <ChevronRight className="ml-auto" size={15} />
                  </button>
                </div>
              )}

              {!isLoggedIn && (
                <div>
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Discover</p>
                  <button className={itemClass} onClick={() => goToSection("features")}>Features</button>
                  <button className={itemClass} onClick={() => goToSection("how-it-works")}>How It Works</button>
                </div>
              )}
            </nav>

            <div className="border-t border-slate-100 pt-3">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                  <LogOut size={18} /> Logout
                </button>
              ) : (
                <button onClick={() => go("/register")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700">
                  Create an account <ChevronRight size={16} />
                </button>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
