// app/components/HomePage.tsx
"use client";

import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
import SignatureDishes from "./SignatureDishes";
import OurStory from "./OurStory";
import Footer from "./Footer";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <SignatureDishes />

      <OurStory />
      <Footer />
    </>
  );
}
