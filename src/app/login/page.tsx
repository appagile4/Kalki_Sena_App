"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password");
      return;
    }

    try {
      setIsLoading(true);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          identifier: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Invalid credentials. Please try again."
        );
      }

      // Verify that user has superadmin or admin permissions
      if (data.user?.role !== "superadmin" && data.user?.role !== "admin") {
        throw new Error(
          "Access denied. Only Superadmin is authorized to access this console."
        );
      }

      // Save token in storage
      if (typeof window !== "undefined") {
        if (data.token) localStorage.setItem("superadmin_token", data.token);
        if (data.user)
          localStorage.setItem("superadmin_user", JSON.stringify(data.user));
      }

      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || "Login failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] flex flex-col justify-between overflow-hidden font-sans select-none">
      
      {/* ========================================================= */}
      {/* BACKGROUND DEEP NAVY BLUE / CYAN ABSTRACT WAVES          */}
      {/* ========================================================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        
        {/* TOP-LEFT LAYERED DARK NAVY WAVES */}
        <div className="absolute -top-16 -left-16 w-[480px] h-[360px] sm:w-[620px] sm:h-[460px] lg:w-[720px] lg:h-[500px]">
          <svg
            className="w-full h-full"
            viewBox="0 0 720 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer soft shadow wave */}
            <path
              d="M0 0H620C520 180 340 360 0 460V0Z"
              fill="url(#topWaveGradient1)"
            />
            {/* Middle deep wave */}
            <path
              d="M0 0H540C440 150 280 320 0 400V0Z"
              fill="url(#topWaveGradient2)"
            />
            {/* Inner midnight blue wave */}
            <path
              d="M0 0H460C360 120 220 280 0 340V0Z"
              fill="url(#topWaveGradient3)"
            />
            {/* Accent cyan glowing arc */}
            <path
              d="M0 340C220 280 360 120 460 0"
              stroke="url(#cyanAccent)"
              strokeWidth="2.5"
              strokeOpacity="0.8"
            />
            {/* Secondary subtle line */}
            <path
              d="M0 400C280 320 440 150 540 0"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />

            <defs>
              <linearGradient
                id="topWaveGradient1"
                x1="0"
                y1="0"
                x2="620"
                y2="460"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0c2b54" />
                <stop offset="0.7" stopColor="#061c38" />
                <stop offset="1" stopColor="#020b18" />
              </linearGradient>

              <linearGradient
                id="topWaveGradient2"
                x1="0"
                y1="0"
                x2="540"
                y2="400"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#082346" />
                <stop offset="0.8" stopColor="#04142b" />
                <stop offset="1" stopColor="#020a16" />
              </linearGradient>

              <linearGradient
                id="topWaveGradient3"
                x1="0"
                y1="0"
                x2="460"
                y2="340"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#041731" />
                <stop offset="1" stopColor="#010712" />
              </linearGradient>

              <linearGradient
                id="cyanAccent"
                x1="0"
                y1="340"
                x2="460"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0284c7" />
                <stop offset="0.5" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* BOTTOM-RIGHT LAYERED DARK NAVY WAVES */}
        <div className="absolute -bottom-20 -right-20 w-[420px] h-[400px] sm:w-[560px] sm:h-[500px] lg:w-[680px] lg:h-[580px]">
          <svg
            className="w-full h-full"
            viewBox="0 0 680 580"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer wave */}
            <path
              d="M680 580V120C500 200 320 380 180 580H680Z"
              fill="url(#botWaveGradient1)"
            />
            {/* Middle wave */}
            <path
              d="M680 580V200C530 270 380 430 260 580H680Z"
              fill="url(#botWaveGradient2)"
            />
            {/* Inner wave */}
            <path
              d="M680 580V280C550 340 430 470 340 580H680Z"
              fill="url(#botWaveGradient3)"
            />

            {/* Subtle outer outline arc */}
            <path
              d="M680 60C450 160 250 360 80 580"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <path
              d="M680 120C500 200 320 380 180 580"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />

            <defs>
              <linearGradient
                id="botWaveGradient1"
                x1="680"
                y1="580"
                x2="180"
                y2="120"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#010712" />
                <stop offset="0.6" stopColor="#051c38" />
                <stop offset="1" stopColor="#0b2e58" />
              </linearGradient>

              <linearGradient
                id="botWaveGradient2"
                x1="680"
                y1="580"
                x2="260"
                y2="200"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#020a16" />
                <stop offset="0.7" stopColor="#04162e" />
                <stop offset="1" stopColor="#072346" />
              </linearGradient>

              <linearGradient
                id="botWaveGradient3"
                x1="680"
                y1="580"
                x2="340"
                y2="280"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#010610" />
                <stop offset="1" stopColor="#03152c" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </div>

      {/* TOP NAVIGATION BAR */}
      <Navbar brandName="Kalki Sena Drive" logoSrc="/logo.png" />

      {/* MAIN CONTENT AREA - LOGIN CARD */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-[430px] bg-white rounded-[26px] p-8 sm:p-9 shadow-[0_15px_50px_-10px_rgba(2,27,51,0.12)] border border-slate-100">
          
          {/* Top Concentric User Avatar */}
          <div className="flex justify-center mb-5">
            <div className="relative flex items-center justify-center w-[90px] h-[90px] rounded-full bg-[#e0f2fe]/70">
              {/* Outer soft cyan radiant ring */}
              <div className="absolute w-[76px] h-[76px] rounded-full bg-[#bae6fd]/50" />

              {/* Inner deep navy circle with cyan glow border */}
              <div className="relative z-10 flex items-center justify-center w-[60px] h-[60px] rounded-full bg-[#031b33] ring-4 ring-[#38bdf8] shadow-[0_4px_18px_rgba(56,189,248,0.4)]">
                {/* Solid White User Silhouette */}
                <svg
                  className="w-7 h-7 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title: "Welcome Back!" */}
          <div className="text-center mb-6">
            <h1 className="text-[28px] font-bold tracking-tight text-[#0f172a]">
              Welcome <span className="text-[#0266b3]">Back!</span>
            </h1>
            <p className="text-[14px] text-[#64748b] mt-1 font-normal">
              Please login to your account
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center font-medium">
              Login successful! Redirecting to dashboard...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Address */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#64748b] pointer-events-none">
                <Mail className="w-[19px] h-[19px] text-[#64748b]" strokeWidth={1.8} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Email Address"
                className="w-full h-[50px] pl-11 pr-4 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0266b3] focus:ring-2 focus:ring-[#0266b3]/15 transition-all duration-150"
              />
            </div>

            {/* Password */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-[#64748b] pointer-events-none">
                <Lock className="w-[19px] h-[19px] text-[#64748b]" strokeWidth={1.8} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Password"
                className="w-full h-[50px] pl-11 pr-11 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0266b3] focus:ring-2 focus:ring-[#0266b3]/15 transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#64748b] hover:text-[#1e293b] transition-colors p-1"
              >
                {showPassword ? (
                  <Eye className="w-[18px] h-[18px] text-[#64748b]" strokeWidth={1.8} />
                ) : (
                  <EyeOff className="w-[18px] h-[18px] text-[#64748b]" strokeWidth={1.8} />
                )}
              </button>
            </div>

            {/* Login Button with Navy to Cobalt Blue Gradient */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[50px] mt-2 bg-gradient-to-r from-[#031b33] via-[#083358] to-[#02569b] hover:opacity-95 active:scale-[0.99] text-white font-medium text-[15px] rounded-xl shadow-[0_6px_20px_rgba(2,86,155,0.3)] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Login &rarr;</span>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Empty bottom spacer to keep layout balanced */}
      <div className="h-4" />

    </div>
  );
}
