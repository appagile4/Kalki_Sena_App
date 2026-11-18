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
  uploadBookPdf,
  deleteBookPdf,
  fetchAdminPayments,
  fetchPaymentSummary,
  fetchPaymentById,
  reverifyPaymentWithEsewa,
  setSelectedPaymentDetail,
  clearMessages,
  BookChapter,
  PickupClinic,
  PaymentRecord,
  PaymentSummary,
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
  FileText,
  Download,
  Video,
  Play,
  Phone,
  Navigation,
  AlertCircle,
  ShieldCheck,
  X,
} from "lucide-react";

export default function BookManagement() {
  const dispatch = useAppDispatch();
  const {
    books,
    activeBook,
    orders,
    payments = [],
    paymentSummary,
    selectedPaymentDetail,
    paymentsLoading,
    paymentDetailLoading,
    stats,
    loading,
    orderSubmitting,
    uploadingImage,
    uploadingPdf,
    error,
    successMessage,
  } = useAppSelector((state) => state.book);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await dispatch(uploadBookCoverImage(file));
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await dispatch(uploadBookPdf(file));
    }
  };

  const handleDeletePdf = async () => {
    if (confirm("Are you sure you want to remove the book PDF document?")) {
      await dispatch(deleteBookPdf());
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<
    "orders" | "payments" | "preview" | "edit" | "create"
  >("orders");
  const [filterAppearance, setFilterAppearance] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [paymentSearch, setPaymentSearch] = useState<string>("");
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [inspectedPayment, setInspectedPayment] = useState<PaymentRecord | null>(null);
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

  // Chapter Handlers (Max 3 chapters limit)
  const handleAddChapter = () => {
    if (chapters.length >= 3) {
      alert("Only a maximum of 3 chapters can be added for the book.");
      return;
    }
    const nextNum = chapters.length + 1;
    setChapters([
      ...chapters,
      {
        chapterNumber: nextNum,
        title: `Chapter ${nextNum} | New Chapter Title`,
        pageRange: `Page No: ${nextNum * 40} - ${nextNum * 40 + 35}`,
        excerpt: "Brief preview and synopsis lines of this chapter.",
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
    dispatch(fetchAdminPayments());
    dispatch(fetchPaymentSummary());
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

  // Filtered eSewa Payments
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus =
      paymentStatusFilter === "all" || payment.status === paymentStatusFilter;
    const matchesAppearance =
      filterAppearance === "all" ||
      payment.order?.bookAppearance === filterAppearance;

    if (!paymentSearch.trim()) return matchesStatus && matchesAppearance;

    const q = paymentSearch.toLowerCase();
    const u = payment.user;
    const o = payment.order;
    const matchesSearch =
      Boolean(
        payment.transactionUuid &&
          payment.transactionUuid.toLowerCase().includes(q)
      ) ||
      Boolean(
        payment.transactionCode &&
          payment.transactionCode.toLowerCase().includes(q)
      ) ||
      Boolean(u?.fullName && u.fullName.toLowerCase().includes(q)) ||
      Boolean(u?.email && u.email.toLowerCase().includes(q)) ||
      Boolean(u?.phone && u.phone.includes(q)) ||
      Boolean(o?.orderId && o.orderId.toLowerCase().includes(q)) ||
      Boolean(o?.customerName && o.customerName.toLowerCase().includes(q));

    return matchesStatus && matchesAppearance && matchesSearch;
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
          onClick={() => {
            setActiveSubTab("payments");
            dispatch(fetchAdminPayments());
            dispatch(fetchPaymentSummary());
          }}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeSubTab === "payments"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>eSewa Payments & User Details ({payments.length})</span>
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
                          {(order as any).esewaTransactionCode && (
                            <p className="text-[10px] text-emerald-600 font-mono mt-1 font-bold">
                              Ref: {(order as any).esewaTransactionCode}
                            </p>
                          )}
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

      {/* ---------------- SUB-TAB: ESEWA PAYMENTS & USER DETAILS ---------------- */}
      {activeSubTab === "payments" && (
        <div className="space-y-4">
          {/* eSewa Gateway Architecture & Credentials Banner */}
          <div className="bg-gradient-to-r from-[#031b33] to-[#06335d] p-5 rounded-2xl border border-white/10 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#60BB46] text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
                e
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-wide">
                    eSewa Native Payment Gateway
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                    UAT Sandbox Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Service Code: <span className="font-mono text-cyan-300 font-bold">EPAYTEST</span> • Status Verification: <span className="font-mono text-slate-300">rc-epay.esewa.com.np</span> • Server-side HMAC-SHA256 verified
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  dispatch(fetchAdminPayments());
                  dispatch(fetchPaymentSummary());
                }}
                disabled={paymentsLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/20 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${paymentsLoading ? "animate-spin" : ""}`} />
                <span>Sync eSewa Transactions</span>
              </button>
            </div>
          </div>

          {/* eSewa Specific KPI Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Verified eSewa Revenue</p>
                <h3 className="text-xl font-bold text-emerald-600">
                  NPR {(paymentSummary?.verifiedRevenue || 0).toLocaleString()}
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold font-mono">
                  {paymentSummary?.completedCount || 0} Successful Orders
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0266b3] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Completed Payments</p>
                <h3 className="text-xl font-bold text-slate-800">
                  {paymentSummary?.completedCount || 0}
                </h3>
                <span className="text-[10px] text-emerald-600 font-mono">
                  Book Access Granted
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Pending Verification</p>
                <h3 className="text-xl font-bold text-amber-600">
                  {paymentSummary?.pendingCount || 0}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Awaiting eSewa Gateway
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <X className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Failed / Cancelled</p>
                <h3 className="text-xl font-bold text-rose-600">
                  {(paymentSummary?.failedCount || 0) + (paymentSummary?.cancelledCount || 0)}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {paymentSummary?.failedCount || 0} Failed • {paymentSummary?.cancelledCount || 0} Cancelled
                </span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search buyer name, email, phone, ref, order ID..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="bg-transparent outline-none w-full text-slate-700 text-xs"
                />
              </div>

              {/* Status Filter */}
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">All Payment Statuses</option>
                <option value="completed">Completed (Paid)</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Format Filter */}
              <select
                value={filterAppearance}
                onChange={(e) => setFilterAppearance(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">All Editions</option>
                <option value="digital">Digital E-Book</option>
                <option value="physical">Physical Book</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Showing {filteredPayments.length} of {payments.length} transactions
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Order & Edition</th>
                    <th className="py-3.5 px-4">eSewa Reference & UUID</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        {paymentsLoading ? "Loading eSewa transactions..." : "No eSewa payments found matching your filter."}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const user = p.user;
                      const order = p.order;
                      const isCompleted = p.status === "completed";
                      const isPending = p.status === "pending";
                      const isFailed = p.status === "failed";

                      return (
                        <tr key={p._id} className="hover:bg-slate-50/60 transition">
                          {/* Date */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {new Date(p.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>

                          {/* Customer Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                {user?.fullName ? user.fullName[0] : (order?.customerName ? order.customerName[0] : "K")}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">
                                  {user?.fullName || order?.customerName || "Kalki Reader"}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {user?.email || order?.customerEmail || "No email"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {user?.phone || order?.customerPhone || "No phone"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Order & Edition */}
                          <td className="py-3.5 px-4">
                            <p className="font-mono font-bold text-slate-800">
                              {order?.orderId || "Pending"}
                            </p>
                            <span
                              className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                order?.bookAppearance === "physical"
                                  ? "bg-blue-50 text-[#0266b3] border border-blue-200"
                                  : "bg-purple-50 text-purple-700 border border-purple-200"
                              }`}
                            >
                              {order?.bookAppearance || "digital"}
                            </span>
                            {order?.pickupLocation && order.bookAppearance === "physical" && (
                              <p className="text-[10px] text-slate-500 truncate max-w-[160px] mt-0.5" title={order.pickupLocation}>
                                {order.pickupLocation}
                              </p>
                            )}
                          </td>

                          {/* eSewa Reference & UUID */}
                          <td className="py-3.5 px-4 font-mono">
                            {p.transactionCode ? (
                              <p className="font-bold text-emerald-600 text-xs">
                                Ref: {p.transactionCode}
                              </p>
                            ) : (
                              <p className="text-slate-400 text-xs italic">
                                Ref: Awaiting confirmation
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]" title={p.transactionUuid}>
                              UUID: {p.transactionUuid}
                            </p>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {p.currency} {p.totalAmount.toLocaleString()}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isPending
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : isFailed
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                              {isFailed && <AlertCircle className="w-3 h-3 text-rose-600" />}
                              {p.status}
                            </span>
                          </td>

                          {/* Verification */}
                          <td className="py-3.5 px-4">
                            {p.verifiedAt ? (
                              <div>
                                <p className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Verified</span>
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {new Date(p.verifiedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono italic">
                                Not verified
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setInspectedPayment(p);
                                setPaymentModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
                            >
                              Inspect Audit
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {ch.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ch.pageRange}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-blue-50/50 border-l-2 border-[#0266b3]">
                        <p className="text-[11px] text-slate-600 italic leading-relaxed">
                          &ldquo;{ch.excerpt}&rdquo;
                        </p>
                      </div>
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

            {/* Book PDF (Digital Edition) Upload Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 h-16 rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center shrink-0 shadow-sm text-red-600">
                    <FileText className="w-7 h-7" />
                    <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">PDF</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      <h3 className="text-sm font-bold text-slate-800">
                        Book PDF & Digital Edition
                      </h3>
                      {activeBook?.pdfUrl ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          PDF Attached
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                          No PDF Attached
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      Upload the full digital book PDF document. Readers and mobile app users can download or read this file directly.
                    </p>
                    {activeBook?.pdfUrl ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {activeBook.pdfFileName || "Economic_Revolution_Book.pdf"}
                        </span>
                        {activeBook.pdfFileSize ? (
                          <span className="text-slate-400 font-mono">
                            ({(activeBook.pdfFileSize / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        ) : null}
                        <a
                          href={activeBook.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#0266b3] hover:underline font-semibold ml-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download / View PDF</span>
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="file"
                    ref={pdfInputRef}
                    onChange={handlePdfFileChange}
                    accept="application/pdf,.pdf"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingPdf}
                    onClick={() => pdfInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {uploadingPdf ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Uploading PDF...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{activeBook?.pdfUrl ? "Replace Book PDF" : "Upload Book PDF"}</span>
                      </>
                    )}
                  </button>

                  {activeBook?.pdfUrl ? (
                    <button
                      type="button"
                      disabled={uploadingPdf}
                      onClick={handleDeletePdf}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
                      title="Remove PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
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
                    <span>Book Chapters ({chapters.length} / 3 max)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Only up to 3 chapters can be added from the backend. Some preview lines of each chapter will display in the mobile book details.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={chapters.length >= 3}
                  onClick={handleAddChapter}
                  className="px-3 py-1.5 rounded-xl bg-[#0266b3] hover:bg-[#02569b] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{chapters.length >= 3 ? "Max 3 Chapters Reached" : "Add Chapter"}</span>
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

      {/* ---------------- PAYMENT INSPECTION & AUDIT MODAL ---------------- */}
      {paymentModalOpen && inspectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#60BB46] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                  e
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    eSewa Transaction Audit Log
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    UUID: {inspectedPayment.transactionUuid}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPaymentModalOpen(false);
                  setInspectedPayment(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Banner */}
            <div className="my-4">
              {inspectedPayment.status === "completed" ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong className="font-bold">Payment Verified & Settled.</strong> Official eSewa Reference ID:{" "}
                      <span className="font-mono font-bold text-emerald-700">{inspectedPayment.transactionCode}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold uppercase">
                    {inspectedPayment.verifiedBy || "Server Verified"}
                  </span>
                </div>
              ) : inspectedPayment.status === "pending" ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Awaiting payment completion or gateway callback from eSewa.</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 font-semibold uppercase">Pending</span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Transaction Status: <strong className="uppercase">{inspectedPayment.status}</strong>. {inspectedPayment.failureReason || "Payment was rejected or cancelled."}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-700 font-semibold uppercase">{inspectedPayment.status}</span>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Customer Profile Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-[#0266b3]" />
                  <span>Customer / User Identity</span>
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-800">
                    {inspectedPayment.user?.fullName || inspectedPayment.order?.customerName || "Kalki Reader"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {inspectedPayment.user?.email || inspectedPayment.order?.customerEmail || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Phone Number</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {inspectedPayment.user?.phone || inspectedPayment.order?.customerPhone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">User Role</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-[#0266b3]">
                    {inspectedPayment.user?.role || "Customer"}
                  </span>
                </div>
              </div>

              {/* Order Information Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-2">
                  <Package className="w-3.5 h-3.5 text-purple-600" />
                  <span>Order & Book Details</span>
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Order ID</span>
                  <span className="font-mono text-slate-800 font-bold">
                    {inspectedPayment.order?.orderId || "Pending"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Product</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]" title="Economic Revolution to make Nepal A World Leader">
                    Economic Revolution
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Edition Format</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                    {inspectedPayment.order?.bookAppearance || "digital"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Fulfillment</span>
                  <span className="text-slate-700 truncate max-w-[170px]" title={inspectedPayment.order?.pickupLocation || "Digital In-App Access"}>
                    {inspectedPayment.order?.pickupLocation || "Digital In-App Access"}
                  </span>
                </div>
              </div>
            </div>

            {/* Gateway Security & Signatures */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  HMAC-SHA256 Gateway Protocol
                </span>
                <span className="text-slate-400 text-[10px]">Merchant: EPAYTEST</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400">Total Amount:</span>{" "}
                  <span className="text-white font-bold">{inspectedPayment.currency} {inspectedPayment.totalAmount}</span>
                </div>
                <div>
                  <span className="text-slate-400">Environment:</span>{" "}
                  <span className="text-cyan-300 font-bold">{inspectedPayment.environment || "UAT"}</span>
                </div>
                <div>
                  <span className="text-slate-400">Verified Timestamp:</span>{" "}
                  <span className="text-slate-300">
                    {inspectedPayment.verifiedAt ? new Date(inspectedPayment.verifiedAt).toLocaleString() : "Awaiting Verification"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Signature:</span>{" "}
                  <span className="text-slate-300 truncate inline-block max-w-[150px]" title={inspectedPayment.signature}>
                    {inspectedPayment.signature || "N/A"}
                  </span>
                </div>
              </div>

              {/* Raw eSewa Payload */}
              {inspectedPayment.esewaResponseRaw && (
                <div className="mt-3 pt-2 border-t border-slate-800">
                  <p className="text-[10px] text-slate-400 mb-1">eSewa Raw Server Response:</p>
                  <pre className="bg-slate-950 p-2.5 rounded-lg text-[10px] text-emerald-400 overflow-x-auto max-h-36">
                    {JSON.stringify(inspectedPayment.esewaResponseRaw, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={async () => {
                  const res = await dispatch(reverifyPaymentWithEsewa(inspectedPayment._id));
                  if (res.payload) {
                    setInspectedPayment(res.payload as PaymentRecord);
                  }
                }}
                disabled={paymentDetailLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${paymentDetailLoading ? "animate-spin" : ""}`} />
                <span>Re-Verify Live with eSewa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentModalOpen(false);
                  setInspectedPayment(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
