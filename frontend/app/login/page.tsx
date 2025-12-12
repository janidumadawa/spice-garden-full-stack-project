// frontend/app/login/page.tsx
"use client";

import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../utils/AuthContext";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/users/login", {
        email,
        password,
      });

      const token = res.data.token;
      const userData = res.data.user;

      // Use AuthContext login function - this handles localStorage
      login(token, {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role || "user" // Use role from API if available
      });

      //rediect base on role
      if (userData.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }

      
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-bg flex items-center justify-center px-4 py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary-red) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-md w-full relative z-10">

        <div className="mb-8 text-center">
          <h2 className="font-playfair text-4xl font-bold text-text-dark">
            Welcome Back
          </h2>
          <p className="text-text-dark/70 mt-2 font-inter">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-text-dark text-sm font-medium mb-2 font-inter">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-text-dark/40" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border border-text-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold transition-all duration-300 font-inter"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-text-dark text-sm font-medium font-inter">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-text-dark/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 border border-text-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold transition-all duration-300 font-inter"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-dark/40 hover:text-text-dark/60 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-inter flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-gold text-white rounded-xl font-semibold text-lg hover:bg-primary-gold/90 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-text-dark/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-text-dark/50 font-inter">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Simple Register Link */}
          <div>
            <Link
              href="/register"
              className="w-full block text-center py-4 border border-text-dark/20 rounded-xl hover:bg-text-dark/5 transition-all duration-300 font-inter font-medium"
            >
              Create an Account
            </Link>
          </div>
          
        </div>
      </div>

    </div>
  );
}