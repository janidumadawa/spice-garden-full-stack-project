"use client";

import { useEffect } from "react";
import { useAuth } from "../../../utils/AuthContext";
import { useRouter } from "next/navigation";
import MenuItemForm from "../components/MenuItemForm";

export default function NewMenuItemPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <MenuItemForm />
      </div>
    </div>
  );
}