export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center min-h-screen overflow-hidden px-6">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent"></div>

      {/* Glow Effect */}
      <div className="absolute w-[650px] h-[650px] bg-cyan-400/15 blur-[180px] rounded-full"></div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl">

        <p className="inline-block px-4 py-2 mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-sm">
          🚀 AI-Powered Startup Validation Platform
        </p>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight">
          Validate Your
          <span className="text-cyan-400"> Startup Ideas </span>
          with AI
        </h1>

        <p className="mt-8 text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
          Analyze your startup idea using AI, discover market opportunities,
          identify competitors, estimate development costs, and receive a
          complete business feasibility report in minutes.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-5">
          <button className="bg-cyan-500 hover:bg-cyan-600 transition px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-cyan-500/20">
            🚀 Try Now
          </button>

          <button className="border border-cyan-500 hover:bg-cyan-500 hover:text-black transition px-8 py-4 rounded-xl text-lg font-semibold">
            📄 Learn More
          </button>
        </div>

      </div>

    </section>
  );
}