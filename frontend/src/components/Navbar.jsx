import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, LogOut, UserCircle } from "lucide-react";

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

  const navButton = "rounded-lg px-3 py-2 text-sm font-medium text-green-50 transition-all duration-150 hover:bg-lime-300 hover:text-green-950 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300";

  return (
    <nav className="brand-navbar fixed inset-x-0 top-0 z-50 border-b border-lime-400/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <button onClick={goHome} className="group flex items-center gap-2 rounded-lg text-xl font-extrabold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 sm:text-2xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-300 text-green-950 shadow-sm transition-all duration-200 group-hover:-rotate-6 group-hover:bg-lime-200 group-hover:shadow-md">
            <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.4 5.1c-4 1.4-7.1 4.7-8.5 8.7l8.3 8.3c4-1.4 7.3-4.5 8.7-8.5l.9-7.6-9.4-.9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <circle cx="20.4" cy="11.6" r="2.1" stroke="currentColor" strokeWidth="1.7" />
              <path d="m10.3 15.2-4.1 1.2 1.2 4.1 4.2-1.3M16.8 21.6l-1.3 4.2 4.1 1.2 1.2-4.1M8.2 23.8l-2.4 2.4M24.7 3.8v3.1M26.2 5.3h-3.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>StartForge <span className="text-lime-300">AI</span></span>
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
              <div className="flex items-center gap-2 border-l border-white/20 pl-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-100 text-sm font-bold text-green-900">
                  {user?.name?.charAt(0)?.toUpperCase() || <UserCircle size={18} />}
                </span>
                <span className="max-w-28 truncate text-sm font-semibold text-green-50">{user?.name || "Account"}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className={navButton}>Login</button>
              <button onClick={() => navigate("/register")} className="rounded-lg bg-lime-300 px-5 py-2.5 text-sm font-semibold text-green-950 transition-colors hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900">
                Get Started
              </button>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 text-green-50 transition-colors hover:bg-lime-300 hover:text-green-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 md:hidden" aria-label="Toggle navigation">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-lime-400/40 bg-green-900 px-5 py-4 shadow-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <button onClick={goHome} className={`${navButton} text-left`}>Home</button>
            <button onClick={() => goToSection("features")} className={`${navButton} text-left`}>Features</button>
            <button onClick={() => goToSection("how-it-works")} className={`${navButton} text-left`}>How It Works</button>
            {isLoggedIn ? (
              <>
                <button onClick={() => { setMenuOpen(false); navigate("/dashboard"); }} className={`${navButton} flex items-center gap-2 text-left`}><LayoutDashboard size={16}/> Dashboard</button>
                <div className="text-sm font-semibold text-green-100/80">Signed in as {user?.name || "User"}</div>
                <button onClick={handleLogout} className="rounded-xl border border-rose-200/40 px-4 py-2.5 text-left text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-400/10">Logout</button>
              </>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => { setMenuOpen(false); navigate("/login"); }} className="flex-1 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">Login</button>
                <button onClick={() => { setMenuOpen(false); navigate("/register"); }} className="flex-1 rounded-lg bg-lime-300 px-4 py-2.5 text-sm font-semibold text-green-950 transition-colors hover:bg-lime-200">Get Started</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
