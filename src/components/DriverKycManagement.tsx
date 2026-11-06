"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Car,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  X,
  FileText,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  ShieldAlert,
  Maximize2,
  ImageIcon,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface DriverVehicle {
  vehicleType: string;
  make: string;
  model: string;
  manufactureYear: string;
  color: string;
  seatCount: number;
  licensePlate: string;
}

export interface DriverDocuments {
  licenseFront?: string;
  licenseBack?: string;
  rcUploaded?: string;
  insuranceUploaded?: string;
  citizenshipFront?: string;
  citizenshipBack?: string;
  plateFront?: string;
  plateBack?: string;
}

export interface DriverApplicationItem {
  _id: string;
  userId?: {
    _id: string;
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  memberId?: string;
  rideCity: string;
  vehicle: DriverVehicle;
  documents: DriverDocuments;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DriverKycManagement() {
  const [applications, setApplications] = useState<DriverApplicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // Review Modal state
  const [selectedApp, setSelectedApp] = useState<DriverApplicationItem | null>(
    null
  );
  const [isProcessingDecision, setIsProcessingDecision] =
    useState<boolean>(false);
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [previewDocImage, setPreviewDocImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Fetch applications from backend
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/driver/admin/applications`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setApplications(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch driver applications");
      }
    } catch (err: any) {
      console.error("[DriverKycManagement] Fetch error:", err);
      setError(
        err.message ||
          "Unable to connect to backend server. Make sure port 5000 is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus =
        statusFilter === "all" ? true : app.status === statusFilter;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.fullName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        (app.phone && app.phone.toLowerCase().includes(q)) ||
        app.rideCity.toLowerCase().includes(q) ||
        app.vehicle.licensePlate.toLowerCase().includes(q) ||
        app.vehicle.make.toLowerCase().includes(q) ||
        app.vehicle.model.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchTerm]);

  // Counts
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === "pending").length,
      approved: applications.filter((a) => a.status === "approved").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    };
  }, [applications]);

  // Approve action
  const handleApprove = async (id: string) => {
    try {
      setIsProcessingDecision(true);
      const res = await fetch(
        `${API_BASE_URL}/driver/admin/${id}/approve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();

      if (data.success) {
        setSuccessNotice(
          `Application approved! Driver account verified and upgraded.`
        );
        setTimeout(() => setSuccessNotice(null), 4000);
        setSelectedApp(null);
        fetchApplications();
      } else {
        throw new Error(data.message || "Failed to approve driver application.");
      }
    } catch (err: any) {
      alert(err.message || "Approval failed. Check server connection.");
    } finally {
      setIsProcessingDecision(false);
    }
  };

  // Reject action
  const handleReject = async (id: string) => {
    try {
      setIsProcessingDecision(true);
      const res = await fetch(
        `${API_BASE_URL}/driver/admin/${id}/reject`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason:
              rejectReason.trim() ||
              "Provided documents could not be verified. Please provide clear, legible photos.",
          }),
        }
      );
      const data = await res.json();

      if (data.success) {
        setSuccessNotice(`Application rejected with notification to driver.`);
        setTimeout(() => setSuccessNotice(null), 4000);
        setSelectedApp(null);
        setShowRejectInput(false);
        setRejectReason("");
        fetchApplications();
      } else {
        throw new Error(data.message || "Failed to reject application.");
      }
    } catch (err: any) {
      alert(err.message || "Rejection failed. Check server connection.");
    } finally {
      setIsProcessingDecision(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ---------------- TOP BANNER / HEADER ---------------- */}
      <div className="bg-gradient-to-r from-[#031b33] via-[#083358] to-[#02569b] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DRIVER PARTNERS & KYC APPROVAL CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Driver Partner Applications
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Review incoming driver applications submitted from the mobile app.
            Inspect vehicle details, driving license, registration (RC), and
            grant Level-1 Driver clearance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shadow-sm cursor-pointer border border-white/20 backdrop-blur-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-300" : ""}`}
            />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* ---------------- ALERTS ---------------- */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-semibold">{successNotice}</p>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ---------------- STATS OVERVIEW CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Applications</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
              {stats.total}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              All time registered
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0266b3] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Review</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-0.5">
              {stats.pending}
            </h3>
            <p className="text-[10px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Requires decision
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Approved Partners */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Approved Drivers</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
              {stats.approved}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Active fleet partners
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Rejected / Incomplete */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Rejected / Needs Fix</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-0.5">
              {stats.rejected}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Awaiting re-submission
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ---------------- FILTER CONTROLS & SEARCH ---------------- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        {/* Status Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
          {[
            { id: "all", label: "All", count: stats.total },
            { id: "pending", label: "Pending Review", count: stats.pending },
            { id: "approved", label: "Approved", count: stats.approved },
            { id: "rejected", label: "Rejected", count: stats.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  tab.id === "pending" && tab.count > 0
                    ? "bg-amber-100 text-amber-700 font-bold"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, phone, plate, city..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-700 pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:border-[#0266b3] focus:outline-none transition font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ---------------- APPLICATIONS TABLE ---------------- */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0266b3] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Loading driver applications from backend...
            </p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center">
              <Car className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">
              No Driver Applications Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? `No applications matched "${searchTerm}". Try adjusting your search query.`
                : statusFilter !== "all"
                ? `There are currently no applications with status "${statusFilter}".`
                : "When users fill and submit the 'Become a Driver' form on the mobile app, their applications will automatically appear here for review."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">City & DOB</th>
                  <th className="py-3.5 px-4">Vehicle Details</th>
                  <th className="py-3.5 px-4">License Plate</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-slate-50/60 transition group"
                  >
                    {/* Applicant */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#031b33] to-[#0266b3] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {app.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {app.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {app.email}
                          </p>
                          {app.phone && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              {app.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* City & DOB */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.rideCity}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        DOB: {app.dob} ({app.gender})
                      </p>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0266b3] font-semibold text-[10px]">
                          {app.vehicle.vehicleType}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {app.vehicle.make} {app.vehicle.model}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {app.vehicle.color} • {app.vehicle.manufactureYear} •{" "}
                        {app.vehicle.seatCount} Seats
                      </p>
                    </td>

                    {/* Plate */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-200">
                        {app.vehicle.licensePlate}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {app.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending Review
                        </span>
                      )}
                      {app.status === "approved" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Approved Driver
                        </span>
                      )}
                      {app.status === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                          <X className="w-3 h-3 text-rose-600" />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowRejectInput(false);
                            setRejectReason("");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0266b3] hover:text-white text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        {app.status === "pending" && (
                          <button
                            onClick={() => handleApprove(app._id)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Quick Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------- INSPECTION & APPROVAL MODAL ---------------- */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedApp.fullName}
                  </h2>
                  {selectedApp.status === "pending" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                      Pending Approval
                    </span>
                  )}
                  {selectedApp.status === "approved" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                      Approved Driver Partner
                    </span>
                  )}
                  {selectedApp.status === "rejected" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                      Rejected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Application ID: #{selectedApp._id.slice(-8).toUpperCase()} • Submitted:{" "}
                  {new Date(selectedApp.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Section 1: Applicant Profile Details */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                1. Personal & Contact Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-bold text-slate-800">
                    {selectedApp.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <span className="font-mono text-slate-700 truncate block">
                    {selectedApp.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  <span className="font-mono text-slate-700">
                    {selectedApp.phone || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Date of Birth
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedApp.dob}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Gender</span>
                  <span className="font-semibold text-slate-800">
                    {selectedApp.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ride City</span>
                  <span className="font-bold text-[#0266b3]">
                    {selectedApp.rideCity}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Vehicle Details */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                2. Vehicle Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Vehicle Type
                  </span>
                  <span className="font-bold text-[#0266b3]">
                    {selectedApp.vehicle.vehicleType}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Make & Model
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedApp.vehicle.make} {selectedApp.vehicle.model}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    License Plate
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedApp.vehicle.licensePlate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    Color & Year
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedApp.vehicle.color} ({selectedApp.vehicle.manufactureYear})
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Document Verification Checklist & Previews */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  3. Uploaded Driver Documents (Cloudinary KYC Archive)
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  Click any document to inspect full size
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    label: "Driving License (Front)",
                    url: selectedApp.documents?.licenseFront,
                  },
                  {
                    label: "Driving License (Back)",
                    url: selectedApp.documents?.licenseBack,
                  },
                  {
                    label: "Registration Certificate (RC)",
                    url: selectedApp.documents?.rcUploaded,
                  },
                  {
                    label: "Vehicle Insurance",
                    url: selectedApp.documents?.insuranceUploaded,
                  },
                  {
                    label: "Citizenship / National ID (Front)",
                    url: selectedApp.documents?.citizenshipFront,
                  },
                  {
                    label: "Citizenship / National ID (Back)",
                    url: selectedApp.documents?.citizenshipBack,
                  },
                  {
                    label: "Vehicle Plate (Front)",
                    url: selectedApp.documents?.plateFront,
                  },
                  {
                    label: "Vehicle Plate (Back)",
                    url: selectedApp.documents?.plateBack,
                  },
                ].map((doc, idx) => {
                  const hasUrl = Boolean(doc.url);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition flex flex-col justify-between gap-2.5 ${
                        hasUrl
                          ? "bg-slate-50 border-slate-200/80 hover:border-[#0266b3]/50 hover:bg-slate-100/50"
                          : "bg-slate-50/50 border-dashed border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0266b3] shrink-0" />
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {doc.label}
                          </span>
                        </div>
                        {hasUrl ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                            ✓ Uploaded
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-medium text-[10px] shrink-0">
                            Missing
                          </span>
                        )}
                      </div>

                      {hasUrl ? (
                        <div className="relative group rounded-xl overflow-hidden bg-slate-200 border border-slate-300/60 aspect-[16/9] flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={doc.url}
                            alt={doc.label}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDocImage({
                                  url: doc.url!,
                                  title: doc.label,
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white/95 text-slate-800 text-[11px] font-bold flex items-center gap-1 shadow-md hover:bg-white cursor-pointer"
                            >
                              <Maximize2 className="w-3 h-3 text-[#0266b3]" />
                              <span>Inspect</span>
                            </button>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/95 text-slate-800 hover:bg-white cursor-pointer shadow-md"
                              title="Open original Cloudinary image"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-600" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 py-4 text-center text-slate-400 text-[10px]">
                          No document photo submitted
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rejection input box if triggered */}
            {showRejectInput && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Specify Reason for Rejection</span>
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. License photo is unreadable. Please re-upload with clear lighting."
                  className="w-full p-3 rounded-xl bg-white border border-rose-200 text-xs text-slate-800 focus:outline-none focus:border-rose-400"
                  rows={2}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedApp._id)}
                    disabled={isProcessingDecision}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedApp(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selectedApp.status !== "rejected" && !showRejectInput && (
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={isProcessingDecision}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject Application</span>
                  </button>
                )}

                {selectedApp.status !== "approved" && (
                  <button
                    onClick={() => handleApprove(selectedApp._id)}
                    disabled={isProcessingDecision}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    {isProcessingDecision ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Approve Driver & Grant License</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- LIGHTBOX DOCUMENT PREVIEW MODAL ---------------- */}
      {previewDocImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setPreviewDocImage(null)}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 text-white">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm">
                  {previewDocImage.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={previewDocImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-semibold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Full Size</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDocImage(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 flex items-center justify-center overflow-auto bg-black/50 min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewDocImage.url}
                alt={previewDocImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
