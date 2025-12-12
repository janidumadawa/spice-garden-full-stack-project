// app/components/HeroSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Mouse } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <Image
          src="/hero-image.png"
          alt="Spice Garden Restaurant"
          fill
          priority
          className="object-cover"
          quality={90}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Pattern overlay (optional) */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary-red) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto ">
        <p className="text-primary-gold text-sm mb-4 tracking-widest font-inter bg-[#2F2F2F] rounded-2xl px-4 py-2 inline-block ">
          AYUBOWAN • ආයුබෝවන්
        </p>

        <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6">
          Spice Garden
        </h1>

        <p className="text-xl md:text-2xl text-primary-gold mb-10 max-w-2xl mx-auto">
          Authentic Sri Lankan Flavors in Every Bite
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/items" className="btn-secondary">
            Explore Our Menu
          </Link>
        </div>

        <div className="absolute top-110 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
          <Mouse size={24} color="var(--color-primary-gold)" />
          <span className="text-primary-gold text-sm mt-1">Scroll Down</span>
        </div>


      </div>
    </section>
  );
}
