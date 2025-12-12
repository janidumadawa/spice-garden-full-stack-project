// frontend/app/cart/page.tsx
"use client";

import { useAuth } from "../utils/AuthContext";
import { useCart } from "../utils/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Home } from "lucide-react";
import { api } from "../utils/api";

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cart, loading, fetchCart } = useCart();
  const router = useRouter();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    fetchCart();
  }, [isAuthenticated, router, fetchCart]);

  // Update quantity function
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // If quantity becomes 0, remove item
      await removeItem(itemId);
      return;
    }

    setUpdatingItemId(itemId);
    try {
      await api.put(`/carts/item/${itemId}`, { quantity: newQuantity });
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Remove item function
  const removeItem = async (itemId: string) => {
    if (!confirm("Remove this item from cart?")) return;
    
    setDeletingItemId(itemId);
    try {
      await api.delete(`/carts/item/${itemId}`);
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item");
    } finally {
      setDeletingItemId(null);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37] mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items yet</p>
            <div className="space-y-3">
              <Link
                href="/items"
                className="inline-flex items-center justify-center w-full bg-[#D4AF37] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#b38f2a] transition-colors"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse Menu
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cart.totalPrice;
  const tax = subtotal * 0.1;
  const deliveryFee = 200;
  const total = subtotal + tax + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 mt-16">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
            </div>
            <p className="text-gray-600">
              {cart.totalQuantity} item{cart.totalQuantity !== 1 ? 's' : ''} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Cart Items</h2>
                
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      {/* Item Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        {item.menuItem.imageUrl ? (
                          <img 
                            src={item.menuItem.imageUrl} 
                            alt={item.menuItem.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">🍛</span>
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.menuItem.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Unit Price: Rs. {item.unitPrice.toFixed(2)}
                        </p>
                        
                        {/* Quantity Controls - NOW WORKING */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingItemId === item.id || item.quantity <= 1}
                              className="text-gray-600 hover:text-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingItemId === item.id && item.quantity <= 1 ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#D4AF37]"></div>
                              ) : (
                                <Minus size={16} />
                              )}
                            </button>
                            <span className="w-8 text-center font-medium">
                              {updatingItemId === item.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#D4AF37] mx-auto"></div>
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItemId === item.id}
                              className="text-gray-600 hover:text-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingItemId === item.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#D4AF37]"></div>
                              ) : (
                                <Plus size={16} />
                              )}
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            disabled={deletingItemId === item.id}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingItemId === item.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          Rs. {(item.quantity * item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link
                    href="/items"
                    className="inline-flex items-center text-[#D4AF37] font-medium hover:text-[#b38f2a]"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Summary Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">Rs. {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">Rs. {deliveryFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#D4AF37]">Rs. {total.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Including all taxes</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="block w-full bg-[#D4AF37] text-white text-center px-6 py-3 rounded-lg font-medium hover:bg-[#b38f2a] transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}