import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config/api";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "username" ? value.replace(/\s/g, "") : value,
    }));

    if (error) setError("");
  }

  function validateForm() {
    const name = form.name.trim();
    const username = form.username.trim();
    const email = form.email.trim();

    if (!name || !username || !email || !form.password) {
      return "Please fill in all fields.";
    }

    if (
      name.length < 2 ||
      name.length > 100 ||
      !/^(?=.*\p{L})[\p{L}\p{M} .'-]+$/u.test(name)
    ) {
      return "Enter a valid name containing at least one letter.";
    }

    if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(username)) {
      return "Username must be 3-20 characters and start with a letter.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return "Enter a valid email address.";
    }

    if (
      form.password.length < 8 ||
      new TextEncoder().encode(form.password).length > 72
    ) {
      return "Password must contain at least 8 characters.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const registrationResponse = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            name: form.name.trim(),
            username: form.username.trim(),
            email: form.email.trim().toLowerCase(),
          }),
        }
      );

      const registrationData = await registrationResponse.json();

      if (!registrationResponse.ok) {
        throw new Error(
          registrationData.message || "Registration failed."
        );
      }

      // Automatically log in after successful registration.
      const loginResponse = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            password: form.password,
          }),
        }
      );

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(
          "Account created successfully. Please log in."
        );
      }

      login(loginData.user, loginData.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-6 py-12 text-slate-900">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🚀</div>
          <h1 className="text-4xl font-bold text-teal-700">
            StartForge AI
          </h1>
          <p className="mt-2 text-slate-600">
            Create your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10"
        >
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-rose-50 p-3 text-rose-700"
            >
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-slate-700" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              maxLength={100}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-slate-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. bhavith07"
              autoComplete="username"
              minLength={3}
              maxLength={20}
              required
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              3-20 characters. Start with a letter; use letters, numbers or underscores.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              maxLength={255}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-slate-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 transition hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              >
                {showPassword ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Use at least 8 characters.
            </p>
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
            <Link to="/login" className="text-teal-700 hover:text-teal-800">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
