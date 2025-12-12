"use client";

import { useState, useEffect } from "react";
import AdminNavigation from "@/app/components/AdminNavigation";
import { useRouter } from "next/navigation";
import { api } from "../../../utils/api";
import Footer from "@/app/components/Footer";
import {
  Package, DollarSign, Image as ImageIcon,
  Tag, Plus, X, AlertCircle
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface MenuItemOption {
  id?: string;
  name: string;
  extraPrice: number;
}

interface MenuItemFormData {
  name: string;
  description: string;
  basePrice: string;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
  options: MenuItemOption[];
}

interface MenuItemFormProps {
  initialData?: {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    imageUrl?: string;
    categoryId: string;
    isAvailable: boolean;
    options: MenuItemOption[];
  };
  isEditing?: boolean;
}

export default function MenuItemForm({ initialData, isEditing = false }: MenuItemFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    basePrice: initialData?.basePrice?.toString() || "",
    imageUrl: initialData?.imageUrl || "",
    categoryId: initialData?.categoryId || "",
    isAvailable: initialData?.isAvailable ?? true,
    options: initialData?.options || [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [optionError, setOptionError] = useState("");

  const [newOption, setNewOption] = useState({
    name: "",
    extraPrice: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      setCategories(response.data);
      
      // If no category selected and categories exist, select first one
      if (!formData.categoryId && response.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: response.data[0].id }));
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addOption = () => {
    if (!newOption.name.trim()) {
      setOptionError("Option name is required");
      return;
    }

    const extraPrice = parseFloat(newOption.extraPrice);
    if (isNaN(extraPrice) || extraPrice < 0) {
      setOptionError("Price must be a valid number");
      return;
    }

    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          name: newOption.name.trim(),
          extraPrice: extraPrice,
        }
      ]
    }));

    setNewOption({ name: "", extraPrice: "" });
    setOptionError("");
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Item name is required");
      return;
    }

    if (!formData.categoryId) {
      setError("Category is required");
      return;
    }

    const basePrice = parseFloat(formData.basePrice);
    if (isNaN(basePrice) || basePrice <= 0) {
      setError("Base price must be a valid positive number");
      return;
    }

    // Validate options
    for (const option of formData.options) {
      if (!option.name.trim()) {
        setError("All options must have a name");
        return;
      }
      if (option.extraPrice < 0) {
        setError("Option price cannot be negative");
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        // Don't send id field for options when creating new item
        options: formData.options.map(opt => ({
          name: opt.name,
          extraPrice: opt.extraPrice
        }))
      };

      if (isEditing && initialData) {
        // Update existing item
        await api.put(`/admin/menu-items/${initialData.id}`, payload);
        alert("Menu item updated successfully!");
      } else {
        // Create new item
        await api.post("/admin/menu-items", payload);
        alert("Menu item created successfully!");
      }

      router.push("/admin/menu-items");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to save menu item:", err);
      setError(err.response?.data?.error || "Failed to save menu item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 mt-16">

        {/* go back button  */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/admin/menu-items")}
            className="text-blue-600 hover:underline"
          >
            &larr; Back to Menu Items
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? "Update your menu item details"
            : "Add a new item to your restaurant's menu"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Chicken Fried Rice"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (Rs.) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-32 w-full object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your menu item..."
              />
            </div>

            {/* Availability */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                Available for ordering
              </label>
            </div>
          </div>
        </div>

        {/* Options Management */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Customization Options
          </h2>

          <p className="text-gray-600 mb-4">
            Add options for customers to customize their order (e.g., Extra Cheese, Spicy Level)
          </p>

          {/* Add Option Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-700 mb-4">Add New Option</h3>
            
            {optionError && (
              <p className="text-red-600 text-sm mb-3">{optionError}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option Name
                </label>
                <input
                  type="text"
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Extra Chicken"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Price (Rs.)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={newOption.extraPrice}
                    onChange={(e) => setNewOption({ ...newOption, extraPrice: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </button>
              </div>
            </div>
          </div>

          {/* Options List */}
          {formData.options.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Current Options ({formData.options.length})</h3>
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{option.name}</p>
                    <p className="text-sm text-gray-600">
                      Additional: Rs. {option.extraPrice.toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No options added yet. Options allow customers to customize their order.</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/menu-items")}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {isEditing ? "Update Menu Item" : "Create Menu Item"}
              </>
            )}
          </button>
        </div>
      </form>
      {/* <Footer />   */}
    </div>
  );
}