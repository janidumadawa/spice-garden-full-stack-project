// frontend/app/components/AdminNavigation.tsx
"use client";

import Link from "next/link";
import { useAuth } from "../utils/AuthContext";
import { useRouter } from "next/navigation";
import { Home, Package, Tag, ClipboardList, BarChart3, Settings, LogOut, User } from "lucide-react";

export default function AdminNavigation() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Menu Items", href: "/admin/menu-items", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Tag },
    { name: "Users", href: "/admin/users", icon: User },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Admin Panel</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Side: User & Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>View Site</span>
            </Link>

            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}