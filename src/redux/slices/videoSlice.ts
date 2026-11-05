import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface PromoVideoState {
  title: string;
  videoUrl: string;
  videoPublicId?: string;
  thumbnailUrl: string;
  thumbnailPublicId?: string;
  description?: string;
  duration?: number;
  bytes?: number;
  updatedAt?: string;
}

export interface VideoSliceState {
  promoVideo: PromoVideoState | null;
  loading: boolean;
  uploadingVideo: boolean;
  uploadingThumbnail: boolean;
  isSavingDetails: boolean;
  error: string | null;
  successMessage: string | null;
  deletedPreviousNotice: string | null;
}

const initialState: VideoSliceState = {
  promoVideo: null,
  loading: false,
  uploadingVideo: false,
  uploadingThumbnail: false,
  isSavingDetails: false,
  error: null,
  successMessage: null,
  deletedPreviousNotice: null,
};

// 1. Fetch current promo video
export const fetchPromoVideo = createAsyncThunk(
  "video/fetchPromoVideo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/videos/promo`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to fetch video details");
      }
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error fetching video");
    }
  }
);

// 2. Upload video file to Cloudinary (Auto-deletes previous video from Cloudinary)
export const uploadPromoVideo = createAsyncThunk(
  "video/uploadPromoVideo",
  async (
    payload: { file: File; title?: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("video", payload.file);
      if (payload.title) formData.append("title", payload.title);
      if (payload.description) formData.append("description", payload.description);

      const res = await fetch(`${API_BASE_URL}/videos/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to upload video");
      }
      return {
        data: data.data,
        message: data.message,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error uploading video");
    }
  }
);

// 3. Upload thumbnail file to Cloudinary
export const uploadPromoThumbnail = createAsyncThunk(
  "video/uploadPromoThumbnail",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("thumbnail", file);

      const res = await fetch(`${API_BASE_URL}/videos/thumbnail`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to upload thumbnail");
      }
      return {
        data: data.data,
        message: data.message,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error uploading thumbnail");
    }
  }
);

// 4. Update metadata (title, description, custom URLs)
export const updatePromoVideoDetails = createAsyncThunk(
  "video/updatePromoVideoDetails",
  async (
    payload: {
      title?: string;
      description?: string;
      videoUrl?: string;
      thumbnailUrl?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/videos/promo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to update video metadata");
      }
      return {
        data: data.data,
        message: data.message,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error updating video metadata");
    }
  }
);

// 5. Delete video from Cloudinary
export const deletePromoVideo = createAsyncThunk(
  "video/deletePromoVideo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/videos/promo`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to delete video");
      }
      return {
        data: data.data,
        message: data.message,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Network error deleting video");
    }
  }
);

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    clearVideoMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.deletedPreviousNotice = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPromoVideo
    builder
      .addCase(fetchPromoVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromoVideo.fulfilled, (state, action: PayloadAction<PromoVideoState>) => {
        state.loading = false;
        state.promoVideo = action.payload;
      })
      .addCase(fetchPromoVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // uploadPromoVideo
    builder
      .addCase(uploadPromoVideo.pending, (state) => {
        state.uploadingVideo = true;
        state.error = null;
        state.successMessage = null;
        state.deletedPreviousNotice = null;
      })
      .addCase(uploadPromoVideo.fulfilled, (state, action) => {
        state.uploadingVideo = false;
        state.promoVideo = action.payload.data;
        state.successMessage = action.payload.message;
        state.deletedPreviousNotice =
          "Previous Cloudinary video was safely deleted from backend storage to prevent orphaned files.";
      })
      .addCase(uploadPromoVideo.rejected, (state, action) => {
        state.uploadingVideo = false;
        state.error = action.payload as string;
      });

    // uploadPromoThumbnail
    builder
      .addCase(uploadPromoThumbnail.pending, (state) => {
        state.uploadingThumbnail = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadPromoThumbnail.fulfilled, (state, action) => {
        state.uploadingThumbnail = false;
        state.promoVideo = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(uploadPromoThumbnail.rejected, (state, action) => {
        state.uploadingThumbnail = false;
        state.error = action.payload as string;
      });

    // updatePromoVideoDetails
    builder
      .addCase(updatePromoVideoDetails.pending, (state) => {
        state.isSavingDetails = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updatePromoVideoDetails.fulfilled, (state, action) => {
        state.isSavingDetails = false;
        state.promoVideo = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(updatePromoVideoDetails.rejected, (state, action) => {
        state.isSavingDetails = false;
        state.error = action.payload as string;
      });

    // deletePromoVideo
    builder
      .addCase(deletePromoVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deletePromoVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.promoVideo = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(deletePromoVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearVideoMessages } = videoSlice.actions;
export default videoSlice.reducer;
