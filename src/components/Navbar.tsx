"use client";

import React from "react";
import Image from "next/image";

export interface NavbarProps {
  brandName?: string;
  logoSrc?: string;
  activeItem?: string;
  onNavClick?: (item: string) => void;
  onLoginClick?: () => void;
}

export default function Navbar({
  brandName = "Kalki Sena Drive",
  logoSrc = "/logo-white.png",
}: NavbarProps) {
  return (
    <header className="relative z-30 w-full select-none">
      <div className="w-full px-6 sm:px-10 lg:px-14 py-3 sm:py-4 flex items-center justify-between">
        {/* Brand Logo (Over the top-left dark navy curve) */}
        <div className="flex items-center gap-2.5 z-10">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={brandName}
              width={220}
              height={60}
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-md"
              priority
            />
          ) : (
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              {brandName}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
