// frontend/app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../utils/AuthContext";
import AdminNavigation from "@/app/components/AdminNavigation";
import { useRouter } from "next/navigation";
import { api } from "../../utils/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  _count: {
    orders: number;
    addresses: number;
  };
}

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
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

    fetchUsers();
  }, [isAuthenticated, user, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers(); // Refresh list
    } catch (error) {
      alert("Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600">Total users: {users.length}</p>
          </div>
          
          <div className="flex gap-2">
            <button onClick={fetchUsers} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Refresh
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Orders</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(userItem => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{userItem.name}</p>
                      <p className="text-sm text-gray-600">ID: {userItem.id.slice(-8)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{userItem.email}</p>
                      {userItem.phone && <p className="text-sm text-gray-600">{userItem.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {userItem._count.orders} orders
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userItem.role === "admin" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {userItem.role}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}