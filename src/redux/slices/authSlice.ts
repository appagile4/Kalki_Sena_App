import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  apiService,
  LoginPayload,
  SignupPayload,
  SendOtpPayload,
  VerifyOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../../services/api";
import { secureStorage } from "../../services/secureStorage";
import { googleAuthService } from "../../services/googleAuth";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  avatar?: string;
  role?: string;
  googleId?: string;
  authProvider?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  successMessage: string | null;

  // OTP & Password Reset state
  otpLoading: boolean;
  otpSent: boolean;
  otpVerified: boolean;
  otpMessage: string | null;
  otpError: string | null;
  resetPasswordSuccess: boolean;
  resetEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  isInitializing: false,
  error: null,
  successMessage: null,

  otpLoading: false,
  otpSent: false,
  otpVerified: false,
  otpMessage: null,
  otpError: null,
  resetPasswordSuccess: false,
  resetEmail: null,
};

// Async Thunk: Initialize Auth from Expo SecureStore on app launch
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as { auth: AuthState }).auth;
      // Prevent running if already initialized or currently initializing
      if (state.isInitialized) {
        return {
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        };
      }

      const storedToken = await secureStorage.getAccessToken();
      if (!storedToken) {
        return {
          user: null,
          token: null,
          isAuthenticated: false,
        };
      }

      // Stored token found -> validate session with backend GET /api/auth/me
      try {
        const response = await apiService.getMe(storedToken);
        if (response.success && response.user) {
          await secureStorage.saveUser(response.user);
          return {
            user: response.user,
            token: storedToken,
            isAuthenticated: true,
          };
        }
      } catch (err) {
        // Backend returned 401 or network error; invalid session
        await secureStorage.clearAuthStorage();
        return {
          user: null,
          token: null,
          isAuthenticated: false,
        };
      }

      await secureStorage.clearAuthStorage();
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    } catch (error: any) {
      await secureStorage.clearAuthStorage();
      return rejectWithValue(error.message || "Failed to initialize auth");
    }
  }
);

// Async Thunk: Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await apiService.login(payload);
      if (response.token) {
        await secureStorage.saveAccessToken(response.token);
      }
      if (response.user) {
        await secureStorage.saveUser(response.user);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Async Thunk: Google Login
export const googleLoginThunk = createAsyncThunk(
  "auth/googleLogin",
  async (_, { rejectWithValue }) => {
    try {
      const googleResult = await googleAuthService.signIn();

      if (googleResult.cancelled) {
        return rejectWithValue({
          cancelled: true,
          message: "Sign in cancelled",
        });
      }

      if (!googleResult.success || !googleResult.idToken) {
        return rejectWithValue({
          cancelled: false,
          message: googleResult.error || "Google Sign-In failed",
        });
      }

      const response = await apiService.googleLogin(googleResult.idToken);
      if (response.token) {
        await secureStorage.saveAccessToken(response.token);
      }
      if (response.user) {
        await secureStorage.saveUser(response.user);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue({
        cancelled: false,
        message: error.message || "Google authentication failed",
      });
    }
  }
);

// Async Thunk: Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload: SignupPayload, { rejectWithValue }) => {
    try {
      const response = await apiService.signup(payload);
      if (response.token) {
        await secureStorage.saveAccessToken(response.token);
      }
      if (response.user) {
        await secureStorage.saveUser(response.user);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

// Async Thunk: Send OTP
export const sendOtpThunk = createAsyncThunk(
  "auth/sendOtp",
  async (payload: SendOtpPayload, { rejectWithValue }) => {
    try {
      const response = await apiService.sendOtp(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send verification code");
    }
  }
);

// Async Thunk: Resend OTP
export const resendOtpThunk = createAsyncThunk(
  "auth/resendOtp",
  async (payload: { email?: string; phone?: string; type?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.resendOtp(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to resend verification code");
    }
  }
);

// Async Thunk: Verify OTP
export const verifyOtpThunk = createAsyncThunk(
  "auth/verifyOtp",
  async (payload: VerifyOtpPayload, { rejectWithValue }) => {
    try {
      const response = await apiService.verifyOtp(payload);
      if (response.token) {
        await secureStorage.saveAccessToken(response.token);
      }
      if (response.user) {
        await secureStorage.saveUser(response.user);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Invalid or expired verification code");
    }
  }
);

// Async Thunk: Forgot Password
export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await apiService.forgotPassword(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to request password reset");
    }
  }
);

// Async Thunk: Reset Password
export const resetPasswordThunk = createAsyncThunk(
  "auth/resetPassword",
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await apiService.resetPassword(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to reset password");
    }
  }
);

// Async Thunk: Fetch Current User
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getMe(token);
      if (response.user) {
        await secureStorage.saveUser(response.user);
      }
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load user profile");
    }
  }
);

// Async Thunk: Upload Avatar to Cloudinary & update MongoDB
export const uploadAvatarThunk = createAsyncThunk(
  "auth/uploadAvatar",
  async (
    payload: { imageSource: string | FormData; token?: string | null },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.uploadAvatar(
        payload.imageSource,
        payload.token
      );
      if (response.user) {
        await secureStorage.saveUser(response.user);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload avatar");
    }
  }
);

// Async Thunk: Update Profile in MongoDB
export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (
    payload: {
      data: {
        fullName?: string;
        phone?: string;
        dob?: string;
        gender?: string;
        avatar?: string;
      };
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.updateProfile(
        payload.data,
        payload.token
      );
      if (response.user) {
        await secureStorage.saveUser(response.user);
      }
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  }
);

// Async Thunk: Complete Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState }) => {
    const state = (getState() as { auth: AuthState }).auth;
    const token = state.token;
    try {
      await apiService.logout(token);
    } catch {
      // Ignore network errors during logout
    }
    try {
      await googleAuthService.signOut();
    } catch {
      // Ignore Google SDK logout error
    }
    await secureStorage.clearAuthStorage();
    return true;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.successMessage = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.otpError = null;
      secureStorage.clearAuthStorage().catch(() => {});
    },
    clearError: (state) => {
      state.error = null;
      state.otpError = null;
    },
    resetOtpFlow: (state) => {
      state.otpLoading = false;
      state.otpSent = false;
      state.otpVerified = false;
      state.otpMessage = null;
      state.otpError = null;
      state.resetPasswordSuccess = false;
      state.resetEmail = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      secureStorage.saveAccessToken(action.payload.token).catch(() => {});
      secureStorage.saveUser(action.payload.user).catch(() => {});
    },
  },
  extraReducers: (builder) => {
    // --- Initialize Auth ---
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitializing = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // --- Logout User ---
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.successMessage = null;
        state.otpSent = false;
        state.otpVerified = false;
        state.otpError = null;
        state.isInitialized = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isInitialized = true;
      });

    // --- Login ---
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
        state.successMessage = action.payload.message || "Login successful";
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = (action.payload as string) || "Login failed";
      });

    // --- Google Login ---
    builder
      .addCase(googleLoginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
        state.successMessage =
          action.payload.message || "Google login successful";
        state.error = null;
      })
      .addCase(googleLoginThunk.rejected, (state, action: any) => {
        state.isLoading = false;
        const payload = action.payload;
        if (payload?.cancelled) {
          state.error = null; // Do not display error on user cancel
        } else {
          state.error =
            (typeof payload === "string" ? payload : payload?.message) ||
            "Google login failed";
        }
      });

    // --- Register ---
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
        state.successMessage =
          action.payload.message || "Registration successful";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = (action.payload as string) || "Registration failed";
      });

    // --- Send OTP ---
    builder
      .addCase(sendOtpThunk.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(sendOtpThunk.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.otpMessage = action.payload.message || "OTP sent successfully";
        state.otpError = null;
      })
      .addCase(sendOtpThunk.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = (action.payload as string) || "Failed to send OTP";
      });

    // --- Resend OTP ---
    builder
      .addCase(resendOtpThunk.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(resendOtpThunk.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.otpMessage = action.payload.message || "New OTP sent successfully";
        state.otpError = null;
      })
      .addCase(resendOtpThunk.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = (action.payload as string) || "Failed to resend OTP";
      });

    // --- Verify OTP ---
    builder
      .addCase(verifyOtpThunk.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpVerified = true;
        state.otpMessage = action.payload.message || "OTP verified successfully";
        state.otpError = null;
        if (action.payload.token) {
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpVerified = false;
        state.otpError = (action.payload as string) || "Invalid OTP";
      });

    // --- Forgot Password ---
    builder
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.resetEmail = action.payload.email || null;
        state.otpMessage = action.payload.message || "Reset code sent";
        state.otpError = null;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = (action.payload as string) || "Failed to send reset code";
      });

    // --- Reset Password ---
    builder
      .addCase(resetPasswordThunk.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.resetPasswordSuccess = true;
        state.successMessage = action.payload.message || "Password reset successful";
        state.otpError = null;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = (action.payload as string) || "Failed to reset password";
      });

    // --- Fetch Current User ---
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // --- Upload Avatar ---
    builder
      .addCase(uploadAvatarThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadAvatarThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
        } else if (state.user && action.payload.avatarUrl) {
          state.user.avatar = action.payload.avatarUrl;
        }
      })
      .addCase(uploadAvatarThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to upload avatar";
      });

    // --- Update Profile ---
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
        }
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to update profile";
      });
  },
});

export const { logout, clearError, resetOtpFlow, setCredentials } =
  authSlice.actions;
export default authSlice.reducer;