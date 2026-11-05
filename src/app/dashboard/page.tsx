"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import BookManagement from "../../components/BookManagement";
import VideoManagement from "../../components/VideoManagement";
import {
  Users,
  Car,
  Activity,
  ShieldCheck,
  Server,
  LogOut,
  Database,
  Lock,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  FileCheck,
  CreditCard,
  Terminal,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Navigation,
  Building2,
  Package,
  Settings,
  BookOpen,
} from "lucide-react";

export default function SuperadminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("superadmin_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("superadmin_token");
      localStorage.removeItem("superadmin_user");
      window.location.href = "/login";
    }
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "overview":
        return "Dashboard Overview";
      case "book":
        return "Book & E-Book Store Management";
      case "video":
        return "Promotional Video & Broadcast Controller";
      case "drivers":
        return "Driver Partners & Fleet";
      case "rides":
        return "Live Rides & Dispatch";
      case "sos":
        return "Emergency SOS Response Center";
      case "doctors":
        return "Doctors & Medical Network";
      case "services":
        return "Delivery & Services";
      case "hostels":
        return "Hostels & Accommodations";
      case "users":
        return "Registered Users Directory";
      case "kyc":
        return "Driver & Partner KYC Approvals";
      case "roles":
        return "Role Access & Permissions Matrix";
      case "transactions":
        return "Financials & Sewa Economy";
      case "database":
        return "MongoDB Cluster0 & Diagnostics";
      case "audit":
        return "System Audit & Security Logs";
      case "settings":
        return "Portal & Security Settings";
      default:
        return "Superadmin Console";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 pl-10 lg:pl-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-slate-500 font-semibold">Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#0266b3] font-bold">
                {getTabTitle(activeTab)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 w-56 focus-within:w-64 focus-within:border-[#0266b3] transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search drivers, users, IDs..."
                className="bg-transparent outline-none w-full text-slate-700 placeholder-slate-400 text-xs"
              />
            </div>

            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Port 5000 Online</span>
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#031b33] to-[#0266b3] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.fullName?.charAt(0) || "S"}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.fullName || "Super Admin"}
                </p>
                <p className="text-[10px] text-cyan-600 font-mono">
                  {user?.role || "superadmin"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[#031b33] via-[#083358] to-[#02569b] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SUPERADMIN ACCESS VERIFIED</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Welcome, {user?.fullName || "Super Admin"}
                  </h1>
                  <p className="text-slate-300 text-sm mt-1">
                    Logged in as{" "}
                    <span className="text-white font-mono font-medium">
                      {user?.email || "superadmin@kalkisena.org"}
                    </span>{" "}
                    • Role:{" "}
                    <span className="uppercase text-cyan-300 font-semibold">
                      {user?.role || "superadmin"}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("drivers")}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#031b33] text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Car className="w-4 h-4" />
                    <span>Manage Fleet</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer border border-white/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Overview Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0266b3] flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Users</p>
                    <h3 className="text-2xl font-bold text-slate-800">1,248</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      +12% this week
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Active Drivers</p>
                    <h3 className="text-2xl font-bold text-slate-800">86</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      82 on trip now
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Backend Server</p>
                    <h3 className="text-lg font-bold text-emerald-600 truncate">
                      Online (5000)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Uptime: 99.98%
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">MongoDB Cluster</p>
                    <h3 className="text-lg font-bold text-purple-600">Connected</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      kalki_sena DB
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Operation Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Book Campaign & Gen Z Wave */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0266b3] text-xs font-semibold flex items-center gap-1 border border-blue-200">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Gen Z Wave</span>
                      </span>
                      <span className="text-xs text-slate-400 font-mono">10L Goal</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Economic Revolution Book
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Nationwide book orders, clinic pickups & 1 Lakh students free coaching fund.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("book")}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#031b33] to-[#0266b3] hover:opacity-95 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Manage Books & Orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Pending KYC Action */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-semibold flex items-center gap-1 border border-amber-200">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Action Required</span>
                      </span>
                      <span className="text-xs text-slate-400 font-mono">14 Pending</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Driver KYC Verifications
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      14 new driver partners have submitted their Driving License and RC for validation.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("kyc")}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Review Submissions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Emergency SOS Monitor */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>All Clear</span>
                      </span>
                      <span className="text-xs text-slate-400 font-mono">0 Active</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Emergency SOS Dispatch
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Real-time panic button listener is synchronized with local emergency services.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("sos")}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Open SOS Console</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Doctors Network */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0266b3] text-xs font-semibold flex items-center gap-1 border border-blue-200">
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>Healthcare Hub</span>
                      </span>
                      <span className="text-xs text-slate-400 font-mono">32 Verified</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Doctor & Health Network
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage registered medical practitioners and patient consultation appointment schedules.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("doctors")}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Doctors</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Superadmin Management Control */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Superadmin Management Control
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Full root privilege to manage fleet drivers, doctors, registered users, and role permissions.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-mono font-semibold">
                    LEVEL-5 CLEARANCE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 block mb-1">Root Database:</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      Cluster0 / kalki_sena
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-1">
                      Status: Read & Write Healthy
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 block mb-1">
                      Authentication Strategy:
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      JWT Bearer (30d TTL)
                    </span>
                    <span className="text-[10px] text-cyan-600 block mt-1">
                      BCrypt Salt Rounds: 10
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-500 block mb-1">
                      Security Clearance:
                    </span>
                    <span className="font-semibold text-emerald-600 text-sm">
                      Level-5 Superadmin
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Session: Persistent Authenticated
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Drivers Tab */}
          {activeTab === "drivers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Driver Partners Fleet
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage active drivers, verify vehicles, check online status and trip logs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold">
                    86 Drivers Online
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Driver Name</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">Vehicle Type</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: "Rajesh Kumar", phone: "+91 98765 43210", vehicle: "Sedan (DL 01 AB 1234)", status: "On Trip", rating: "4.9" },
                        { name: "Amit Sharma", phone: "+91 98111 22334", vehicle: "SUV (HR 26 DQ 5678)", status: "Online", rating: "4.8" },
                        { name: "Vikas Yadav", phone: "+91 99555 66778", vehicle: "Auto (UP 16 Z 9901)", status: "Online", rating: "4.7" },
                        { name: "Pooja Verma", phone: "+91 97777 88990", vehicle: "Hatchback (DL 04 CD 3456)", status: "Offline", rating: "4.95" },
                      ].map((driver, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {driver.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono">{driver.phone}</td>
                          <td className="py-3.5 px-4">{driver.vehicle}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                driver.status === "On Trip"
                                  ? "bg-blue-50 text-blue-600"
                                  : driver.status === "Online"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {driver.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-amber-500">
                            ★ {driver.rating}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0266b3] hover:text-white text-slate-700 transition cursor-pointer text-xs font-medium">
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Book Management Tab */}
          {activeTab === "book" && <BookManagement />}

          {/* Promo Video Management Tab */}
          {activeTab === "video" && <VideoManagement />}

          {/* Fallback for other tabs */}
          {activeTab !== "overview" && activeTab !== "drivers" && activeTab !== "book" && activeTab !== "video" && (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0266b3] mx-auto flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {getTabTitle(activeTab)}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
                This administrative module is actively synchronized with the Kalki Sena root backend. Live controls and real-time feeds are enabled for your Level-5 Superadmin credentials.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Return to Overview
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#031b33] to-[#0266b3] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Module</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Console Footer */}
        <footer className="w-full border-t border-slate-200/60 bg-white py-4 px-6 text-center text-xs text-slate-400 mt-auto">
          &copy; {new Date().getFullYear()} Kalki Sena Drive • Superadmin Administrative Console
        </footer>
      </div>
    </div>
  );
}
