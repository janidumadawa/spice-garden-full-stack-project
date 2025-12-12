// frontend/app/checkout/page.jsx
"use client";

import { useState, useEffect, useRef } from "react"; // Added useRef
import { useAuth } from "../utils/AuthContext";
import { useCart } from "../utils/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../utils/api";

export default function CheckoutPage() {
  const { isAuthenticated, user } = useAuth();
  const { cart, loading, fetchCart } = useCart();
  const router = useRouter();
  
  // State for addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [manualAddress, setManualAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false); // NEW: Track if order placed

  // 🔧 FIX: Move redirects to useEffect but prevent after order
  useEffect(() => {
    // Don't redirect if we just placed an order
    if (hasPlacedOrder) return;
    
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    if (!loading && (!cart || cart.items.length === 0)) {
      router.push("/cart");
      return;
    }
  }, [isAuthenticated, loading, cart, router, hasPlacedOrder]); // Added hasPlacedOrder

  // Fetch user addresses
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data);
      
      // Set default address if exists
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  // Show loading
  if (!isAuthenticated || loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  // Check cart emptiness - but not if we just placed an order
  if (!hasPlacedOrder && (!cart || cart.items.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Your cart is empty</p>
          <Link href="/cart" className="text-blue-500">
            Go to Cart
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    // Validate address
    if (useSavedAddress && !selectedAddressId && addresses.length > 0) {
      setError("Please select a saved address or switch to manual entry");
      return;
    }
    
    if (!useSavedAddress && !manualAddress.trim()) {
      setError("Please enter delivery address");
      return;
    }

    setIsPlacingOrder(true);
    setError("");

    try {
      // Prepare order data
      const orderData = {
        notes,
        paymentStatus: "pending",
      };

      // Add address based on selection
      if (useSavedAddress && selectedAddressId) {
        orderData.addressId = selectedAddressId;
      } else {
        orderData.address = manualAddress.trim();
      }

      // Call order API
      const response = await api.post("/orders", orderData);

      // Set order placed flag BEFORE refreshing cart
      setHasPlacedOrder(true);
      
      // Refresh cart state (this will make cart empty)
      await fetchCart();
      
      // Redirect to order confirmation
      router.push(`/order-confirmation?orderId=${response.data.orderId}`);
      
    } catch (err) {
      console.error("Error placing order:", err);
      setError(err.response?.data?.error || "Failed to place order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  // Rest of your JSX remains exactly the same...
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          {cart?.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 border-b">
              <div>
                <p className="font-medium">{item.menuItem.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">
                Rs. {(item.quantity * item.unitPrice).toFixed(2)}
              </p>
            </div>
          ))}
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {cart?.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>Rs. 200.00</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>Rs. {(cart ? cart.totalPrice * 0.1 : 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
              <span>Total</span>
              <span>
                Rs. {cart ? (cart.totalPrice + 200 + cart.totalPrice * 0.1).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
          
          {/* Address Selection */}
          <div className="mb-6">

            {/* Saved Addresses Dropdown */}
            {useSavedAddress && addresses.length > 0 && (
              <div className="ml-6 mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Address *
                </label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose an address</option>
                  {addresses.map(address => (
                    <option key={address.id} value={address.id}>
                      {address.street}, {address.city} {address.zipCode}
                      {address.isDefault && " (Default)"}
                    </option>
                  ))}
                </select>
                
                <div className="mt-2 flex justify-between">
                  <Link 
                    href="/profile?tab=addresses" 
                    className="text-blue-500 text-sm hover:underline"
                  >
                    Manage addresses
                  </Link>
                </div>
              </div>
            )}

            {/* Manual Address Input */}
            {(!useSavedAddress || addresses.length === 0) && (
              <div className="ml-6">
                <label className="block text-sm font-medium mb-2">
                  Delivery Address *
                </label>
                <textarea
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter your complete delivery address (Street, City, Zip Code)"
                  required
                />
              </div>
            )}
          </div>
          
          {/* Delivery Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Delivery Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Any special instructions for delivery"
            />
          </div>
          
          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <p className="text-gray-700">{user?.name}</p>
            <p className="text-gray-700">{user?.email}</p>
            <p className="text-gray-700">
              {user?.phone || (
                <span className="text-amber-600">
                  No phone number provided. 
                  <Link href="/profile" className="text-blue-500 ml-1 hover:underline">
                    Update profile
                  </Link>
                </span>
              )}
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Link
              href="/cart"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Back to Cart
            </Link>
            
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || 
                (useSavedAddress && !selectedAddressId && addresses.length > 0) ||
                (!useSavedAddress && !manualAddress.trim())
              }
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}