"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../utils/AuthContext";
import { api } from "../../../../utils/api";
import MenuItemForm from "../../components/MenuItemForm";

export default function EditMenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [menuItem, setMenuItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const itemId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/");
      return;
    }

    fetchMenuItem();
  }, [isAuthenticated, user, itemId, router]);

  const fetchMenuItem = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/menu-items`);
      const items = response.data;
      const item = items.find((item: any) => item.id === itemId);
      
      if (!item) {
        setError("Menu item not found");
      } else {
        setMenuItem(item);
      }
    } catch (err) {
      console.error("Failed to fetch menu item:", err);
      setError("Failed to load menu item");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading menu item...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  if (error || !menuItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Menu Item Not Found</h2>
          <p className="text-red-600 mb-6">{error || "The menu item does not exist."}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/admin/menu-items")}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Menu
            </button>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <MenuItemForm initialData={menuItem} isEditing={true} />
      </div>
    </div>
  );
}