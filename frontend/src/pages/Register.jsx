import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed."
        );
      }

      // Automatically log the user in after registration
      const loginResponse = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(
          "Registration successful. Please login."
        );
      }

      login(loginData.user, loginData.token);

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-6 py-12 text-slate-900">
      <div className="relative w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>

          <h1 className="text-4xl font-bold text-teal-700">
            StartForge AI
          </h1>

          <p className="text-slate-600 mt-2">
            Create your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10"
        >
          {error && (
            <div className="bg-rose-50 border border-red-500 text-rose-700 rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-700 mb-2">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 py-4 text-lg font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "🚀 Create Account"}
          </button>

          <p className="text-center text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-700 hover:text-teal-700"
            >
              Login
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}