export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-10 py-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <h1 className="text-3xl font-bold text-cyan-400">
        🚀 StartForge AI
      </h1>

      <div className="flex items-center gap-6">
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="hover:text-cyan-400 transition"
        >
          Home
        </button>

        <button
          onClick={() =>
            document.getElementById("features")?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className="hover:text-cyan-400 transition"
        >
          Features
        </button>

        <button
          onClick={() =>
            document.getElementById("how-it-works")?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className="hover:text-cyan-400 transition"
        >
          How It Works
        </button>

        <button
          onClick={() =>
            document.getElementById("demo")?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg transition"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}