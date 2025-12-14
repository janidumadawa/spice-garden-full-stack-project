"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../utils/AuthContext";
import { api } from "../utils/api";
import Link from "next/link";
import { CheckCircle, Home, Package } from "lucide-react";

interface OrderItem {
  id: string;
  menuItem: {
    name: string;
    basePrice: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  totalAmount: number;
  tax: number;
  deliveryFee: number;
  address: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!orderId) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, orderId, router]);

  if (!isAuthenticated || loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600">{error || "Order not found"}</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for your order. We've received it and will start preparing it right away.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{order.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Items Ordered</h3>
              <div className="mt-2 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{item.menuItem.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      Rs. {(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal</span>
                <span>Rs. {(order.totalAmount - order.tax - order.deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tax (10%)</span>
                <span>Rs. {order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Delivery Fee</span>
                <span>Rs. {order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                <span>Total Amount</span>
                <span>Rs. {order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-medium">{order.address}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <p className="font-medium capitalize">{order.orderStatus}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-medium capitalize">{order.paymentStatus}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Order Date & Time</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• We'll prepare your order and notify you when it's ready</li>
              <li>• You can track your order status in your order history</li>
              <li>• Estimated delivery time: 30-45 minutes</li>
              <li>• For any queries, contact: 011-123-4567</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            
            <Link
              href="/orders"
              className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading order details...</p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}