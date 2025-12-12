// frontend/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./utils/CartContext";
import { AuthProvider } from "./utils/AuthContext";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Spice Garden - Authentic Sri Lankan Cuisine",
  description: "Experience authentic Sri Lankan flavors at Spice Garden",
  keywords: ["Sri Lankan food", "spice garden", "authentic cuisine", "restaurant"],
  authors: [{ name: "Spice Garden" }],
  openGraph: {
    title: "Spice Garden",
    description: "Authentic Sri Lankan Flavors in Every Bite",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-cream-bg"
      suppressHydrationWarning={true}>
        <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}