import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.kalkisenadrive.com/api";

export interface BookChapter {
  _id?: string;
  chapterNumber: number;
  title: string;
  pageRange: string;
  excerpt: string;
}

export interface BookReview {
  _id?: string;
  reviewerName: string;
  rating: number;
  heading: string;
  comment: string;
  createdAt?: string;
}

export interface PickupClinic {
  id: string;
  _id?: string;
  name: string;
  branch?: string;
  distance?: string;
  timing?: string;
  address?: string;
  phone?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface PromoVideoData {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  description?: string;
}

export interface BookData {
  _id?: string;
  title: string;
  subtitle?: string;
  author: string;
  coAuthor?: string;
  price: number;
  currency: string;
  coverImage?: string;
  authorAvatar?: string;
  rating: number;
  totalReviews: number;
  whyBuy?: {
    title: string;
    leadText: string;
    points: string[];
    highlight: string;
  };
  aboutText?: string;
  summaryText?: string;
  appearances: ("physical" | "digital")[];
  pickupClinics?: PickupClinic[];
  chapters?: BookChapter[];
  reviews?: BookReview[];
  promoVideo?: PromoVideoData;
  pdfUrl?: string;
  pdfPublicId?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  pdfUploadedAt?: string;
  totalSold?: number;
  targetGoal?: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface BookOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  bookTitle: string;
  bookAppearance: "physical" | "digital";
  pickupLocation?: string;
  deliveryAddress?: string;
  paymentMethod: "esewa" | "khalti" | "qr" | "bank";
  bankDetails?: {
    accountHolder?: string;
    accountNumber?: string;
    branchName?: string;
    ifscCode?: string;
  };
  amount: number;
  currency: string;
  paymentStatus: "pending" | "completed" | "failed";
  orderStatus:
    | "confirmed"
    | "processing"
    | "ready_for_pickup"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: string;
}

export interface BookStats {
  totalSold: number;
  targetGoal: number;
  progressPercent: number;
  totalOrdersCount: number;
  physicalCount: number;
  digitalCount: number;
  totalRevenueNPR: number;
  currency: string;
  bookPrice: number;
}

export interface PaymentUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  createdAt?: string;
}

export interface PaymentOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  bookAppearance: "physical" | "digital";
  pickupLocation?: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt?: string;
}

export interface PaymentRecord {
  _id: string;
  order?: PaymentOrder;
  user?: PaymentUser;
  book?: {
    _id: string;
    title: string;
    price: number;
    author: string;
    coverImage?: string;
  };
  paymentMethod: "esewa" | "khalti" | "qr" | "bank";
  transactionUuid: string;
  transactionCode?: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  environment: string;
  signature?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  failureReason?: string;
  esewaResponseRaw?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  verifiedRevenue: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  cancelledCount: number;
  totalTransactions: number;
  currency: string;
}

export interface BookState {
  books: BookData[];
  activeBook: BookData | null;
  orders: BookOrder[];
  payments: PaymentRecord[];
  paymentSummary: PaymentSummary | null;
  selectedPaymentDetail: PaymentRecord | null;
  stats: BookStats | null;
  loading: boolean;
  paymentsLoading: boolean;
  paymentDetailLoading: boolean;
  orderSubmitting: boolean;
  uploadingImage: boolean;
  uploadingPdf: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BookState = {
  books: [],
  activeBook: null,
  orders: [],
  payments: [],
  paymentSummary: null,
  selectedPaymentDetail: null,
  stats: null,
  loading: false,
  paymentsLoading: false,
  paymentDetailLoading: false,
  orderSubmitting: false,
  uploadingImage: false,
  uploadingPdf: false,
  error: null,
  successMessage: null,
};

// Async Thunks
export const fetchBooks = createAsyncThunk(
  "book/fetchBooks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books`);
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch books");
      }
      return data.data as BookData[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error fetching books");
    }
  }
);

export const fetchBookStats = createAsyncThunk(
  "book/fetchBookStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/stats`);
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch book stats");
      }
      return data.data as BookStats;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error fetching stats");
    }
  }
);

export const fetchBookOrders = createAsyncThunk(
  "book/fetchBookOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/orders/all`);
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch orders");
      }
      return data.data as BookOrder[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error fetching orders");
    }
  }
);

export const createBookOrder = createAsyncThunk(
  "book/createBookOrder",
  async (orderPayload: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to create order");
      }
      // Re-fetch stats and orders to keep UI synced
      dispatch(fetchBookOrders());
      dispatch(fetchBookStats());
      return data.data as BookOrder;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error creating order");
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "book/updateOrderStatus",
  async (
    {
      orderId,
      orderStatus,
      paymentStatus,
    }: { orderId: string; orderStatus?: string; paymentStatus?: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/books/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderStatus, paymentStatus }),
        }
      );
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to update order status");
      }
      dispatch(fetchBookOrders());
      return data.data as BookOrder;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error updating status");
    }
  }
);

export const updateBookData = createAsyncThunk(
  "book/updateBookData",
  async (
    { bookId, bookData }: { bookId?: string; bookData: Partial<BookData> },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const url = bookId
        ? `${API_BASE_URL}/books/${bookId}`
        : `${API_BASE_URL}/books`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to update book data");
      }
      dispatch(fetchBooks());
      dispatch(fetchBookStats());
      return data.data as BookData;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error updating book");
    }
  }
);

export const uploadBookCoverImage = createAsyncThunk(
  "book/uploadBookCoverImage",
  async (fileOrBase64: File | string, { rejectWithValue, dispatch }) => {
    try {
      let response;
      if (typeof fileOrBase64 === "string") {
        response = await fetch(`${API_BASE_URL}/books/upload-cover`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: fileOrBase64 }),
        });
      } else {
        const formData = new FormData();
        formData.append("coverImage", fileOrBase64);
        response = await fetch(`${API_BASE_URL}/books/upload-cover`, {
          method: "POST",
          body: formData,
        });
      }
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to upload image");
      }
      dispatch(fetchBooks());
      return data.coverUrl as string;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error uploading image");
    }
  }
);

// Upload Book PDF (Digital Edition)
export const uploadBookPdf = createAsyncThunk(
  "book/uploadBookPdf",
  async (file: File, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const response = await fetch(`${API_BASE_URL}/books/upload-pdf`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to upload PDF");
      }
      dispatch(fetchBooks());
      return data.data as BookData;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error uploading PDF");
    }
  }
);

// Delete Book PDF
export const deleteBookPdf = createAsyncThunk(
  "book/deleteBookPdf",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/pdf`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to remove PDF");
      }
      dispatch(fetchBooks());
      return data.data as BookData;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error removing PDF");
    }
  }
);

export const addPickupClinic = createAsyncThunk(
  "book/addPickupClinic",
  async (clinicData: Partial<PickupClinic>, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/clinics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicData),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to add clinic branch");
      }
      dispatch(fetchBooks());
      return data.data as PickupClinic[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error adding clinic");
    }
  }
);

export const deletePickupClinic = createAsyncThunk(
  "book/deletePickupClinic",
  async (clinicId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/clinics/${clinicId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to delete clinic branch");
      }
      dispatch(fetchBooks());
      return data.data as PickupClinic[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error deleting clinic");
    }
  }
);

export const updateSinglePickupClinic = createAsyncThunk(
  "book/updateSinglePickupClinic",
  async (
    { clinicId, updates }: { clinicId: string; updates: Partial<PickupClinic> },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/clinics/${clinicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to update clinic branch");
      }
      dispatch(fetchBooks());
      return data.data as PickupClinic[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error updating clinic");
    }
  }
);

export const updatePickupClinics = createAsyncThunk(
  "book/updatePickupClinics",
  async (clinics: PickupClinic[], { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/clinics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinics }),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to update clinics list");
      }
      dispatch(fetchBooks());
      return data.data as PickupClinic[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error updating clinics");
    }
  }
);

// -------------------------------------------------------------
// Superadmin eSewa Payments & Verification Async Thunks
// -------------------------------------------------------------
const getAdminAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("superadmin_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const fetchAdminPayments = createAsyncThunk(
  "book/fetchAdminPayments",
  async (
    params: { status?: string; search?: string; appearance?: string } | void,
    { rejectWithValue }
  ) => {
    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== "all") {
        query.append("status", params.status);
      }
      if (params?.search) {
        query.append("search", params.search);
      }
      if (params?.appearance && params.appearance !== "all") {
        query.append("appearance", params.appearance);
      }

      const qs = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/admin/payments${qs}`, {
        headers: getAdminAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch payments");
      }
      return data.data as PaymentRecord[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error fetching payments");
    }
  }
);

export const fetchPaymentSummary = createAsyncThunk(
  "book/fetchPaymentSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/payments/summary`, {
        headers: getAdminAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch payment summary");
      }
      return data.data as PaymentSummary;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error fetching summary");
    }
  }
);

export const fetchPaymentById = createAsyncThunk(
  "book/fetchPaymentById",
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/payments/${paymentId}`,
        {
          headers: getAdminAuthHeaders(),
        }
      );
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch payment details");
      }
      return data.data as PaymentRecord;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error fetching payment");
    }
  }
);

export const reverifyPaymentWithEsewa = createAsyncThunk(
  "book/reverifyPaymentWithEsewa",
  async (paymentId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/payments/${paymentId}/re-verify`,
        {
          method: "POST",
          headers: getAdminAuthHeaders(),
        }
      );
      const data = await response.json();
      if (!data.success && !data.data) {
        return rejectWithValue(data.message || "eSewa status check failed");
      }
      dispatch(fetchAdminPayments());
      dispatch(fetchPaymentSummary());
      return data.data as PaymentRecord;
    } catch (err: any) {
      return rejectWithValue(
        err.message || "Network error re-verifying payment"
      );
    }
  }
);

export const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    setActiveBook: (state, action: PayloadAction<BookData>) => {
      state.activeBook = action.payload;
    },
    setSelectedPaymentDetail: (
      state,
      action: PayloadAction<PaymentRecord | null>
    ) => {
      state.selectedPaymentDetail = action.payload;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Books
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
        if (action.payload.length > 0 && !state.activeBook) {
          state.activeBook = action.payload[0];
        }
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load books";
      });

    // Fetch Stats
    builder.addCase(fetchBookStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Fetch Orders
    builder.addCase(fetchBookOrders.fulfilled, (state, action) => {
      state.orders = action.payload;
    });

    // Create Order
    builder
      .addCase(createBookOrder.pending, (state) => {
        state.orderSubmitting = true;
        state.error = null;
      })
      .addCase(createBookOrder.fulfilled, (state, action) => {
        state.orderSubmitting = false;
        state.orders.unshift(action.payload);
        state.successMessage = `Order ${action.payload.orderId} created successfully!`;
      })
      .addCase(createBookOrder.rejected, (state, action) => {
        state.orderSubmitting = false;
        state.error = (action.payload as string) || "Order creation failed";
      });

    // Update Book Data
    builder
      .addCase(updateBookData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookData.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBook = action.payload;
        state.successMessage = "Book data updated successfully in database!";
      })
      .addCase(updateBookData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update book";
      });

    // Upload Cover Image
    builder
      .addCase(uploadBookCoverImage.pending, (state) => {
        state.uploadingImage = true;
        state.error = null;
      })
      .addCase(uploadBookCoverImage.fulfilled, (state, action) => {
        state.uploadingImage = false;
        if (state.activeBook) {
          state.activeBook.coverImage = action.payload;
        }
        state.successMessage = "Book cover uploaded to Cloudinary successfully!";
      })
      .addCase(uploadBookCoverImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.error = (action.payload as string) || "Failed to upload image";
      });

    // Book PDF Upload & Removal
    builder
      .addCase(uploadBookPdf.pending, (state) => {
        state.uploadingPdf = true;
        state.error = null;
      })
      .addCase(uploadBookPdf.fulfilled, (state, action) => {
        state.uploadingPdf = false;
        if (state.activeBook) {
          state.activeBook.pdfUrl = action.payload.pdfUrl;
          state.activeBook.pdfFileName = action.payload.pdfFileName;
          state.activeBook.pdfFileSize = action.payload.pdfFileSize;
          state.activeBook.pdfUploadedAt = action.payload.pdfUploadedAt;
        }
        state.successMessage = "Book PDF uploaded and attached successfully!";
      })
      .addCase(uploadBookPdf.rejected, (state, action) => {
        state.uploadingPdf = false;
        state.error = (action.payload as string) || "Failed to upload PDF file";
      })
      .addCase(deleteBookPdf.pending, (state) => {
        state.uploadingPdf = true;
        state.error = null;
      })
      .addCase(deleteBookPdf.fulfilled, (state) => {
        state.uploadingPdf = false;
        if (state.activeBook) {
          state.activeBook.pdfUrl = "";
          state.activeBook.pdfFileName = "";
          state.activeBook.pdfFileSize = 0;
          state.activeBook.pdfUploadedAt = undefined;
        }
        state.successMessage = "Book PDF removed successfully!";
      })
      .addCase(deleteBookPdf.rejected, (state, action) => {
        state.uploadingPdf = false;
        state.error = (action.payload as string) || "Failed to remove PDF file";
      });

    // Pickup Clinics CRUD
    builder
      .addCase(addPickupClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPickupClinic.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activeBook) {
          state.activeBook.pickupClinics = action.payload;
        }
        state.successMessage = "Pickup clinic branch added successfully!";
      })
      .addCase(addPickupClinic.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to add clinic branch";
      })
      .addCase(deletePickupClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePickupClinic.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activeBook) {
          state.activeBook.pickupClinics = action.payload;
        }
        state.successMessage = "Pickup clinic branch removed successfully!";
      })
      .addCase(deletePickupClinic.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete clinic branch";
      })
      .addCase(updateSinglePickupClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSinglePickupClinic.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activeBook) {
          state.activeBook.pickupClinics = action.payload;
        }
        state.successMessage = "Pickup clinic branch updated successfully!";
      })
      .addCase(updateSinglePickupClinic.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update clinic branch";
      })
      .addCase(updatePickupClinics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePickupClinics.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activeBook) {
          state.activeBook.pickupClinics = action.payload;
        }
        state.successMessage = "Pickup clinics list synchronized successfully!";
      })
      .addCase(updatePickupClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update clinics list";
      });

    // Superadmin Payments Management
    builder
      .addCase(fetchAdminPayments.pending, (state) => {
        state.paymentsLoading = true;
      })
      .addCase(fetchAdminPayments.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchAdminPayments.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.error = (action.payload as string) || "Failed to fetch payments";
      })
      .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
        state.paymentSummary = action.payload;
      })
      .addCase(fetchPaymentById.pending, (state) => {
        state.paymentDetailLoading = true;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.paymentDetailLoading = false;
        state.selectedPaymentDetail = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.paymentDetailLoading = false;
        state.error = (action.payload as string) || "Failed to fetch payment details";
      })
      .addCase(reverifyPaymentWithEsewa.pending, (state) => {
        state.paymentDetailLoading = true;
      })
      .addCase(reverifyPaymentWithEsewa.fulfilled, (state, action) => {
        state.paymentDetailLoading = false;
        state.selectedPaymentDetail = action.payload;
        state.successMessage = "eSewa status successfully checked & refreshed!";
      })
      .addCase(reverifyPaymentWithEsewa.rejected, (state, action) => {
        state.paymentDetailLoading = false;
        state.error = (action.payload as string) || "eSewa verification failed";
      });
  },
});

export const { setActiveBook, setSelectedPaymentDetail, clearMessages } =
  bookSlice.actions;
export default bookSlice.reducer;
