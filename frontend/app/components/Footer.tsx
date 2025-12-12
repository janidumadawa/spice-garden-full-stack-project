// app/components/Footer.tsx
"use client";

import { MapPin, Phone, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer id='footer' className="bg-text-dark text-white py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Visit Us */}
          <div>
            <h3 className="font-playfair text-2xl font-bold mb-6 text-primary-gold">
              Visit Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-gold mt-1 flex-shrink-0" />
                <p className="font-inter">123 Spice Street, Colombo, Sri Lanka</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-gold flex-shrink-0" />
                <p className="font-inter">+94 11 234 5678</p>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="font-playfair text-2xl font-bold mb-6 text-primary-gold">
              Opening Hours
            </h3>
            <div className="space-y-2 font-inter">
              <div className="flex justify-between">
                <span>Monday - Thursday</span>
                <span>11:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Friday - Saturday</span>
                <span>11:00 AM - 11:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>12:00 PM - 9:00 PM</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-playfair text-2xl font-bold mb-6 text-primary-gold">
              Connect With Us
            </h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-gold transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center">
          <p className="font-inter">&copy; {new Date().getFullYear()} Spice Garden. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}