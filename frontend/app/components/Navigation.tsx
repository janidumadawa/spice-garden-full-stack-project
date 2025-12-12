// frontend/app/components/Navigation.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Package,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import { useCart } from "../utils/CartContext";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Get auth and cart data
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, loading: cartLoading } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-dropdown")) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user's first letter for avatar
  const getUserInitial = () => {
    if (!user?.name) return "U";
    return user.name.charAt(0).toUpperCase();
  };

  // Calculate total cart items - ONLY when logged in
  const getCartItemCount = () => {
    if (!isAuthenticated) return 0; // No cart badge when logged out
    if (!cart || cart.cartId === null) return 0;
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    return cart.totalQuantity || 0;
  };

  const cartItemCount = getCartItemCount();

  // Navigation items - dynamic based on auth status
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/items" },
    { name: "About Us", href: "/#story" },
    { name: "Contact", href: "/#footer" },
  ];

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    // Optionally redirect to home page
    // window.location.href = '/';
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-cream-bg/95 backdrop-blur-lg shadow-md"
          : "bg-[#FFF8E7]/55"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div>
              <h1 className="font-playfair text-2xl font-bold text-text-dark">
                Spice Garden
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-inter font-medium text-text-dark hover:text-primary-red transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {/* Cart Icon with Badge */}
            <Link href="/cart" className="relative">
              <div className="w-10 h-10 rounded-full bg-primary-gold flex items-center justify-center hover:bg-primary-gold/80 transition-colors relative">
                <ShoppingCart className="w-6 h-6 text-black" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </div>
            </Link>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-red text-white flex items-center justify-center font-semibold text-lg hover:bg-primary-red/90 transition-colors">
                    {getUserInitial()}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-text-dark transition-transform ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-text-dark truncate">
                        {user?.name}
                      </p>
                      <p className="text-sm text-text-dark/70 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Dropdown Items */}
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-3 text-text-dark hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      My Profile
                    </Link>

                    {user?.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-3 text-text-dark hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-3" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/orders"
                      className="flex items-center px-4 py-3 text-text-dark hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <Package className="w-4 h-4 mr-3" />
                      My Orders
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login Button (when not authenticated)
              <Link
                href="/login"
                className="font-inter font-medium text-text-dark hover:text-primary-red transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-text-dark"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 font-inter text-text-dark hover:text-primary-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Cart Link */}
            <Link
              href="/cart"
              className="block py-2 font-inter text-text-dark hover:text-primary-red transition-colors relative flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart{" "}
              {isAuthenticated && cartItemCount > 0 && `(${cartItemCount})`}
            </Link>

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <>
                <div className="py-2 border-t border-gray-200 mt-2 pt-2">
                  <p className="text-sm font-semibold text-text-dark">
                    {user?.name}
                  </p>
                  <p className="text-xs text-text-dark/70">{user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="block py-2 text-text-dark hover:text-primary-red transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>

                
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="block py-2 text-text-dark hover:text-primary-red transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  href="/orders"
                  className="block py-2 text-text-dark hover:text-primary-red transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block py-2 font-inter text-text-dark hover:text-primary-red transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
