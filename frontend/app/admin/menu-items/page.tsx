//D:\visual studio program\spice-garden-full-stack-project\frontend\app\admin\menu-items\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../utils/AuthContext";
import AdminNavigation from "@/app/components/AdminNavigation";
import { useRouter } from "next/navigation";
import { api } from "../../utils/api";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/app/components/Footer";
import {
  Plus, Search, Filter, Edit, Trash2, Eye,
  Package, Tag, ToggleLeft, ToggleRight,
  AlertCircle, CheckCircle, XCircle, MoreVertical
} from "lucide-react";

interface MenuItemOption {
  id: string;
  name: string;
  extraPrice: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  isAvailable: boolean;
  imageUrl?: string;
  category: Category;
  options: MenuItemOption[];
  createdAt: string;
}

export default function AdminMenuItemsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/");
      return;
    }

    fetchData();
  }, [isAuthenticated, user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch menu items
      const [itemsResponse, categoriesResponse] = await Promise.all([
        api.get("/admin/menu-items"),
        api.get("/admin/categories")
      ]);

      setMenuItems(itemsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load menu items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/menu-items/${itemId}`, {
        isAvailable: !currentStatus
      });

      // Update local state
      setMenuItems(menuItems.map(item =>
        item.id === itemId
          ? { ...item, isAvailable: !currentStatus }
          : item
      ));

      alert(`Item ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (err: any) {
      console.error("Failed to update item:", err);
      alert("Failed to update item. Please try again.");
    }
  };

  const deleteMenuItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/menu-items/${itemId}`);
      
      // Remove from local state
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      
      alert(`"${itemName}" deleted successfully`);
    } catch (err: any) {
      console.error("Failed to delete item:", err);
      alert(err.response?.data?.error || "Failed to delete item. It may exist in existing orders.");
    }
  };

  const filteredItems = menuItems.filter(item => {
    // Search filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "all" && item.category.id !== categoryFilter) {
      return false;
    }

    // Availability filter
    if (availabilityFilter === "available" && !item.isAvailable) {
      return false;
    }
    if (availabilityFilter === "unavailable" && item.isAvailable) {
      return false;
    }

    return true;
  });

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />

      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
              <p className="text-gray-600">Manage your restaurant's menu items</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <Link
                href="/admin/menu-items/new"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Item
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Items
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Items</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchData}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{menuItems.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {menuItems.filter(item => item.isAvailable).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unavailable</p>
                <p className="text-2xl font-bold text-red-600">
                  {menuItems.filter(item => !item.isAvailable).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              </div>
              <Tag className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Menu Items Found</h3>
            <p className="text-gray-600 mb-6">
              {menuItems.length === 0 
                ? "You haven't added any menu items yet." 
                : "Try changing your search or filters."}
            </p>
            <Link
              href="/admin/menu-items/new"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Item Image */}
                <div className="relative h-48 bg-gray-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                      {item.category.name}
                    </span>
                  </div>
                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      item.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        Rs. {item.basePrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.options.length} option{item.options.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Options Preview */}
                  {item.options.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.options.slice(0, 3).map(option => (
                          <span
                            key={option.id}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {option.name} (+Rs. {option.extraPrice.toFixed(2)})
                          </span>
                        ))}
                        {item.options.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{item.options.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAvailability(item.id, item.isAvailable)}
                        className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                          item.isAvailable
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <ToggleRight className="w-4 h-4 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 mr-1" />
                            Enable
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/menu-items/${item.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteMenuItem(item.id, item.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Categories</h2>
              <p className="text-gray-600">Manage your menu categories</p>
            </div>
            <Link
              href="/admin/categories"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Manage Categories
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No categories yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{category.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {menuItems.filter(item => item.category.id === category.id).length} items
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
}