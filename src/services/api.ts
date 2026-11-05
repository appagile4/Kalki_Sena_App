import { Platform } from "react-native";
import { secureStorage } from "./secureStorage";

// API Base URL:
// 1. Checks EXPO_PUBLIC_API_URL
// 2. Default to local network IP for physical devices / emulators
// 3. Fallback to localhost on web
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }
  // Local network IP address for React Native mobile
  return "http://192.168.29.235:5000/api";
};

export const API_BASE_URL = getBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  token?: string;
  user?: T;
  email?: string;
  phone?: string;
  name?: string;
  avatarUrl?: string;
  publicId?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  password: string;
  avatar?: string;
}

export interface SendOtpPayload {
  email?: string;
  phone?: string;
  type?: "signup" | "forgot_password" | "resend" | "login";
  name?: string;
}

export interface VerifyOtpPayload {
  email?: string;
  phone?: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  identifier: string;
}

export interface ResetPasswordPayload {
  email?: string;
  phone?: string;
  otp: string;
  newPassword: string;
}

// Helper to assemble authenticated request headers using SecureStore token
export const getAuthHeaders = async (
  explicitToken?: string | null
): Promise<Record<string, string>> => {
  const token = explicitToken || (await secureStorage.getAccessToken());
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const apiService = {
  // Google Sign-In Request
  googleLogin: async (idToken: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to authenticate with Google");
      }
      return data;
    } catch (error: any) {
      throw new Error(
        error.message || "Google authentication request failed. Check server."
      );
    }
  },

  // Login Request
  login: async (payload: LoginPayload): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network request failed. Check server.");
    }
  },

  // Signup Request
  signup: async (payload: SignupPayload): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to sign up");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network request failed. Check server.");
    }
  },

  // Send OTP Request
  sendOtp: async (payload: SendOtpPayload): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network request failed. Check server.");
    }
  },

  // Resend OTP Request
  resendOtp: async (payload: { email?: string; phone?: string; type?: string }): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network request failed. Check server.");
    }
  },

  // Verify OTP Request
  verifyOtp: async (payload: VerifyOtpPayload): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Invalid or expired verification code");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network request failed. Check server.");
    }
  },

  // Forgot Password Request
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to process forgot password request");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network request failed. Check server.");
    }
  },

  // Reset Password Request
  resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network request failed. Check server.");
    }
  },

  // Get Current Authenticated User Profile
  getMe: async (token?: string | null): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders(token);
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid/expired - clear secure storage
          await secureStorage.clearAuthStorage();
        }
        throw new Error(data.message || "Unauthorized");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network request failed");
    }
  },

  // Upload Avatar Image to Cloudinary and save to MongoDB
  uploadAvatar: async (
    imageSource: string | FormData,
    token?: string | null
  ): Promise<ApiResponse> => {
    try {
      const isFormData = typeof FormData !== "undefined" && imageSource instanceof FormData;
      const headers = await getAuthHeaders(token);
      delete headers["Content-Type"]; // Let fetch set boundary for FormData

      let body: any;
      if (isFormData) {
        body = imageSource;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ image: imageSource });
      }

      const response = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
        method: "POST",
        headers,
        body,
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          await secureStorage.clearAuthStorage();
        }
        throw new Error(data.message || "Failed to upload avatar");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Failed to upload avatar to Cloudinary");
    }
  },

  // Update Profile Data in MongoDB
  updateProfile: async (
    payload: { fullName?: string; phone?: string; dob?: string; gender?: string; avatar?: string },
    token?: string | null
  ): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders(token);
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          await secureStorage.clearAuthStorage();
        }
        throw new Error(data.message || "Failed to update profile");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network request failed");
    }
  },

  // Logout Request
  logout: async (token?: string | null): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders(token);
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers,
      });

      const data = await response.json().catch(() => ({ success: true, message: "Logged out" }));
      await secureStorage.clearAuthStorage();
      return data;
    } catch {
      // Regardless of network failures, clear local credentials
      await secureStorage.clearAuthStorage();
      return { success: true, message: "Logged out locally" };
    }
  },
};
