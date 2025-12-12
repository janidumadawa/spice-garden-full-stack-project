"use client";

import { useState, useEffect } from "react";
import { api } from "../utils/api";

interface Address {
  id: string;
  street: string;
  city: string;
  zipCode: string;
  isDefault: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
  onSuccess: () => void;
}

export default function AddressModal({ isOpen, onClose, address, onSuccess }: AddressModalProps) {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setStreet(address.street);
      setCity(address.city);
      setZipCode(address.zipCode);
      setIsDefault(address.isDefault);
    } else {
      resetForm();
    }
  }, [address]);

  const resetForm = () => {
    setStreet("");
    setCity("");
    setZipCode("");
    setIsDefault(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const addressData = { street, city, zipCode, isDefault };
      
      if (address) {
        // Update existing address
        await api.put(`/addresses/${address.id}`, addressData);
      } else {
        // Create new address
        await api.post("/addresses", addressData);
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Error saving address");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {address ? "Edit Address" : "Add New Address"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Street Address</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full p-2 border rounded"
              required
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 border rounded"
                required
                placeholder="New York"
              />
            </div>

            <div>
              <label className="block mb-1">Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full p-2 border rounded"
                required
                placeholder="10001"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isDefault">Set as default address</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : address ? "Update" : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}