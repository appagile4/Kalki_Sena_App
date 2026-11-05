"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export interface NavbarProps {
  brandName?: string;
  logoSrc?: string;
  activeItem?: string;
  onNavClick?: (item: string) => void;
  onLoginClick?: () => void;
}

export default function Navbar({
  brandName = "Kalki Sena Drive",
  logoSrc = "/logo.png",
  activeItem: initialActiveItem = "Home",
  onNavClick,
}: NavbarProps) {
  const [activeItem, setActiveItem] = useState(initialActiveItem);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ["Home", "About", "Features", "Contact"];

  const handleItemClick = (item: string) => {
    setActiveItem(item);
    setMobileMenuOpen(false);
    if (onNavClick) {
      onNavClick(item);
    }
  };

  return (
    <header className="relative z-30 w-full select-none">
      <div className="w-full px-6 sm:px-10 lg:px-14 py-3 sm:py-4 flex items-center justify-between">
        
        {/* Brand Logo (Over the top-left dark navy curve) */}
        <div
          onClick={() => handleItemClick("Home")}
          className="flex items-center gap-2.5 cursor-pointer z-10"
        >
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={brandName}
              width={220}
              height={60}
              className="h-10 sm:h-12 w-auto object-contain drop-shadow"
              priority
            />
          ) : (
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              {brandName}
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center">
          <nav className="flex items-center gap-7 lg:gap-8 text-[15px] font-medium text-[#1e293b]">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`transition-colors cursor-pointer ${
                  activeItem === item
                    ? "text-[#0266b3] font-semibold"
                    : "text-[#334155] hover:text-[#0f172a]"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#1e293b] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-6 py-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2.5">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`text-left text-sm py-2 px-3 rounded-lg font-medium transition cursor-pointer ${
                  activeItem === item
                    ? "bg-[#e0f2fe] text-[#0266b3] font-semibold"
                    : "text-[#334155] hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
