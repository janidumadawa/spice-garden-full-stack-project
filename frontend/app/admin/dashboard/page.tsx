// frontend/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../utils/AuthContext";
import AdminNavigation from "@/app/components/AdminNavigation";
import { useRouter } from "next/navigation";
import { api } from "../../utils/api";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalUsers: 0,
    totalMenuItems: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/");
      return;
    }

    fetchStats();
  }, [isAuthenticated, user, router]);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Today's Orders</p>
            <p className="text-2xl font-bold text-blue-600">{stats.todayOrders}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Pending Orders</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Today's Revenue</p>
            <p className="text-2xl font-bold text-green-600">Rs. {stats.todayRevenue.toFixed(2)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Total Users</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin/orders" className="block p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-gray-800">Manage Orders</h3>
              <p className="text-sm text-gray-600 mt-1">View and update orders</p>
            </Link>
            
            <Link href="/admin/menu-items" className="block p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-gray-800">Manage Menu</h3>
              <p className="text-sm text-gray-600 mt-1">Add/edit menu items</p>
            </Link>
            
            <Link href="/admin/categories" className="block p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-gray-800">Categories</h3>
              <p className="text-sm text-gray-600 mt-1">Manage food categories</p>
            </Link>
            
            <Link href="/admin/users" className="block p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-gray-800">Users</h3>
              <p className="text-sm text-gray-600 mt-1">Manage users</p>
            </Link>
          </div>
        </div>

        {/* Total Stats */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Overall Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Total Orders</p>
              <p className="text-xl font-bold">{stats.totalOrders}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold">Rs. {stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">Menu Items</p>
              <p className="text-xl font-bold">{stats.totalMenuItems}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}