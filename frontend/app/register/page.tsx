'use client';

import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, Check, ChefHat } from "lucide-react";

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            await api.post("/users", { name, email, password });
            
            // Show success message
            setSuccess(true);
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
            
        } catch (error: any) {
            setError(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream-bg flex items-center justify-center px-4 py-12">

            <div className="max-w-md w-full relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <h1 className="font-playfair text-4xl font-bold text-text-dark mb-2">
                        Join Spice Garden
                    </h1>
                    <p className="text-text-dark/70 font-inter">
                        Create your account to start your culinary journey
                    </p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-success-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-success-green" />
                            </div>
                            <h2 className="font-playfair text-2xl font-bold text-text-dark mb-4">
                                Registration Successful!
                            </h2>
                            <p className="text-text-dark/70 mb-6 font-inter">
                                Your account has been created successfully. Redirecting to login...
                            </p>
                            <div className="spinner border-4 border-primary-gold border-t-transparent rounded-full w-8 h-8 mx-auto animate-spin"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister}>
                            {/* Name Input */}
                            <div className="mb-6">
                                <label className="block text-text-dark text-sm font-medium mb-2 font-inter">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                        <User className="w-5 h-5 text-text-dark/40" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 border border-text-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold transition-all duration-300 font-inter"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

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
                            <div className="mb-6">
                                <label className="block text-text-dark text-sm font-medium mb-2 font-inter">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                        <Lock className="w-5 h-5 text-text-dark/40" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="At least 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
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

                            {/* Confirm Password Input */}
                            <div className="mb-8">
                                <label className="block text-text-dark text-sm font-medium mb-2 font-inter">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                        <Lock className="w-5 h-5 text-text-dark/40" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full pl-12 pr-12 py-3.5 border border-text-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-gold/50 focus:border-primary-gold transition-all duration-300 font-inter"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-dark/40 hover:text-text-dark/60 transition-colors"
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {password && confirmPassword && password === confirmPassword && (
                                    <p className="text-success-green text-sm mt-2 font-inter flex items-center">
                                        <Check className="w-4 h-4 mr-1" />
                                        Passwords match
                                    </p>
                                )}
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
                                className="w-full py-4 bg-primary-gold text-text-dark rounded-xl font-semibold text-lg hover:bg-primary-gold/90 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-text-dark border-t-transparent rounded-full animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="my-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-text-dark/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-text-dark/50 font-inter">
                                Already have an account?
                            </span>
                        </div>
                    </div>

                    <div>
                        <Link
                            href="/login"
                            className="w-full block text-center py-4 border border-text-dark/20 rounded-xl hover:bg-text-dark/5 transition-all duration-300 font-inter font-medium"
                        >
                            Sign In to Your Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}