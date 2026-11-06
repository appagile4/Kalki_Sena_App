"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchBooks,
  fetchBookStats,
  fetchBookOrders,
  createBookOrder,
  updateOrderStatus,
  updateBookData,
  uploadBookCoverImage,
  addPickupClinic,
  deletePickupClinic,
  updateSinglePickupClinic,
  updatePickupClinics,
  clearMessages,
  BookChapter,
  PickupClinic,
} from "../redux/slices/bookSlice";
import {
  BookOpen,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Building,
  QrCode,
  Wallet,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Filter,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  FileEdit,
  Save,
  Plus,
  Trash2,
  ListOrdered,
  Upload,
  ImageIcon,
  Video,
  Play,
  Phone,
  Navigation,
  X,
} from "lucide-react";

export default function BookManagement() {
  const dispatch = useAppDispatch();
  const {
    books,
    activeBook,
    orders,
    stats,
    loading,
    orderSubmitting,
    uploadingImage,
    error,
    successMessage,
  } = useAppSelector((state) => state.book);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await dispatch(uploadBookCoverImage(file));
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<
    "orders" | "preview" | "edit" | "create"
  >("orders");
  const [filterAppearance, setFilterAppearance] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewTab, setPreviewTab] = useState<"About" | "Chapters" | "Reviews">("About");
  const [whyExpanded, setWhyExpanded] = useState<boolean>(false);

  // Form state for editing book data from backend
  const [editData, setEditData] = useState({
    title: "",
    subtitle: "",
    author: "",
    coAuthor: "",
    price: 1000,
    currency: "NPR",
    rating: 4.3,
    targetGoal: 1000000,
    leadText: "",
    highlight: "",
    pointsText: "",
    aboutText: "",
    summaryText: "",
    promoVideoTitle: "Message form MR.666",
    promoVideoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    promoThumbnailUrl:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
    promoVideoDesc:
      "Official revolutionary video message from Kalki Sena founder Jay Sah (MR. 666).",
  });

  // Chapters State
  const [chapters, setChapters] = useState<BookChapter[]>([]);

  // Sync editData when activeBook loads or changes
  useEffect(() => {
    if (activeBook) {
      setEditData({
        title: activeBook.title || "",
        subtitle: activeBook.subtitle || "",
        author: activeBook.author || "",
        coAuthor: activeBook.coAuthor || "",
        price: activeBook.price || 1000,
        currency: activeBook.currency || "NPR",
        rating: activeBook.rating || 4.3,
        targetGoal: activeBook.targetGoal || 1000000,
        leadText: activeBook.whyBuy?.leadText || "",
        highlight: activeBook.whyBuy?.highlight || "",
        pointsText: activeBook.whyBuy?.points ? activeBook.whyBuy.points.join("\n") : "",
        aboutText: activeBook.aboutText || "",
        summaryText: activeBook.summaryText || "",
        promoVideoTitle: activeBook.promoVideo?.title || "Message form MR.666",
        promoVideoUrl:
          activeBook.promoVideo?.videoUrl ||
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        promoThumbnailUrl:
          activeBook.promoVideo?.thumbnailUrl ||
          "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
        promoVideoDesc:
          activeBook.promoVideo?.description ||
          "Official revolutionary video message from Kalki Sena founder Jay Sah (MR. 666).",
      });

      if (activeBook.chapters && activeBook.chapters.length > 0) {
        setChapters(
          activeBook.chapters.map((ch) => ({
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            pageRange: ch.pageRange,
            excerpt: ch.excerpt,
          }))
        );
      } else {
        setChapters([
          {
            chapterNumber: 1,
            title: "Chapter 1 | The Hope",
            pageRange: "Page No: 12 - 50",
            excerpt:
              "The fundamental vision behind mobilization of youth and education reforms to foster nationwide innovation.",
          },
          {
            chapterNumber: 2,
            title: "Chapter 2 | The Vision & Policy",
            pageRange: "Page No: 51 - 98",
            excerpt:
              "Detailed framework on monetary policies, healthcare infrastructure, and employment generation for 1,000+ teachers.",
          },
          {
            chapterNumber: 3,
            title: "Chapter 3 | Economic Revolution",
            pageRange: "Page No: 99 - 145",
            excerpt:
              "The strategic roadmap towards making Nepal economically self-reliant and a global leader through Gen Z unity.",
          },
        ]);
      }
    }
  }, [activeBook]);

  // Chapter Handlers
  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    setChapters([
      ...chapters,
      {
        chapterNumber: nextNum,
        title: `Chapter ${nextNum} | New Chapter Title`,
        pageRange: `Page No: ${nextNum * 40} - ${nextNum * 40 + 35}`,
        excerpt: "Brief preview and synopsis of this chapter.",
      },
    ]);
  };

  const handleRemoveChapter = (index: number) => {
    setChapters(chapters.filter((_, idx) => idx !== index));
  };

  const handleChapterChange = (
    index: number,
    field: keyof BookChapter,
    value: any
  ) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: value };
    setChapters(updated);
  };

  // Pickup Clinics State & Handlers
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<PickupClinic | null>(null);
  const [clinicFormData, setClinicFormData] = useState({
    name: "",
    branch: "",
    distance: "1.2 Km away",
    timing: "9 AM - 6 PM",
    address: "",
    phone: "+977-1-4782000",
    city: "Kathmandu",
    latitude: 27.6915,
    longitude: 85.342,
  });
  const [isDeletingClinicId, setIsDeletingClinicId] = useState<string | null>(null);
  const [isSavingClinic, setIsSavingClinic] = useState(false);

  const handleOpenAddClinicModal = () => {
    setEditingClinic(null);
    setClinicFormData({
      name: "",
      branch: "",
      distance: "1.0 Km away",
      timing: "9 AM - 6 PM",
      address: "",
      phone: "+977-1-4782000",
      city: "Kathmandu",
      latitude: 27.6915,
      longitude: 85.342,
    });
    setIsClinicModalOpen(true);
  };

  const handleOpenEditClinicModal = (clinic: PickupClinic) => {
    setEditingClinic(clinic);
    setClinicFormData({
      name: clinic.name || "",
      branch: clinic.branch || "",
      distance: clinic.distance || "1.0 Km away",
      timing: clinic.timing || "9 AM - 6 PM",
      address: clinic.address || "",
      phone: clinic.phone || "+977-1-4782000",
      city: clinic.city || "Kathmandu",
      latitude: clinic.latitude || 27.6915,
      longitude: clinic.longitude || 85.342,
    });
    setIsClinicModalOpen(true);
  };

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicFormData.name.trim()) {
      alert("Please enter a clinic / branch name");
      return;
    }
    setIsSavingClinic(true);
    try {
      if (editingClinic) {
        const clinicId = editingClinic.id || editingClinic._id;
        if (clinicId) {
          await dispatch(
            updateSinglePickupClinic({
              clinicId,
              updates: {
                ...clinicFormData,
                latitude: Number(clinicFormData.latitude),
                longitude: Number(clinicFormData.longitude),
              },
            })
          ).unwrap();
        }
      } else {
        await dispatch(
          addPickupClinic({
            ...clinicFormData,
            latitude: Number(clinicFormData.latitude),
            longitude: Number(clinicFormData.longitude),
          })
        ).unwrap();
      }
      setIsClinicModalOpen(false);
      setEditingClinic(null);
    } catch (err: any) {
      alert(err || "Failed to save pickup clinic.");
    } finally {
      setIsSavingClinic(false);
    }
  };

  const handleDeleteClinic = async (clinic: PickupClinic) => {
    const clinicId = clinic.id || clinic._id;
    if (!clinicId) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove "${clinic.name}" from authorized pickup clinics? Physical book buyers will no longer be able to select this branch.`
    );
    if (!confirmed) return;

    setIsDeletingClinicId(clinicId);
    try {
      await dispatch(deletePickupClinic(clinicId)).unwrap();
    } catch (err: any) {
      alert(err || "Failed to remove clinic branch.");
    } finally {
      setIsDeletingClinicId(null);
    }
  };

  // Handle Save Book Changes
  const handleSaveBookData = async (e: React.FormEvent) => {
    e.preventDefault();
    const points = editData.pointsText
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const payload = {
      title: editData.title,
      subtitle: editData.subtitle,
      author: editData.author,
      coAuthor: editData.coAuthor,
      price: Number(editData.price) || 1000,
      currency: editData.currency,
      rating: Number(editData.rating) || 4.3,
      targetGoal: Number(editData.targetGoal) || 1000000,
      aboutText: editData.aboutText,
      summaryText: editData.summaryText,
      whyBuy: {
        title: "Why you will buy this Book?",
        leadText: editData.leadText,
        points,
        highlight: editData.highlight,
      },
      chapters: chapters.map((ch, idx) => ({
        chapterNumber: Number(ch.chapterNumber) || idx + 1,
        title: ch.title,
        pageRange: ch.pageRange,
        excerpt: ch.excerpt,
      })),
      promoVideo: activeBook?.promoVideo || {
        title: editData.promoVideoTitle || "Message from MR.666",
        videoUrl:
          editData.promoVideoUrl ||
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnailUrl:
          editData.promoThumbnailUrl ||
          "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
        description: editData.promoVideoDesc || "Visionary message for youth economic revolution",
      },
    };

    await dispatch(updateBookData({ bookId: activeBook?._id, bookData: payload }));
    setActiveSubTab("preview");
  };

  // Form state for creating / booking an order
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    bookAppearance: "physical" as "physical" | "digital",
    pickupLocation: "Kalki Clinic - Baneshwor Branch",
    paymentMethod: "esewa" as "esewa" | "khalti" | "qr" | "bank",
    accountHolder: "",
    accountNumber: "",
    branchName: "",
    ifscCode: "",
  });

  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchBookStats());
    dispatch(fetchBookOrders());
  }, [dispatch]);

  // Handle Order Submit via Redux
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    const payload: any = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      bookAppearance: formData.bookAppearance,
      pickupLocation:
        formData.bookAppearance === "physical"
          ? formData.pickupLocation
          : "Digital In-App Access",
      paymentMethod: formData.paymentMethod,
      amount: activeBook?.price || 1000,
      currency: activeBook?.currency || "NPR",
    };

    if (formData.paymentMethod === "bank") {
      payload.bankDetails = {
        accountHolder: formData.accountHolder,
        accountNumber: formData.accountNumber,
        branchName: formData.branchName,
        ifscCode: formData.ifscCode,
      };
    }

    await dispatch(createBookOrder(payload));
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      bookAppearance: "physical",
      pickupLocation: "Kalki Clinic - Baneshwor Branch",
      paymentMethod: "esewa",
      accountHolder: "",
      accountNumber: "",
      branchName: "",
      ifscCode: "",
    });
    setActiveSubTab("orders");
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesAppearance =
      filterAppearance === "all" || order.bookAppearance === filterAppearance;
    const matchesSearch =
      searchQuery === "" ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerPhone && order.customerPhone.includes(searchQuery));
    return matchesAppearance && matchesSearch;
  });

  const currentBook = activeBook || books[0];

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearMessages())}
            className="text-xs text-emerald-600 font-semibold cursor-pointer hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => dispatch(clearMessages())}
            className="text-xs text-red-600 font-semibold cursor-pointer hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Campaign Banner & 10 Lakh Target Goal Progress */}
      <div className="bg-gradient-to-r from-[#031b33] via-[#083358] to-[#0266b3] rounded-2xl p-6 sm:p-7 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NATIONWIDE BOOK CAMPAIGN & GEN Z WAVE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {currentBook?.title ||
                "Economic Revolution to make Nepal A World Leader"}
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              Author: <span className="font-semibold text-white">{currentBook?.author || "Jay Sah (MR. 666)"}</span> • Co-Author: <span className="font-semibold text-white">{currentBook?.coAuthor || "Dr. Uma Shankar Prasad"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                dispatch(fetchBooks());
                dispatch(fetchBookStats());
                dispatch(fetchBookOrders());
              }}
              title="Refresh Data"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/20"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveSubTab("create")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#031b33] text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Record New Sale / Order</span>
            </button>
          </div>
        </div>

        {/* 10 Lakh Target Goal Progress Bar */}
        <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-300" />
              <span className="font-semibold">
                Progress towards 10 Lakh (1,000,000) Books Nationwide Goal
              </span>
            </div>
            <span className="font-mono text-cyan-300 font-bold">
              {stats?.totalSold?.toLocaleString() || "12,480"} / 1,000,000 Books ({stats?.progressPercent || "1.25"}%)
            </span>
          </div>
          <div className="w-full bg-slate-900/40 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(2, stats?.progressPercent || 1.25)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            100% profit funds free coaching for 1 Lakh students & employ 1,000+ teachers. Guarantees universal free healthcare & education.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0266b3] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Books Sold</p>
            <h3 className="text-xl font-bold text-slate-800">
              {stats?.totalSold?.toLocaleString() || "12,480"}
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono">
              NPR 1,000 / Book
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Digital vs Physical</p>
            <h3 className="text-xl font-bold text-slate-800">
              {stats?.physicalCount || 0} Phy • {stats?.digitalCount || 0} Dig
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              In-Clinic & App readers
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Campaign Revenue</p>
            <h3 className="text-xl font-bold text-emerald-600">
              NPR {(stats?.totalRevenueNPR || 12480000).toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono">
              100% To Youth Coaching
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Public Rating</p>
            <h3 className="text-xl font-bold text-slate-800">
              ★ {currentBook?.rating || 4.3} / 5.0
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {currentBook?.totalReviews || 248} Verified Reviews
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveSubTab("orders")}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeSubTab === "orders"
              ? "border-[#0266b3] text-[#0266b3]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Live Book Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("preview")}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeSubTab === "preview"
              ? "border-[#0266b3] text-[#0266b3]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Frontend Mobile UI Preview</span>
        </button>

        <button
          onClick={() => setActiveSubTab("edit")}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeSubTab === "edit"
              ? "border-[#0266b3] text-[#0266b3]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>Edit Book Details (Live Sync)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("create")}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeSubTab === "create"
              ? "border-[#0266b3] text-[#0266b3]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Record In-Clinic Sale</span>
        </button>
      </div>

      {/* ---------------- SUB-TAB 1: LIVE ORDERS TABLE ---------------- */}
      {activeSubTab === "orders" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search order ID, customer, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none w-full text-slate-700 text-xs"
                />
              </div>

              {/* Format Filter */}
              <select
                value={filterAppearance}
                onChange={(e) => setFilterAppearance(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">All Formats</option>
                <option value="physical">Physical Books</option>
                <option value="digital">Digital E-Books</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Order ID & Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Format & Pickup</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No book orders found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/60 transition">
                        {/* Order ID */}
                        <td className="py-3.5 px-4">
                          <p className="font-mono font-bold text-slate-800">
                            {order.orderId}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(order.createdAt).toLocaleDateString()} •{" "}
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">
                            {order.customerName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {order.customerPhone || order.customerEmail || "In-Person Client"}
                          </p>
                        </td>

                        {/* Format & Pickup */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                                order.bookAppearance === "physical"
                                  ? "bg-blue-50 text-[#0266b3] border border-blue-200"
                                  : "bg-purple-50 text-purple-700 border border-purple-200"
                              }`}
                            >
                              {order.bookAppearance}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">
                            {order.pickupLocation || "Digital E-Book Access"}
                          </p>
                        </td>

                        {/* Payment */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                              order.paymentMethod === "esewa"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : order.paymentMethod === "khalti"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : order.paymentMethod === "qr"
                                ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {order.paymentMethod}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {order.currency} {order.amount.toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${
                              order.orderStatus === "delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : order.orderStatus === "ready_for_pickup"
                                ? "bg-blue-50 text-[#0266b3] border border-blue-200"
                                : order.orderStatus === "confirmed"
                                ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {order.orderStatus.replace(/_/g, " ")}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              dispatch(
                                updateOrderStatus({
                                  orderId: order._id,
                                  orderStatus: e.target.value,
                                })
                              )
                            }
                            className="text-xs px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 outline-none cursor-pointer"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="ready_for_pickup">Ready for Pickup</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 2: MOBILE UI PREVIEW ---------------- */}
      {activeSubTab === "preview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Book Details (Why Buy, Summary, Chapters) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Why buy card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  {currentBook?.whyBuy?.title || "Why you will buy this Book?"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-semibold">
                  Youth Movement
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentBook?.whyBuy?.leadText}
              </p>

              {whyExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  {currentBook?.whyBuy?.points?.map((pt: string, i: number) => (
                    <p key={i} className="flex items-start gap-2">
                      <span className="text-[#0266b3] font-bold">•</span>
                      <span>{pt}</span>
                    </p>
                  ))}
                  <p className="text-xs font-bold text-[#0266b3] mt-3">
                    {currentBook?.whyBuy?.highlight}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setWhyExpanded(!whyExpanded)}
                className="mt-3 text-xs font-semibold text-[#0266b3] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{whyExpanded ? "read less" : "read more"}</span>
                {whyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Book Info Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-32 h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative shadow-sm">
                <Image
                  src={currentBook?.coverImage || "/bookcover.png"}
                  alt={currentBook?.title || "Book Cover"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <h2 className="text-base font-bold text-slate-800 leading-snug">
                  {currentBook?.title}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {currentBook?.aboutText}
                </p>
                <div className="flex items-center gap-1 pt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-4 h-4 fill-emerald-500 text-emerald-500"
                    />
                  ))}
                  <span className="text-xs font-bold text-emerald-600 ml-1.5">
                    (★ {currentBook?.rating || 4.3}+)
                  </span>
                  <span className="text-xs text-slate-400 font-mono ml-2">
                    NPR {currentBook?.price?.toLocaleString()}/-
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-tabs: About / Chapters / Reviews */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex border-b border-slate-200 gap-6">
                {(["About", "Chapters", "Reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    className={`pb-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                      previewTab === tab
                        ? "border-[#0266b3] text-[#0266b3]"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {previewTab === "About" && (
                <div className="space-y-3 text-xs text-slate-600">
                  <h4 className="font-bold text-slate-800">About this Book</h4>
                  <p>{currentBook?.aboutText}</p>
                  <h4 className="font-bold text-slate-800 pt-2">Book Summary</h4>
                  <p>{currentBook?.summaryText}</p>
                </div>
              )}

              {previewTab === "Chapters" && (
                <div className="space-y-4">
                  {currentBook?.chapters?.map((ch: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {ch.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ch.pageRange}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{ch.excerpt}</p>
                    </div>
                  ))}
                </div>
              )}

              {previewTab === "Reviews" && (
                <div className="space-y-3">
                  {currentBook?.reviews?.map((rev: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {rev.heading}
                        </span>
                        <span className="text-xs text-amber-500 font-bold">
                          ★ {rev.rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        by {rev.reviewerName}
                      </p>
                      <p className="text-xs text-slate-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pickup Locations & Payment Options Preview */}
          <div className="space-y-6">
            {/* Author Profile Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200">
                <Image
                  src="/avatar.png"
                  alt="Jay Sah Author"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Author</p>
                <h4 className="text-sm font-bold text-slate-800">
                  {currentBook?.author || "Jay Sah (MR. 666)"}
                </h4>
                <p className="text-[10px] text-cyan-600 font-mono">
                  Founder, Kalki Sena Movement
                </p>
              </div>
            </div>

            {/* Pickup Clinics List */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-[#0266b3]" />
                  <span>Kalki Sena Pickup Clinics</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-[#0266b3] text-[10px] font-bold">
                    {currentBook?.pickupClinics?.length || 0}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddClinicModal}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0266b3] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-blue-200/60"
                  title="Add new authorized branch clinic"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Branch</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Physical book buyers can collect from any authorized branch:
              </p>

              <div className="space-y-2.5 pt-1">
                {!currentBook?.pickupClinics || currentBook.pickupClinics.length === 0 ? (
                  <div className="p-5 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 bg-slate-50 space-y-2">
                    <p>No pickup clinic branches configured.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddClinicModal}
                      className="px-3 py-1.5 rounded-lg bg-[#0266b3] text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add First Clinic</span>
                    </button>
                  </div>
                ) : (
                  currentBook.pickupClinics.map((clinic: any) => {
                    const clinicId = clinic.id || clinic._id;
                    const isDeleting = isDeletingClinicId === clinicId;
                    return (
                      <div
                        key={clinicId || clinic.name}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition flex items-start justify-between gap-2.5 group"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <MapPin className="w-4 h-4 text-[#0266b3] shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {clinic.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {clinic.distance || "1.2 Km away"} • {clinic.timing || "9 AM - 6 PM"}
                            </p>
                            {clinic.address && (
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                📍 {clinic.address}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          {clinic.latitude && clinic.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-cyan-600 hover:underline font-mono px-1.5 py-0.5 rounded bg-cyan-50/60"
                              title="View location on Google Maps"
                            >
                              Map ↗
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditClinicModal(clinic)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0266b3] hover:bg-blue-50 transition cursor-pointer"
                            title="Edit Branch"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteClinic(clinic)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                            title="Remove Branch"
                          >
                            {isDeleting ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Supported Payment Gateways */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Payment Gateways Supported</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>eSewa Wallet</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Khalti Wallet</span>
                </div>
                <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span>QR Code</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Bank Wire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 3: EDIT BOOK DATA (BACKEND) ---------------- */}
      {activeSubTab === "edit" && (
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-[#0266b3]" />
                <span>Edit Entire Book Data (Backend Control)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Any changes made here directly update the MongoDB database and reflect in the mobile app in real-time.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-semibold border border-emerald-200">
              LIVE MONGODB SYNC
            </span>
          </div>

          <form onSubmit={handleSaveBookData} className="space-y-6">
            {/* Book Cover Image Upload Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-cyan-50/20 to-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative shadow-sm">
                    <Image
                      src={activeBook?.coverImage || "/bookcover.png"}
                      alt="Book Cover Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#0266b3]" />
                      <h3 className="text-sm font-bold text-slate-800">
                        Book Cover Image
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-[#0266b3] text-[10px] font-semibold">
                        Cloudinary CDN
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      Upload a new cover image directly from backend (PNG, JPG, WebP). Changes save to Cloudinary and reflect in the mobile app in real-time.
                    </p>
                    {activeBook?.coverImage && (
                      <p className="text-[10px] text-slate-400 font-mono mt-1.5 truncate max-w-md">
                        Current URL: {activeBook.coverImage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0266b3] hover:bg-[#02569b] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {uploadingImage ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Uploading Image...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload New Cover</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Campaign Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={editData.subtitle}
                  onChange={(e) =>
                    setEditData({ ...editData, subtitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>
            </div>

            {/* Author & Co-Author */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Main Author *
                </label>
                <input
                  type="text"
                  required
                  value={editData.author}
                  onChange={(e) =>
                    setEditData({ ...editData, author: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Co-Author / Economist
                </label>
                <input
                  type="text"
                  value={editData.coAuthor}
                  onChange={(e) =>
                    setEditData({ ...editData, coAuthor: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>
            </div>

            {/* Price, Currency, Rating, Target Goal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Price *
                </label>
                <input
                  type="number"
                  required
                  value={editData.price}
                  onChange={(e) =>
                    setEditData({ ...editData, price: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0266b3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Currency
                </label>
                <input
                  type="text"
                  value={editData.currency}
                  onChange={(e) =>
                    setEditData({ ...editData, currency: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0266b3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Public Rating (★)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editData.rating}
                  onChange={(e) =>
                    setEditData({ ...editData, rating: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0266b3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Goal (Books)
                </label>
                <input
                  type="number"
                  value={editData.targetGoal}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      targetGoal: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0266b3]"
                />
              </div>
            </div>

            {/* Why Buy Section */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
              <span className="text-xs font-bold text-slate-800 block">
                "Why you will buy this Book?" Campaign Details
              </span>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Lead Description
                  </label>
                  <textarea
                    rows={3}
                    value={editData.leadText}
                    onChange={(e) =>
                      setEditData({ ...editData, leadText: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Highlight Quote
                  </label>
                  <textarea
                    rows={3}
                    value={editData.highlight}
                    onChange={(e) =>
                      setEditData({ ...editData, highlight: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bullet Points (Enter 1 point per line)
                </label>
                <textarea
                  rows={4}
                  value={editData.pointsText}
                  onChange={(e) =>
                    setEditData({ ...editData, pointsText: e.target.value })
                  }
                  placeholder="• 100% of profit donated&#10;• 1,000+ teachers employed..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3] font-sans"
                />
              </div>
            </div>

            {/* About and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  About this Book
                </label>
                <textarea
                  rows={4}
                  value={editData.aboutText}
                  onChange={(e) =>
                    setEditData({ ...editData, aboutText: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Book Summary
                </label>
                <textarea
                  rows={4}
                  value={editData.summaryText}
                  onChange={(e) =>
                    setEditData({ ...editData, summaryText: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>
            </div>

            {/* Chapters Management Section */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-[#0266b3]" />
                    <span>Book Chapters ({chapters.length})</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Add, edit, or remove chapters. Changes will synchronize to the mobile app in real-time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="px-3 py-1.5 rounded-xl bg-[#0266b3] hover:bg-[#02569b] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Chapter</span>
                </button>
              </div>

              {chapters.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  No chapters added yet. Click &quot;Add Chapter&quot; to create one.
                </div>
              ) : (
                <div className="space-y-3">
                  {chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#0266b3] font-bold text-xs flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            Chapter {idx + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveChapter(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Chapter Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={ch.title}
                            onChange={(e) =>
                              handleChapterChange(idx, "title", e.target.value)
                            }
                            placeholder="e.g. Chapter 1 | The Hope"
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Page Range *
                          </label>
                          <input
                            type="text"
                            required
                            value={ch.pageRange}
                            onChange={(e) =>
                              handleChapterChange(
                                idx,
                                "pageRange",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Page No: 12 - 50"
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0266b3]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Excerpt / Synopsis
                        </label>
                        <textarea
                          rows={2}
                          value={ch.excerpt}
                          onChange={(e) =>
                            handleChapterChange(idx, "excerpt", e.target.value)
                          }
                          placeholder="Brief preview of chapter content..."
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pickup Clinics Management Section */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0266b3]" />
                    <span>Authorized Pickup Clinics ({currentBook?.pickupClinics?.length || 0})</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Physical book buyers can select any of these clinic branches during checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddClinicModal}
                  className="px-3 py-1.5 rounded-xl bg-[#0266b3] hover:bg-[#02569b] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Clinic Branch</span>
                </button>
              </div>

              {!currentBook?.pickupClinics || currentBook.pickupClinics.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  No pickup clinics added yet. Click &quot;Add Clinic Branch&quot; to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentBook.pickupClinics.map((clinic: any) => {
                    const clinicId = clinic.id || clinic._id;
                    const isDeleting = isDeletingClinicId === clinicId;
                    return (
                      <div
                        key={clinicId || clinic.name}
                        className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-start gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-[#0266b3] shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate">
                                {clinic.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {clinic.distance || "1.0 Km away"} • {clinic.timing || "9 AM - 6 PM"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditClinicModal(clinic)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0266b3] hover:bg-blue-50 transition cursor-pointer"
                              title="Edit Clinic Details"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteClinic(clinic)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                              title="Delete Clinic Branch"
                            >
                              {isDeleting ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-600">
                          {clinic.address && (
                            <p className="truncate">
                              <span className="font-semibold text-slate-700">Address:</span>{" "}
                              {clinic.address}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Phone: {clinic.phone || "+977-1-4782000"}</span>
                            <span>City: {clinic.city || "Kathmandu"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#031b33] via-[#083358] to-[#02569b] hover:from-[#021324] hover:to-[#024982] text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-cyan-300" />
                  <span>Save All Changes & Sync Mobile App Real-Time</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ---------------- SUB-TAB 4: RECORD IN-CLINIC SALE / ORDER ---------------- */}
      {activeSubTab === "create" && (
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              Record In-Clinic Book Sale / Manual Order
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Issue an official digital receipt or clinic-pickup token for a reader purchasing Economic Revolution.
            </p>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="e.g. Ramesh Thapa"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  placeholder="ramesh@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="+977 98..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>
            </div>

            {/* Book Appearance */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Book Appearance *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, bookAppearance: "physical" })
                  }
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                    formData.bookAppearance === "physical"
                      ? "border-[#0266b3] bg-blue-50/50 text-[#0266b3]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Physical Book (Clinic Pickup)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, bookAppearance: "digital" })
                  }
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                    formData.bookAppearance === "digital"
                      ? "border-[#0266b3] bg-blue-50/50 text-[#0266b3]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Digital E-Book (App Access)</span>
                </button>
              </div>
            </div>

            {/* Pickup Location (if physical) */}
            {formData.bookAppearance === "physical" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Designated Pickup Clinic Branch *
                </label>
                <select
                  value={formData.pickupLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupLocation: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3] cursor-pointer"
                >
                  {currentBook?.pickupClinics && currentBook.pickupClinics.length > 0 ? (
                    currentBook.pickupClinics.map((clinic: any) => (
                      <option key={clinic.id || clinic._id} value={clinic.name}>
                        {clinic.name} ({clinic.distance || clinic.branch || "Authorized"})
                      </option>
                    ))
                  ) : (
                    <option value="Kalki Clinic - Baneshwor Branch">
                      Kalki Clinic - Baneshwor Branch (1.2 Km)
                    </option>
                  )}
                </select>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "esewa", label: "eSewa" },
                  { id: "khalti", label: "Khalti" },
                  { id: "qr", label: "QR Code" },
                  { id: "bank", label: "Bank Wire" },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, paymentMethod: pm.id as any })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition text-center ${
                      formData.paymentMethod === pm.id
                        ? "border-[#0266b3] bg-blue-50/50 text-[#0266b3]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Fields if Bank selected */}
            {formData.paymentMethod === "bank" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700">Bank Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={formData.accountHolder}
                    onChange={(e) =>
                      setFormData({ ...formData, accountHolder: e.target.value })
                    }
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, accountNumber: e.target.value })
                    }
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Branch Name"
                    value={formData.branchName}
                    onChange={(e) =>
                      setFormData({ ...formData, branchName: e.target.value })
                    }
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="IFSC / Swift Code"
                    value={formData.ifscCode}
                    onChange={(e) =>
                      setFormData({ ...formData, ifscCode: e.target.value })
                    }
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Price Confirmation */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <span className="text-slate-500 font-medium">Order Total:</span>
              <span className="font-mono font-bold text-base text-[#0266b3]">
                NPR 1,000/-
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={orderSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#031b33] via-[#083358] to-[#02569b] text-white text-xs font-bold hover:opacity-95 transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {orderSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Recording Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  <span>Confirm Sale & Record Order (NPR 1,000)</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ---------------- ADD / EDIT CLINIC BRANCH MODAL ---------------- */}
      {isClinicModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setIsClinicModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0266b3] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingClinic ? "Edit Pickup Clinic Branch" : "Add Authorized Pickup Clinic"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Synchronizes directly with physical book buyers in mobile app.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClinicModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveClinic} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Clinic Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={clinicFormData.name}
                  onChange={(e) =>
                    setClinicFormData({ ...clinicFormData, name: e.target.value })
                  }
                  placeholder="e.g. Kalki Clinic - Baneshwor Branch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Area / Branch
                  </label>
                  <input
                    type="text"
                    value={clinicFormData.branch}
                    onChange={(e) =>
                      setClinicFormData({ ...clinicFormData, branch: e.target.value })
                    }
                    placeholder="e.g. New Baneshwor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={clinicFormData.city}
                    onChange={(e) =>
                      setClinicFormData({ ...clinicFormData, city: e.target.value })
                    }
                    placeholder="e.g. Kathmandu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Distance Note
                  </label>
                  <input
                    type="text"
                    value={clinicFormData.distance}
                    onChange={(e) =>
                      setClinicFormData({ ...clinicFormData, distance: e.target.value })
                    }
                    placeholder="e.g. 1.2 Km away"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={clinicFormData.timing}
                    onChange={(e) =>
                      setClinicFormData({ ...clinicFormData, timing: e.target.value })
                    }
                    placeholder="e.g. 9 AM - 6 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  value={clinicFormData.address}
                  onChange={(e) =>
                    setClinicFormData({ ...clinicFormData, address: e.target.value })
                  }
                  placeholder="e.g. New Baneshwor Chowk, Kathmandu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0266b3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={clinicFormData.phone}
                    onChange={(e) =>
                      setClinicFormData({ ...clinicFormData, phone: e.target.value })
                    }
                    placeholder="e.g. +977-1-4782101"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0266b3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    GPS Coordinates (Lat, Lng)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="number"
                      step="any"
                      value={clinicFormData.latitude}
                      onChange={(e) =>
                        setClinicFormData({
                          ...clinicFormData,
                          latitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Latitude"
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-mono focus:outline-none focus:border-[#0266b3]"
                    />
                    <input
                      type="number"
                      step="any"
                      value={clinicFormData.longitude}
                      onChange={(e) =>
                        setClinicFormData({
                          ...clinicFormData,
                          longitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Longitude"
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-mono focus:outline-none focus:border-[#0266b3]"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClinicModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingClinic}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#031b33] to-[#0266b3] hover:from-[#021324] hover:to-[#024982] text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingClinic ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                      <span>{editingClinic ? "Update Clinic" : "Save Clinic Branch"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
