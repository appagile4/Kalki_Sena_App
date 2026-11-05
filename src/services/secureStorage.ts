import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// SecureStore Keys (Prefixed for app isolation)
const ACCESS_TOKEN_KEY = "kalki_sena_access_token";
const REFRESH_TOKEN_KEY = "kalki_sena_refresh_token";
const USER_DATA_KEY = "kalki_sena_user_profile";

// In-memory fallback cache for web environments or fallback
const memoryCache: Record<string, string> = {};

/**
 * Check if Expo SecureStore is available on current platform
 */
const isSecureStoreAvailable = async (): Promise<boolean> => {
  if (Platform.OS === "web") {
    return false;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

/**
 * Secure Storage Service
 */
export const secureStorage = {
  /**
   * Save Access Token securely
   */
  async saveAccessToken(token: string): Promise<void> {
    if (!token || typeof token !== "string") return;
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
      } else {
        memoryCache[ACCESS_TOKEN_KEY] = token;
      }
    } catch (error) {
      // Never log the raw token
      console.warn("[SecureStorage] Error saving access token");
      memoryCache[ACCESS_TOKEN_KEY] = token;
    }
  },

  /**
   * Retrieve Access Token securely
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      }
      return memoryCache[ACCESS_TOKEN_KEY] || null;
    } catch (error) {
      console.warn("[SecureStorage] Error reading access token");
      return memoryCache[ACCESS_TOKEN_KEY] || null;
    }
  },

  /**
   * Remove Access Token
   */
  async removeAccessToken(): Promise<void> {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      }
      delete memoryCache[ACCESS_TOKEN_KEY];
    } catch (error) {
      console.warn("[SecureStorage] Error removing access token");
      delete memoryCache[ACCESS_TOKEN_KEY];
    }
  },

  /**
   * Save Refresh Token securely (if supported)
   */
  async saveRefreshToken(token: string): Promise<void> {
    if (!token || typeof token !== "string") return;
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
      } else {
        memoryCache[REFRESH_TOKEN_KEY] = token;
      }
    } catch (error) {
      console.warn("[SecureStorage] Error saving refresh token");
      memoryCache[REFRESH_TOKEN_KEY] = token;
    }
  },

  /**
   * Retrieve Refresh Token securely
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      }
      return memoryCache[REFRESH_TOKEN_KEY] || null;
    } catch (error) {
      console.warn("[SecureStorage] Error reading refresh token");
      return memoryCache[REFRESH_TOKEN_KEY] || null;
    }
  },

  /**
   * Remove Refresh Token
   */
  async removeRefreshToken(): Promise<void> {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
      delete memoryCache[REFRESH_TOKEN_KEY];
    } catch (error) {
      console.warn("[SecureStorage] Error removing refresh token");
      delete memoryCache[REFRESH_TOKEN_KEY];
    }
  },

  /**
   * Save User Profile JSON securely
   */
  async saveUser(user: any): Promise<void> {
    if (!user) return;
    try {
      const userString = JSON.stringify(user);
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.setItemAsync(USER_DATA_KEY, userString, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
      } else {
        memoryCache[USER_DATA_KEY] = userString;
      }
    } catch (error) {
      console.warn("[SecureStorage] Error saving user profile");
    }
  },

  /**
   * Retrieve Cached User Profile
   */
  async getUser<T = any>(): Promise<T | null> {
    try {
      let raw: string | null = null;
      const available = await isSecureStoreAvailable();
      if (available) {
        raw = await SecureStore.getItemAsync(USER_DATA_KEY);
      } else {
        raw = memoryCache[USER_DATA_KEY] || null;
      }
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("[SecureStorage] Error reading user profile");
      return null;
    }
  },

  /**
   * Remove Cached User Profile
   */
  async removeUser(): Promise<void> {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.deleteItemAsync(USER_DATA_KEY);
      }
      delete memoryCache[USER_DATA_KEY];
    } catch (error) {
      console.warn("[SecureStorage] Error removing user profile");
      delete memoryCache[USER_DATA_KEY];
    }
  },

  /**
   * Clear all Authentication Storage (Tokens + User Cache)
   */
  async clearAuthStorage(): Promise<void> {
    await Promise.all([
      this.removeAccessToken(),
      this.removeRefreshToken(),
      this.removeUser(),
    ]);
  },
};
