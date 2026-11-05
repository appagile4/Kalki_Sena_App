"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Car,
  Navigation,
  HeartPulse,
  AlertTriangle,
  Package,
  Building2,
  BookOpen,
  Video,
  FileCheck,
  ShieldCheck,
  CreditCard,
  Settings,
  Database,
  Terminal,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Radio,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const SIDEBAR_NAV_GROUPS: NavGroup[] = [
  {
    title: "MAIN",
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "FLEET & OPERATIONS",
    items: [
      {
        id: "drivers",
        label: "Driver Partners",
        icon: Car,
        badge: "86 Online",
        badgeColor: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
      },
      {
        id: "rides",
        label: "Live Rides & Fleet",
        icon: Navigation,
      },
      {
        id: "sos",
        label: "Emergency SOS",
        icon: AlertTriangle,
        badge: "Active",
        badgeColor: "bg-red-500/10 text-red-600 border border-red-500/20",
      },
    ],
  },
  {
    title: "SERVICES & COMMUNITY",
    items: [
      {
        id: "book",
        label: "Book",
        icon: BookOpen,
        badge: "E-Book",
        badgeColor: "bg-blue-500/10 text-[#0266b3] border border-blue-500/20",
      },
      {
        id: "video",
        label: "Promo Video",
        icon: Video,
        badge: "Broadcast",
        badgeColor: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
      },
      {
        id: "doctors",
        label: "Doctors & Health",
        icon: HeartPulse,
      },
      {
        id: "services",
        label: "Delivery & Services",
        icon: Package,
      },
      {
        id: "hostels",
        label: "Hostels & Rent",
        icon: Building2,
      },
    ],
  },
  {
    title: "USER ADMINISTRATION",
    items: [
      {
        id: "users",
        label: "Registered Users",
        icon: Users,
      },
      {
        id: "kyc",
        label: "KYC & Verification",
        icon: FileCheck,
        badge: "14",
        badgeColor: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
      },
      {
        id: "roles",
        label: "Role Permissions",
        icon: ShieldCheck,
      },
      {
        id: "transactions",
        label: "Financials & $Sewa",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "SYSTEM & AUDIT",
    items: [
      {
        id: "database",
        label: "Database & Cluster",
        icon: Database,
      },
      {
        id: "audit",
        label: "Security Audit Logs",
        icon: Terminal,
      },
      {
        id: "settings",
        label: "Portal Settings",
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  user?: any;
  onLogout?: () => void;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  user,
  onLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Floating Button */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-md flex items-center justify-center cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        />
      )}

      {/* SIDEBAR ASIDE */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 select-none shadow-sm ${
          collapsed ? "w-20" : "w-68 sm:w-72"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header / Logo */}
        <div className="h-18 px-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Logo"
              width={140}
              height={40}
              className={`object-contain transition-all duration-200 ${
                collapsed ? "h-8 w-8" : "h-9 w-auto"
              }`}
              priority
            />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0266b3]">
                  Superadmin
                </span>
                <span className="text-[10px] text-slate-400 font-mono -mt-0.5">
                  Console v2.4
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Live System Indicator */}
        {!collapsed && (
          <div className="px-4 py-2 mx-3 my-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>SYSTEM ONLINE</span>
            </div>
            <span className="text-slate-400 text-[10px]">ROOT LEVEL 5</span>
          </div>
        )}

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          {SIDEBAR_NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileOpen(false);
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer group ${
                      isActive
                        ? "bg-gradient-to-r from-[#031b33] via-[#083358] to-[#02569b] text-white shadow-sm font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#0f172a]"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-cyan-300"
                          : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />

                    {!collapsed && (
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                    )}

                    {!collapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold shrink-0 ${
                          item.badgeColor || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#031b33] to-[#0266b3] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
              {user?.fullName?.charAt(0) || "S"}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {user?.fullName || "Super Admin"}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {user?.email || "superadmin@kalkisena.org"}
                </p>
              </div>
            )}

            {!collapsed && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
