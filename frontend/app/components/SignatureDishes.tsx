"use client";

import { useEffect, useState } from 'react';
import { useCart } from '../utils/CartContext';
import { useAuth } from '../utils/AuthContext';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  category?: {
    name: string;
  };
}

export default function SignatureDishes() {
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchSignatureDishes();
  }, []);

  const fetchSignatureDishes = async () => {
    try {
      // Fetch from your backend (port 5000)
      const response = await api.get('/menu-items');
      const allItems = response.data;
      
      // Filter or select signature dishes - you can modify this logic
      // Option 1: Get first 3 items
      const signatureDishes = allItems.slice(10, 13);
      
      // Option 2: Filter by category or mark some items as "featured"
      // const signatureDishes = allItems.filter(item => 
      //   item.category?.name === 'Main' || item.category?.name === 'Special'
      // ).slice(0, 3);
      
      setDishes(signatureDishes);
    } catch (error) {
      console.error('Failed to fetch dishes:', error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: MenuItem) => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      router.push('/login');
      return;
    }

    try {
      await addToCart({
        menuItemId: item.id,
        optionIds: [],
        quantity: 1,
        unitPrice: item.basePrice,
      });
      
      // Show success feedback
      const button = document.getElementById(`dish-btn-${item.id}`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = "✓ Added";
        button.className = "mt-4 bg-green-600 text-white w-full py-3 rounded-lg font-medium transition-all";
        
        setTimeout(() => {
          button.textContent = originalText;
          button.className = "mt-4 bg-[#D4AF37] text-white w-full py-3 rounded-lg font-medium hover:bg-[#b38f2a] transition-all";
        }, 1500);
      }
    } catch (error) {
      alert('Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-white to-amber-50">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            <p className="mt-4 text-gray-600">Loading signature dishes...</p>
          </div>
        </div>
      </section>
    );
  }

  if (dishes.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-white to-amber-50">
        <div className="container mx-auto">
          <div className="text-center">
            <p className="text-gray-600">No dishes available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-amber-50">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37] rounded-full mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Our Signature Dishes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Taste the excellence of our most beloved creations, crafted with passion and tradition
          </p>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dishes.map((item, index) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-amber-100"
            >
              {/* Dish Image */}
              <div className="h-48 overflow-hidden relative">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🍛</div>
                      <p className="text-amber-800 font-medium">Spice Garden</p>
                    </div>
                  </div>
                )}
                
                {/* Category Badge */}
                {item.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {item.category.name}
                    </span>
                  </div>
                )}
                
                {/* Popular Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-[#D4AF37] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </span>
                </div>
              </div>

              {/* Dish Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <span className="text-2xl font-bold text-[#D4AF37]">
                    Rs. {item.basePrice.toLocaleString()}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Add to Cart Button */}
                <button
                  id={`dish-btn-${item.id}`}
                  onClick={() => handleAddToCart(item)}
                  className="mt-4 bg-[#D4AF37] text-white w-full py-3 rounded-lg font-medium hover:bg-[#b38f2a] transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <a 
            href="/items" 
            className="inline-flex items-center text-[#D4AF37] font-semibold text-lg hover:text-[#b38f2a] transition-colors"
          >
            View Full Menu
            <ChevronRight className="w-5 h-5 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
}