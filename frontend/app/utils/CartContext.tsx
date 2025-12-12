// frontend/app/utils/CartContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { api } from "./api";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
}

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  menuItem: MenuItem;
}

interface CartResponse {
  cartId: string | null;
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

interface CartContextType {
  cart: CartResponse | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (cartItemData: {
    menuItemId: string;
    optionIds: string[];
    quantity: number;
    unitPrice: number;
  }) => Promise<void>;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async (): Promise<void> => {
    // Client-side check
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem("token");
    
    if (!token) {
      // User not logged in
      setCart({
        cartId: null,
        items: [],
        totalQuantity: 0,
        totalPrice: 0
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/carts/current");
      setCart(response.data);
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      setError(error.message || "Failed to load cart");
      
      if (error.response?.status === 401) {
        // Token invalid, clear auth
        localStorage.removeItem("token");
        setCart({
          cartId: null,
          items: [],
          totalQuantity: 0,
          totalPrice: 0
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (cartItemData: {
    menuItemId: string;
    optionIds: string[];
    quantity: number;
    unitPrice: number;
  }): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Add item to cart
      await api.post("/carts/item", cartItemData);
      
      // 2. IMMEDIATELY fetch updated cart
      await fetchCart();
      
    } catch (error: any) {
      console.error("Add to cart error:", error);
      setError(error.message || "Failed to add item to cart");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart on initial load AND when token changes
  useEffect(() => {
    fetchCart();
    
    // Listen for login event from AuthContext
    const handleLogin = () => {
      fetchCart();
    };
    
    window.addEventListener('userLoggedIn', handleLogin);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
    };
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      fetchCart, 
      addToCart,
      error 
    }}>
      {children}
    </CartContext.Provider>
  );
};