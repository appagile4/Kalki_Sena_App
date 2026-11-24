"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Send,
  Users,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Radio,
  FileText,
  X,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.kalkisenadrive.com/api";

export interface BroadcastTicket {
  token: string;
  ticketId: string;
  status: string;
  message?: string;
  details?: any;
}

export interface BroadcastRecord {
  _id: string;
  title: string;
  body: string;
  targetAudience: "all" | "user" | "driver" | "doctor" | "admin" | "individual";
  targetUser?: { _id: string; fullName: string; email: string };
  targetEmail?: string;
  screen?: string;
  priority?: string;
  sound?: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  metrics?: {
    targetedCount: number;
    tokensCount: number;
    successCount: number;
    failureCount: number;
    tickets: BroadcastTicket[];
  };
}

export interface PushStats {
  totalDevices: number;
  activeDevices: number;
  androidDevices: number;
  iosDevices: number;
  totalBroadcasts: number;
  totalInAppNotifications: number;
}

export default function BroadcastManagement() {
  const [stats, setStats] = useState<PushStats>({
    totalDevices: 0,
    activeDevices: 0,
    androidDevices: 0,
    iosDevices: 0,
    totalBroadcasts: 0,
    totalInAppNotifications: 0,
  });

  const [history, setHistory] = useState<BroadcastRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("all");
  const [targetEmail, setTargetEmail] = useState<string>("");
  const [screen, setScreen] = useState<string>("Home");
  const [priority, setPriority] = useState<string>("high");
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Inspection Modal
  const [selectedBroadcast, setSelectedBroadcast] =
    useState<BroadcastRecord | null>(null);

  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("superadmin_token") ||
      localStorage.getItem("token") ||
      null
    );
  };

  const loadData = useCallback(async () => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`${API_BASE_URL}/notifications/stats`, {
        headers,
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.data) {
          setStats(statsData.data);
        }
      }

      // 2. Fetch History
      const historyRes = await fetch(
        `${API_BASE_URL}/notifications/broadcast/history?limit=25`,
        { headers }
      );
      if (historyRes.ok) {
        const histData = await historyRes.json();
        if (histData.success && histData.data) {
          setHistory(histData.data);
        }
      }
    } catch (err: any) {
      console.error("[BroadcastManagement] Failed to fetch data:", err.message);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFeedback({
        type: "error",
        message: "Title and Message Body are required to broadcast.",
      });
      return;
    }

    if (targetAudience === "individual" && !targetEmail.trim()) {
      setFeedback({
        type: "error",
        message: "Please specify target user email for individual broadcast.",
      });
      return;
    }

    setSending(true);
    setFeedback(null);

    const token = getAuthToken();
    try {
      const payload: any = {
        title: title.trim(),
        body: body.trim(),
        targetAudience,
        screen,
        priority,
        sound: "default",
      };

      if (targetAudience === "individual") {
        payload.targetEmail = targetEmail.trim();
      }

      if (isScheduled && scheduledAt) {
        payload.scheduledAt = new Date(scheduledAt).toISOString();
      }

      const res = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to dispatch broadcast");
      }

      setFeedback({
        type: "success",
        message: isScheduled
          ? "Broadcast scheduled successfully!"
          : `Broadcast dispatched successfully! Delivered to ${
              resData.data?.metrics?.tokensCount || 0
            } active devices.`,
      });

      // Clear Form
      setTitle("");
      setBody("");
      setTargetEmail("");
      setIsScheduled(false);
      setScheduledAt("");

      // Reload History
      loadData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "An unexpected error occurred while sending.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#031b33] via-[#023567] to-[#0266b3] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-400/30 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Production Push Engine</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                FCM V1 + APNs Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Push Notification & Broadcast Control
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Broadcast announcements and automatic order lifecycle updates
              directly to customer and driver notification trays via Expo Push
              Cloud infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh Status"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Devices</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats.activeDevices}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Android: {stats.androidDevices} • iOS: {stats.iosDevices}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0266b3] flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">
              Broadcasts Dispatched
            </p>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats.totalBroadcasts}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Across all audiences
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Delivery Engine</p>
            <h3 className="text-xl font-bold text-emerald-600">FCM V1 Ready</h3>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              EAS Project Linked
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">
              In-App Notifications
            </p>
            <h3 className="text-2xl font-bold text-slate-800">
              {stats.totalInAppNotifications}
            </h3>
            <p className="text-[10px] text-purple-600 font-semibold mt-0.5">
              Synchronized Center
            </p>
          </div>
        </div>
      </div>

      {/* 3. Compose Broadcast & Live Device Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0266b3]" />
                <span>Create Broadcast Notification</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted push alerts wake devices and appear in the notification
                drawer.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0266b3] text-xs font-semibold border border-blue-200">
              Super Admin
            </span>
          </div>

          {feedback && (
            <div
              className={`mb-5 p-4 rounded-xl text-xs flex items-start gap-3 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{feedback.message}</div>
              <button
                onClick={() => setFeedback(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🚀 Special Offer: 20% Off All Book Pickups Today!"
                required
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0266b3]/20 focus:border-[#0266b3] transition"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter detailed notification content here..."
                required
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0266b3]/20 focus:border-[#0266b3] transition resize-none"
              />
            </div>

            {/* Target Audience & Screen Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0266b3]/20 focus:border-[#0266b3] transition bg-white"
                >
                  <option value="all">📢 All Users (Everyone)</option>
                  <option value="user">👤 Customers / Readers Only</option>
                  <option value="driver">🚗 Drivers & Fleet Partners</option>
                  <option value="doctor">🩺 Doctors & Health Practitioners</option>
                  <option value="admin">🛡️ Staff & System Admins</option>
                  <option value="individual">🎯 Single Specific User</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Click Navigation Screen
                </label>
                <select
                  value={screen}
                  onChange={(e) => setScreen(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0266b3]/20 focus:border-[#0266b3] transition bg-white"
                >
                  <option value="Home">App Home Screen</option>
                  <option value="OrderDetails">Orders & Book Status</option>
                  <option value="notifications">In-App Notification Center</option>
                  <option value="E-Book">Featured Book Campaign</option>
                  <option value="Profile">User Profile</option>
                </select>
              </div>
            </div>

            {/* Conditional Individual User Email Input */}
            {targetAudience === "individual" && (
              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl">
                <label className="block text-xs font-semibold text-[#0266b3] mb-1">
                  Recipient User Email Address
                </label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0266b3] bg-white"
                />
              </div>
            )}

            {/* Priority & Scheduling Row */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={priority === "high"}
                    onChange={(e) =>
                      setPriority(e.target.checked ? "high" : "default")
                    }
                    className="w-4 h-4 rounded text-[#0266b3] focus:ring-[#0266b3]"
                  />
                  <span>High Priority Wake-Up</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0266b3] focus:ring-[#0266b3]"
                  />
                  <span>Schedule Later</span>
                </label>
              </div>

              {isScheduled && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#0266b3]"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="mt-2 w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#031b33] to-[#0266b3] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Transmitting Push Packets to Expo...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {isScheduled
                      ? "Confirm Scheduled Broadcast"
                      : "Send Push Broadcast Now"}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Live Notification Mockup Preview */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#031b33] rounded-2xl p-6 text-white border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Device Lockscreen Preview</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Android / iOS UI
              </span>
            </div>

            {/* Phone Lock Screen Container */}
            <div className="w-full bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 shadow-inner mt-2">
              <div className="text-center text-slate-400 text-xs font-medium mb-3">
                12:45 PM • Wednesday
              </div>

              {/* Notification Banner */}
              <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700/60 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#0266b3] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                      KS
                    </div>
                    <span className="text-xs font-bold text-white tracking-wide">
                      Kalki Sena Drive
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">now</span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {title || "Special Order Announcement"}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                  {body ||
                    "Tap to review your order details, route tracking, and nationwide book pick-up confirmation."}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-cyan-400 font-medium">
                  <span>Target: {targetAudience.toUpperCase()}</span>
                  <span>Channel: orders</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-slate-400 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Production payload utilizes Expo Push API V2 with FCM V1 project
              signing on Android and APNs sandbox/prod tokens.
            </span>
          </div>
        </div>
      </div>

      {/* 4. Broadcast History & Delivery Audit Table */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-700" />
              <span>Broadcast History & Delivery Audit</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review real-time delivery tickets, recipient metrics, and dispatch
              status.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Broadcasts: {history.length}
          </span>
        </div>

        {loadingHistory ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0266b3] mb-2" />
            <span>Loading broadcast records...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No broadcast notifications sent yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Title & Preview</th>
                  <th className="py-3 px-3">Audience</th>
                  <th className="py-3 px-3">Targeted</th>
                  <th className="py-3 px-3">Devices Reached</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                      {new Date(record.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="font-bold text-slate-800 truncate">
                        {record.title}
                      </div>
                      <div className="text-slate-500 truncate text-[11px] mt-0.5">
                        {record.body}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase">
                        {record.targetAudience}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-semibold">
                      {record.metrics?.targetedCount || 0} users
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-semibold">
                      {record.metrics?.tokensCount || 0} devices
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          record.status === "sent"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : record.status === "scheduled"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedBroadcast(record)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0266b3] hover:bg-blue-100 font-semibold text-xs transition cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Detail & Ticket Inspection Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                Broadcast Delivery Details
              </h3>
              <button
                onClick={() => setSelectedBroadcast(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Title:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedBroadcast.title}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Message Body:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedBroadcast.body}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-400">Target Audience:</span>
                  <p className="font-semibold text-slate-800 uppercase">
                    {selectedBroadcast.targetAudience}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Destination Screen:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedBroadcast.screen || "Home"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Targeted Users:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedBroadcast.metrics?.targetedCount || 0}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Devices Reached:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedBroadcast.metrics?.tokensCount || 0}
                  </p>
                </div>
              </div>

              {/* Delivery Tickets */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-slate-500 font-bold block mb-2">
                  Expo Delivery Receipts / Tickets (
                  {selectedBroadcast.metrics?.tickets?.length || 0})
                </span>
                {selectedBroadcast.metrics?.tickets &&
                selectedBroadcast.metrics.tickets.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedBroadcast.metrics.tickets.map((t, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-2 rounded-lg font-mono text-[11px] text-slate-600 flex items-center justify-between"
                      >
                        <span className="truncate max-w-[200px]">
                          {t.token ? `${t.token.slice(0, 20)}...` : "Token"}
                        </span>
                        <span
                          className={`font-bold ${
                            t.status === "ok"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {t.status || "ok"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    No individual ticket errors reported.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedBroadcast(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
