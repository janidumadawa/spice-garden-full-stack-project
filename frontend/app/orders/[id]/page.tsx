"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../utils/AuthContext";
import { orderApi, Order } from "../../utils/orderApi";
import Link from "next/link";
import { 
  ArrowLeft, Package, MapPin, Calendar, 
  CreditCard, Truck, CheckCircle, Clock 
} from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchOrder();
  }, [isAuthenticated, orderId, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrderDetails(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details. The order may not exist or you may not have permission to view it.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Order Not Found</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/orders"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Orders
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate order timeline
  const orderDate = new Date(order.createdAt);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 45);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
            <p className="text-gray-600">Order #{order.id.substring(0, 12)}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full font-medium ${
              order.orderStatus === "completed" ? "bg-green-100 text-green-800" :
              order.orderStatus === "cancelled" ? "bg-red-100 text-red-800" :
              "bg-yellow-100 text-yellow-800"
            }`}>
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </div>
            <div className="text-2xl font-bold text-gray-800">
              Rs. {order.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Items
            </h2>
            
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between py-4 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.menuItem.imageUrl ? (
                          <img 
                            src={item.menuItem.imageUrl} 
                            alt={item.menuItem.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg">{item.menuItem.name}</h3>
                        <p className="text-gray-600 mt-1">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">Unit Price: Rs. {item.price.toFixed(2)}</p>
                        
                        {/* Display options if any */}
                        {item.optionIds && item.optionIds !== "[]" && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Customizations applied</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      Rs. {(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Order Timeline</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Order Placed</h4>
                  <p className="text-gray-600">
                    {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Preparing Your Order</h4>
                  <p className="text-gray-600">Your food is being prepared by our chefs</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full ${
                  order.orderStatus === "delivered" || order.orderStatus === "completed" 
                    ? "bg-blue-100" 
                    : "bg-gray-100"
                } flex items-center justify-center flex-shrink-0`}>
                  <Truck className={`w-5 h-5 ${
                    order.orderStatus === "delivered" || order.orderStatus === "completed" 
                      ? "text-blue-600" 
                      : "text-gray-400"
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold">Out for Delivery</h4>
                  <p className="text-gray-600">
                    Estimated delivery: {estimatedDelivery.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
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
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Rs. {order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Delivery Information
            </h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-medium">{order.address}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {orderDate.toLocaleDateString()} at{" "}
                    {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">
                  {order.paymentStatus === "paid" ? "Online Payment" : "Cash on Delivery"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-medium capitalize">{order.paymentStatus}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">           
            <Link
              href="/items"
              className="block w-full text-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              Order Something New
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}