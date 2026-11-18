"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface FooterProps {
  className?: string;
  showAppDownloads?: boolean;
}

export default function Footer({
  className = "",
  showAppDownloads = true,
}: FooterProps) {
  return (
    <footer
      className={`relative z-20 w-full border-t border-slate-200/80 bg-white/80 backdrop-blur-md text-[#334155] select-none ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Brand & Copyright */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2.5">
              <Image
                src="/logo.png"
                alt="Kalki Sena Drive"
                width={150}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0284c7] animate-pulse" />
              <p className="text-xs font-semibold text-[#0f172a]">
                Kalki Sena Drive
              </p>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-medium text-slate-500">
                Level-5 Secure Platform
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              © {new Date().getFullYear()} Kalki Sena Drive. All rights reserved.
            </p>
          </div>

          {/* App Store & Play Store Download Badges */}
          {showAppDownloads && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Apple App Store Button */}
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download on the App Store"
                className="group flex items-center gap-2.5 rounded-xl bg-[#031b33] px-3.5 py-2 text-white shadow-sm transition-all duration-150 hover:bg-[#06294d] hover:shadow-md active:scale-[0.98]"
              >
                {/* Apple SVG Icon */}
                <svg
                  className="h-6 w-6 fill-current text-white transition-transform group-hover:scale-105"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.04-.51 2.56-1.24z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[10px] font-medium tracking-wide text-slate-300">
                    Download on the
                  </span>
                  <span className="block text-[13px] font-semibold text-white">
                    App Store
                  </span>
                </div>
              </a>

              {/* Google Play Store Button */}
              <a
                href="https://play.google.com/store/apps"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get it on Google Play"
                className="group flex items-center gap-2.5 rounded-xl bg-[#031b33] px-3.5 py-2 text-white shadow-sm transition-all duration-150 hover:bg-[#06294d] hover:shadow-md active:scale-[0.98]"
              >
                {/* Google Play SVG Icon */}
                <svg
                  className="h-6 w-6 text-white transition-transform group-hover:scale-105"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M3.6 2.4c-.2.2-.4.6-.4 1.1v17c0 .5.2.9.4 1.1l9.6-9.6L3.6 2.4z"
                  />
                  <path
                    fill="#34A853"
                    d="M17.4 8.2l-4.2 4.2 4.2 4.2 4.8-2.7c1.4-.8 1.4-2.1 0-2.9l-4.8-2.8z"
                  />
                  <path
                    fill="#FBBC04"
                    d="M3.6 21.6c.4.4 1.1.5 1.8.1l12-6.7-4.2-4.2-9.6 10.8z"
                  />
                  <path
                    fill="#EA4335"
                    d="M17.4 9l-12-6.7c-.7-.4-1.4-.3-1.8.1L13.2 13.2 17.4 9z"
                  />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[10px] font-medium tracking-wide text-slate-300">
                    GET IT ON
                  </span>
                  <span className="block text-[13px] font-semibold text-white">
                    Google Play
                  </span>
                </div>
              </a>
            </div>
          )}

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-slate-600">
            <Link
              href="/privacy"
              className="transition-colors hover:text-[#0266b3] hover:underline"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/terms"
              className="transition-colors hover:text-[#0266b3] hover:underline"
            >
              Terms of Service
            </Link>
            <span className="text-slate-300">•</span>
            <a
              href="mailto:support@kalkisena.org"
              className="transition-colors hover:text-[#0266b3] hover:underline"
            >
              Help & Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
