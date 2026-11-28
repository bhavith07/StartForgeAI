import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Home, LayoutDashboard, Rocket, Search, LogOut, Globe2,
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
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#102b3b] via-[#124b50] to-[#087f75] shadow-[0_8px_30px_-16px_rgba(5,35,45,0.8)]">
        <div className="flex h-[72px] items-center gap-4 px-4 sm:px-7">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-200/40 bg-lime-300 text-[#173b3b] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <button onClick={() => go(homePath)} className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">🚀</span>
            <span>StartForge <span className="text-lime-300">AI</span></span>
          </button>

          <div className="ml-auto flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="hidden text-sm font-medium text-teal-50 sm:inline">Welcome, {user?.name || "Founder"}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-sm font-bold text-lime-200">
                  {user?.name?.charAt(0)?.toUpperCase() || <UserCircle size={18} />}
                </span>
              </>
            ) : (
              <>
                <button onClick={() => go("/login")} className="rounded-lg px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10">Login</button>
                <button onClick={() => go("/register")} className="rounded-lg bg-lime-300 px-4 py-2 text-sm font-bold text-[#173b3b] transition hover:bg-lime-200">Get Started</button>
              </>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <button aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px]" />
          <aside className="fixed bottom-0 left-0 top-[72px] z-50 flex w-[min(88vw,310px)] flex-col border-r border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-[#142f43] via-[#155b5b] to-[#078477] p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-lime-200">
                <Sparkles size={14} /> {isLoggedIn ? "Founder workspace" : "Explore StartForge"}
              </div>
              <p className="mt-2 text-lg font-bold">{isLoggedIn ? user?.name || "Welcome back" : "Build your next big idea"}</p>
              <p className="mt-1 text-xs leading-5 text-teal-50">Your startup research tools, all in one place.</p>
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
                    <Search size={18} /> Local Competitors <ChevronRight className="ml-auto" size={15} />
                  </button>
                  <button className={itemClass} onClick={() => go("/dashboard/industry-competitors")}>
                    <Globe2 size={18} /> Industry Competitors <ChevronRight className="ml-auto" size={15} />
                  </button>
                </div>
              )}

              {!isLoggedIn && (
                <div>
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Discover</p>
                  <button className={itemClass} onClick={() => goToSection("features")}>Features</button>
                </div>
              )}
            </nav>

            <div className="border-t border-slate-100 pt-3">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                  <LogOut size={18} /> Logout
                </button>
              ) : (
                <button onClick={() => go("/register")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800">
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
