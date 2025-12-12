// frontend/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { api } from "../utils/api";
import Link from "next/link";
import AddressModal from "../components/AddressModal";
import { User, MapPin, Package, Settings, ChevronRight } from "lucide-react";
import Navigation from "../components/Navigation";

interface Address {
  id: string;
  street: string;
  city: string;
  zipCode: string;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  address: string;
  items: OrderItem[];
}

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await api.get("/orders/user/current");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === "orders") {
      fetchOrders();
    }
  }, [user, activeTab]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put("/users/profile", { name, phone });
      alert("Profile updated successfully!");

      // Update localStorage with new phone
      localStorage.setItem("userPhone", phone);

      await checkAuth();
    } catch (error) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await api.delete(`/addresses/${addressId}`);
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Error deleting address");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await api.patch(`/addresses/${addressId}/default`);
      fetchAddresses();
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Please Login
          </h2>
          <p className="text-gray-600 mb-6">
            You need to login to view your profile
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#D4AF37] text-white px-6 py-3 rounded-lg hover:bg-[#b38f2a] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <Navigation />
        <div className="mb-8 mt-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">
            Manage your profile, addresses, and orders
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile"
                      ? "bg-[#D4AF37] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3" />
                    <span>Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "addresses"
                      ? "bg-[#D4AF37] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3" />
                    <span>Addresses</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "orders"
                      ? "bg-[#D4AF37] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-3" />
                    <span>Orders</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <Link
                  href="/profile/change-password"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-3" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Profile Information
                </h2>

                <form onSubmit={updateProfile} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Email address cannot be changed
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#D4AF37] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#b38f2a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      My Addresses
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Manage your delivery addresses
                    </p>
                  </div>
                  <button
                    onClick={handleAddAddress}
                    className="mt-4 sm:mt-0 bg-[#D4AF37] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#b38f2a] transition-colors flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No addresses saved
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add your first delivery address
                    </p>
                    <button
                      onClick={handleAddAddress}
                      className="bg-[#D4AF37] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#b38f2a] transition-colors"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-xl p-5 transition-all hover:shadow-md ${
                          address.isDefault
                            ? "border-[#D4AF37] border-2 bg-[#ffffff]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            {address.isDefault && (
                              <span className="bg-[#D4AF37] text-white text-xs font-semibold px-3 py-1 rounded-full mr-3">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-[#D4AF37] hover:text-[#b38f2a] text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="font-medium text-gray-900 text-lg">
                            {address.street}
                          </p>
                          <p className="text-gray-600">
                            {address.city}, {address.zipCode}
                          </p>
                        </div>

                        {!address.isDefault && (
                          <div className="mt-5 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleSetDefault(address.id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                            >
                              <span>Set as Default Address</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Address Modal */}
                <AddressModal
                  isOpen={modalOpen}
                  onClose={() => setModalOpen(false)}
                  address={editingAddress}
                  onSuccess={fetchAddresses}
                />
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Order History
                  </h2>
                  <p className="text-gray-600 mt-1">Your recent orders</p>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37] mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start ordering from our delicious menu
                    </p>
                    <Link
                      href="/items"
                      className="inline-block bg-[#D4AF37] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#b38f2a] transition-colors"
                    >
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                Order #{order.id.slice(-6)}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  order.orderStatus
                                )}`}
                              >
                                {order.orderStatus}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <p className="text-lg font-bold text-[#D4AF37]">
                              Rs. {order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="border-t pt-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Items</p>
                              <p className="font-medium">
                                {order.items.length} item
                                {order.items.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Payment</p>
                              <p className="font-medium capitalize">
                                {order.paymentStatus}
                              </p>
                            </div>
                          </div>

                          {/* Order Items Summary */}
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-1">
                              Items ordered:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {order.items.slice(0, 3).map((item, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                                >
                                  {item.menuItem.name} (×{item.quantity})
                                </span>
                              ))}
                              {order.items.length > 3 && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delivery Address */}
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              Delivery Address:
                            </p>
                            <p className="text-sm font-medium truncate">
                              {order.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            
          </div>
        </div>
      </div>
    </div>
  );
}
