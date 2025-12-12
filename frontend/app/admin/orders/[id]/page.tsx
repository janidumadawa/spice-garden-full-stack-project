"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../utils/AuthContext";
import { api } from "../../../utils/api";
import Link from "next/link";
import { 
  ArrowLeft, Package, MapPin, Calendar, 
  CreditCard, Truck, CheckCircle, Clock, User,
  Phone, Mail, DollarSign, Edit
} from "lucide-react";

interface OrderItem {
  id: string;
  menuItem: {
    id: string;
    name: string;
    basePrice: number;
  };
  quantity: number;
  price: number;
  optionIds: string;
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  tax: number;
  deliveryFee: number;
  paymentStatus: string;
  orderStatus: string;
  promoCodeId: string | null;
  address: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
}

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/");
      return;
    }

    fetchOrder();
  }, [isAuthenticated, user, orderId, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err: any) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details. The order may not exist.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      setUpdatingStatus(true);
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state
      setOrder({ ...order, orderStatus: newStatus });
      alert(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "preparing":
        return <Package className="w-5 h-5" />;
      case "out_for_delivery":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Order Not Found</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin/orders"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Orders
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: "preparing", label: "Preparing", color: "bg-blue-500" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "bg-purple-500" },
    { value: "delivered", label: "Delivered", color: "bg-green-500" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  ].filter(opt => opt.value !== order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/orders"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Orders
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
                <p className="text-gray-600">Order #{order.id.substring(0, 12)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                {getStatusIcon(order.orderStatus)}
                <span className="capitalize">{order.orderStatus.replace('_', ' ')}</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                Rs. {order.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items ({order.items.length})
                </h2>
              </div>
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.menuItem.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Quantity: {item.quantity}</span>
                        <span>Unit Price: Rs. {item.price.toFixed(2)}</span>
                        <span>Subtotal: Rs. {(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>Rs. {(order.totalAmount - order.tax - order.deliveryFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span>Rs. {order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>Rs. {order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t">
                    <span>Total Amount</span>
                    <span>Rs. {order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Order Timeline</h2>
              
              <div className="space-y-6">
                {[
                  { status: "pending", label: "Order Placed", date: order.createdAt },
                  { status: "preparing", label: "Preparing Your Order" },
                  { status: "out_for_delivery", label: "Out for Delivery" },
                  { status: "delivered", label: "Delivered" },
                ].map((step, index) => (
                  <div key={step.status} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      (() => {
                        const orderStatusIndex = ["pending", "preparing", "out_for_delivery", "delivered"].indexOf(order.orderStatus);
                        const stepIndex = ["pending", "preparing", "out_for_delivery", "delivered"].indexOf(step.status);
                        return stepIndex <= orderStatusIndex 
                          ? "bg-green-100 text-green-600" 
                          : "bg-gray-100 text-gray-400";
                      })()
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{step.label}</h4>
                      {step.date && (
                        <p className="text-gray-600 text-sm">
                          {new Date(step.date).toLocaleDateString()} at{" "}
                          {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {step.status === order.orderStatus && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Current Status
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Info & Actions */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-sm text-gray-600">Customer</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{order.user.email}</p>
                    <p className="text-sm text-gray-600">Email</p>
                  </div>
                </div>
                
                {order.user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{order.user.phone}</p>
                      <p className="text-sm text-gray-600">Phone</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <Link
                    href={`mailto:${order.user.email}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2"
                  >
                    Contact Customer
                  </Link>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Delivery Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                  <p className="font-medium">{order.address}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="font-medium capitalize">
                    {order.paymentStatus === "paid" ? "Online Payment" : "Cash on Delivery"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <p className="font-medium capitalize">{order.paymentStatus}</p>
                </div>
              </div>
            </div>

            {/* Update Status */}
            {order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Edit className="w-5 h-5 mr-2" />
                  Update Order Status
                </h2>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Current status: <span className="font-medium capitalize">{order.orderStatus.replace('_', ' ')}</span></p>
                  
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateOrderStatus(option.value)}
                        disabled={updatingStatus}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium ${option.color} text-white hover:opacity-90 disabled:opacity-50`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}