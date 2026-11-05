import { Platform } from "react-native";
import type { SignInResponse } from "@react-native-google-signin/google-signin";

// Google OAuth Client IDs
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "284669757325-c1vm3h23si9e9hk7ued21o3020tbtt8p.apps.googleusercontent.com";

export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
  "284669757325-vr2oqodqkpk2tpb0u46nvb09plbriuq5.apps.googleusercontent.com";

let isConfigured = false;
let cachedGoogleSignin: any = null;
let cachedStatusCodes: any = null;

/**
 * Check safely whether native RNGoogleSignin is registered in current native binary.
 * In Expo Go or unlinked builds, this returns false and prevents Invariant Violation crashes.
 */
export const isGoogleSigninNativeAvailable = (): boolean => {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return false;
  try {
    const { NativeModules, TurboModuleRegistry } = require("react-native");
    if (NativeModules && NativeModules.RNGoogleSignin) return true;
    if (TurboModuleRegistry && typeof TurboModuleRegistry.get === "function") {
      return !!TurboModuleRegistry.get("RNGoogleSignin");
    }
  } catch {
    return false;
  }
  return false;
};

/**
 * Lazily resolve the native GoogleSignin module
 */
const getGoogleSigninModule = () => {
  if (cachedGoogleSignin) return cachedGoogleSignin;
  if (!isGoogleSigninNativeAvailable()) return null;

  try {
    // Dynamically require so module evaluation only runs if native binary has RNGoogleSignin
    const mod = require("@react-native-google-signin/google-signin");
    cachedGoogleSignin = mod.GoogleSignin;
    cachedStatusCodes = mod.statusCodes;
    return cachedGoogleSignin;
  } catch (error) {
    console.warn("[GoogleAuth] Native module failed to load:", error);
    return null;
  }
};

/**
 * Configure Google Sign-In SDK
 */
export const configureGoogleSignIn = () => {
  if (isConfigured) return;

  const GoogleSignin = getGoogleSigninModule();
  if (!GoogleSignin) return;

  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: Platform.OS === "ios" ? GOOGLE_IOS_CLIENT_ID : undefined,
      offlineAccess: false,
      scopes: ["profile", "email"],
    });
    isConfigured = true;
  } catch (error) {
    console.warn("[GoogleAuth] Failed to configure Google Sign-In:", error);
  }
};

export interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  cancelled?: boolean;
  error?: string;
}

export const googleAuthService = {
  /**
   * Check if native Google Sign-In is supported in current binary
   */
  isAvailable(): boolean {
    return isGoogleSigninNativeAvailable();
  },

  /**
   * Initialize configuration
   */
  init() {
    configureGoogleSignIn();
  },

  /**
   * Trigger Google Sign-In flow and retrieve ID token
   */
  async signIn(): Promise<GoogleAuthResult> {
    const GoogleSignin = getGoogleSigninModule();

    if (!GoogleSignin) {
      return {
        success: false,
        error:
          "Google Sign-In is only supported in a native development build (npx expo run:android / run:ios). It is not available in standard Expo Go.",
      };
    }

    try {
      configureGoogleSignIn();

      // Check Play Services on Android
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const response: SignInResponse = await GoogleSignin.signIn();

      if (response.type === "cancelled") {
        return { success: false, cancelled: true };
      }

      if (response.type === "success" && response.data) {
        let idToken = response.data.idToken;

        // Fallback: If idToken is missing in response, attempt getTokens()
        if (!idToken) {
          const tokens = await GoogleSignin.getTokens();
          idToken = tokens.idToken;
        }

        if (!idToken) {
          return {
            success: false,
            error: "Failed to obtain Google identity token. Please try again.",
          };
        }

        return {
          success: true,
          idToken,
        };
      }

      return {
        success: false,
        error: "Google Sign-In did not complete successfully.",
      };
    } catch (error: any) {
      const statusCodes = cachedStatusCodes;
      if (
        (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) ||
        error.message?.includes("cancelled") ||
        error.message?.includes("CANCELED")
      ) {
        return { success: false, cancelled: true };
      }

      if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        return {
          success: false,
          error: "Google Sign-In is already in progress. Please wait.",
        };
      }

      if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: "Google Play Services is not available or needs to be updated.",
        };
      }

      return {
        success: false,
        error:
          error.message ||
          "An unexpected error occurred during Google Sign-In.",
      };
    }
  },

  /**
   * Sign out locally from Google SDK
   */
  async signOut(): Promise<void> {
    try {
      const GoogleSignin = getGoogleSigninModule();
      if (GoogleSignin && typeof GoogleSignin.hasPreviousSignIn === "function") {
        if (GoogleSignin.hasPreviousSignIn()) {
          await GoogleSignin.signOut();
        }
      }
    } catch {
      // Ignore Google SDK sign out errors
    }
  },

  /**
   * Check if user is currently signed in via Google SDK
   */
  isSignedIn(): boolean {
    try {
      const GoogleSignin = getGoogleSigninModule();
      if (GoogleSignin && typeof GoogleSignin.hasPreviousSignIn === "function") {
        return GoogleSignin.hasPreviousSignIn();
      }
      return false;
    } catch {
      return false;
    }
  },
};
