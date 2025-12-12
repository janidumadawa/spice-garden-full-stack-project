"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import { useRouter } from "next/navigation";
import { useCart } from "../utils/CartContext";
import { useAuth } from "../utils/AuthContext";
import Link from "next/link";
import { api } from "../utils/api";
import Footer from "../components/Footer";
import {
  Home,
  ChevronRight,
  Search,
  Sparkles,
  Utensils,
  Flame,
  Egg,
  Leaf,
  Fish,
  Cake,
  Coffee,
  Plus,
  Minus,
  ShoppingCart,
  Check,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  // description?: string;
}

interface ItemOption {
  id: string;
  name: string;
  extraPrice: number;
}

interface MenuItem {
  id: string;
  name: string;
  // description: string;
  basePrice: number;
  imageUrl?: string;
  isAvailable?: boolean;
  categoryId: string;
  category?: {
    name: string;
  };
  options: ItemOption[];
}

export default function ItemsPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Fetch menu items
  const fetchMenuItems = async (categoryId?: string) => {
    setLoading(true);
    try {
      const params = categoryId ? { categoryId } : {};
      const response = await api.get("/menu-items", { params });
      const items: MenuItem[] = response.data;

      setMenuItems(items);
      setFilteredItems(items);

      // Initialize quantities and options
      const qtyObj: Record<string, number> = {};
      const optObj: Record<string, string[]> = {};
      items.forEach((item) => {
        qtyObj[item.id] = 1;
        optObj[item.id] = [];
      });
      setQuantities(qtyObj);
      setSelectedOptions(optObj);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();

    // Sticky navbar on scroll
    const handleScroll = () => {
      setIsSticky(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter items based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(menuItems);
      return;
    }

    const filtered = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, menuItems]);

  // Handle category filter
  const handleCategoryClick = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setSearchQuery("");

    if (categoryId) {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        const offset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    } else {
      fetchMenuItems();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };


  // Handle quantity change
  const handleQuantityChange = (itemId: string, value: number) => {
    if (value < 1) return;
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  // Handle option toggle
  const handleOptionToggle = (itemId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const current = prev[itemId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [itemId]: current.filter((id) => id !== optionId) };
      } else {
        return { ...prev, [itemId]: [...current, optionId] };
      }
    });
  };

  // Calculate total price for an item
  const calculateItemTotal = (item: MenuItem) => {
    const basePrice = item.basePrice;
    const selectedOpts = selectedOptions[item.id] || [];
    const optionsTotal = selectedOpts.reduce((sum, optId) => {
      const option = item.options.find((o) => o.id === optId);
      return sum + (option?.extraPrice || 0);
    }, 0);
    const quantity = quantities[item.id] || 1;
    return (basePrice + optionsTotal) * quantity;
  };

  // Handle add to cart
  const handleAddToCart = async (item: MenuItem) => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      router.push("/login");
      return;
    }

    setAddingItemId(item.id);
    try {
      const selectedOpts = selectedOptions[item.id] || [];
      const basePrice = item.basePrice;
      const optionsTotal = selectedOpts.reduce((sum, optId) => {
        const option = item.options.find((o) => o.id === optId);
        return sum + (option?.extraPrice || 0);
      }, 0);

      await addToCart({
        menuItemId: item.id,
        optionIds: selectedOpts,
        quantity: quantities[item.id] || 1,
        unitPrice: basePrice + optionsTotal,
      });

      // Simple success feedback - just set state
      setAddedItems((prev) => ({ ...prev, [item.id]: true }));

      // Reset after 1.5 seconds
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [item.id]: false }));
      }, 1500);
    } catch (error: any) {
      alert(error.message || "Failed to add item to cart");
    } finally {
      setAddingItemId(null);
    }
  };

  // Group items by category for display
  const groupedItems = filteredItems.reduce((groups, item) => {
    const categoryName = item.category?.name || "Uncategorized";
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    groups[categoryName].push(item);
    return groups;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <div className="h-[60px] mt-4">
        <Navigation />
      </div>

      {/* Hero Banner */}
      <section className="relative h-80 md:h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/menu-bg.png"
            alt="Spice Garden Menu"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">

          <div className="flex items-start gap-2 text-white/80 text-sm mb-4 bg-black/60 px-3 py-1 rounded-full">
            <Link href="/" className="flex items-center gap-1 hover:text-white">
              Back To Home
            </Link>
          </div>

          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Our Complete Menu
          </h1>

          <p className="text-lg md:text-xl text-[#D4AF37] mb-6 md:mb-8">
            Authentic Flavors, Exceptional Quality
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-md">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Category Navigation */}
      <nav
        className={`${
          isSticky
            ? "fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg shadow-md"
            : "relative bg-white shadow-sm"
        } transition-all duration-300`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
                !activeCategory
                  ? "bg-[#D4AF37] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Sparkles size={18} />
              All Items
            </button>

            {categories.map((category) => {
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-[#D4AF37] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37] mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 mb-6">
              Try a different search or category
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory(null);
                fetchMenuItems();
              }}
              className="bg-[#D4AF37] text-white px-6 py-2 rounded-lg hover:bg-[#A07828]"
            >
              Show All Items
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedItems).map(([categoryName, items]) => {
              return (
                <section
                  key={categoryName}
                  id={`category-${
                    categories.find((c) => c.name === categoryName)?.id ||
                    categoryName
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6 md:mb-8">

                    <div>
                      <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-[#2F2F2F]">
                        {categoryName}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => {
                      const isAdding = addingItemId === item.id;
                      const isAdded = addedItems[item.id];

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                          {/* Item Image */}
                          <div className="relative h-48 overflow-hidden">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <Utensils className="w-16 h-16 text-gray-400" />
                              </div>
                            )}
                            {item.isAvailable === false && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  Unavailable
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Item Content */}
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#2F2F2F] truncate">
                                {item.name}
                              </h3>
                              <span className="text-lg font-bold text-[#D4AF37]">
                                Rs. {item.basePrice.toLocaleString()}
                              </span>
                            </div>

                            {/* Options */}
                            {item.options.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Options:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {item.options.map((option) => (
                                    <label
                                      key={option.id}
                                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs cursor-pointer transition-all ${
                                        selectedOptions[item.id]?.includes(
                                          option.id
                                        )
                                          ? "bg-[#D4AF37] text-white"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          selectedOptions[item.id]?.includes(
                                            option.id
                                          ) || false
                                        }
                                        onChange={() =>
                                          handleOptionToggle(item.id, option.id)
                                        }
                                        className="hidden"
                                      />
                                      {option.name} (+Rs. {option.extraPrice})
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quantity and Add to Cart */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      (quantities[item.id] || 1) - 1
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#D4AF37] disabled:opacity-50"
                                  disabled={quantities[item.id] === 1}
                                >
                                  <Minus size={18} />
                                </button>
                                <span className="w-8 text-center font-bold">
                                  {quantities[item.id] || 1}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      (quantities[item.id] || 1) + 1
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#D4AF37]"
                                >
                                  <Plus size={18} />
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-gray-500 mb-1">
                                  Total:{" "}
                                  <span className="font-bold text-[#2F2F2F]">
                                    Rs.{" "}
                                    {calculateItemTotal(item).toLocaleString()}
                                  </span>
                                </p>
                                <button
                                  onClick={() => handleAddToCart(item)}
                                  disabled={
                                    isAdding || item.isAvailable === false
                                  }
                                  className={`px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 flex items-center gap-2 ${
                                    isAdded
                                      ? "bg-green-600"
                                      : isAdding
                                      ? "bg-yellow-600"
                                      : item.isAvailable === false
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-[#D4AF37] hover:bg-[#A07828]"
                                  }`}
                                >
                                  {isAdding ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                      Adding...
                                    </>
                                  ) : isAdded ? (
                                    <>
                                      <Check size={18} />
                                      Added
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart size={18} />
                                      Add to Cart
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Cart Status Bar (Mobile) */}
        {isAuthenticated && (
          <div className="fixed bottom-4 right-4 md:hidden z-30">
            <Link
              href="/cart"
              className="bg-[#D4AF37] text-white p-3 rounded-full shadow-lg hover:bg-[#A07828] flex items-center justify-center"
            >
              <ShoppingCart size={24} />
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
