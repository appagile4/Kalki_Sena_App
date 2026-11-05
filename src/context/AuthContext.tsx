import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  initializeAuth as initAuthThunk,
  loginUser,
  registerUser,
  logoutUser as logoutThunk,
  User,
} from "../redux/slices/authSlice";
import { LoginPayload, SignupPayload, ApiResponse } from "../services/api";

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (payload: LoginPayload) => Promise<ApiResponse>;
  signup: (payload: SignupPayload) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, isInitialized } =
    useAppSelector((state) => state.auth);

  const triggerInit = useCallback(async () => {
    try {
      await dispatch(initAuthThunk()).unwrap();
    } catch {
      // Ignored - state updated in reducer
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) {
      triggerInit();
    }
  }, [isInitialized, triggerInit]);

  const login = async (payload: LoginPayload): Promise<ApiResponse> => {
    return await dispatch(loginUser(payload)).unwrap();
  };

  const signup = async (payload: SignupPayload): Promise<ApiResponse> => {
    return await dispatch(registerUser(payload)).unwrap();
  };

  const logout = async (): Promise<void> => {
    await dispatch(logoutThunk()).unwrap();
  };

  const initializeAuth = async (): Promise<void> => {
    await triggerInit();
  };

  const value: AuthContextType = {
    user,
    accessToken: token,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    signup,
    logout,
    initializeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
