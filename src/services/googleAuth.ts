import { Platform } from "react-native";
import type { SignInResponse } from "@react-native-google-signin/google-signin";

// Google OAuth Client IDs
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "284669757325-8i1iivlfkge4s3itcmu4b27qr5iu9b10.apps.googleusercontent.com";

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
      scopes: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/user.birthday.read",
        "https://www.googleapis.com/auth/user.gender.read",
      ],
    });
    isConfigured = true;
  } catch (error) {
    console.warn("[GoogleAuth] Failed to configure Google Sign-In:", error);
  }
};

export interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  accessToken?: string;
  dob?: string;
  gender?: string;
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
        let accessToken: string | undefined;

        // Fetch tokens (idToken + accessToken)
        try {
          const tokens = await GoogleSignin.getTokens();
          if (tokens) {
            if (!idToken) idToken = tokens.idToken;
            accessToken = tokens.accessToken;
          }
        } catch (tokenErr) {
          console.warn("[GoogleAuth] getTokens() warning:", tokenErr);
        }

        if (!idToken) {
          return {
            success: false,
            error: "Failed to obtain Google identity token. Please try again.",
          };
        }

        let dob: string | undefined;
        let gender: string | undefined;

        // If accessToken is available, query People API for birthday & gender
        if (accessToken) {
          try {
            const peopleRes = await fetch(
              "https://people.googleapis.com/v1/people/me?personFields=birthdays,genders",
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "application/json",
                },
              }
            );

            if (peopleRes.ok) {
              const peopleData = await peopleRes.json();

              // Parse Birthday (DD/MM/YYYY)
              if (peopleData.birthdays && Array.isArray(peopleData.birthdays)) {
                const bday =
                  peopleData.birthdays.find(
                    (b: any) => b.date && b.metadata?.primary
                  ) ||
                  peopleData.birthdays.find((b: any) => b.date) ||
                  peopleData.birthdays[0];

                if (bday?.date) {
                  const { day, month, year } = bday.date;
                  if (day && month) {
                    const dd = String(day).padStart(2, "0");
                    const mm = String(month).padStart(2, "0");
                    dob = year ? `${dd}/${mm}/${year}` : `${dd}/${mm}`;
                  }
                }
              }

              // Parse Gender (Male / Female / Other)
              if (peopleData.genders && Array.isArray(peopleData.genders)) {
                const gObj =
                  peopleData.genders.find(
                    (g: any) => g.value && g.metadata?.primary
                  ) || peopleData.genders[0];

                const rawVal = (
                  gObj?.value ||
                  gObj?.formattedValue ||
                  ""
                ).toLowerCase();

                if (rawVal.includes("male") && !rawVal.includes("female")) {
                  gender = "Male";
                } else if (rawVal.includes("female")) {
                  gender = "Female";
                } else if (rawVal) {
                  gender = "Other";
                }
              }
            }
          } catch (peopleErr) {
            console.warn(
              "[GoogleAuth] Google People API fetch non-fatal error:",
              peopleErr
            );
          }
        }

        return {
          success: true,
          idToken,
          accessToken,
          dob,
          gender,
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

      if (
        error.code === 10 ||
        error.code === "10" ||
        error.message?.includes("DEVELOPER_ERROR")
      ) {
        return {
          success: false,
          error:
            "DEVELOPER_ERROR (code 10):\n" +
            "1. SHA-1 Mismatch: In Google Cloud Console (Credentials > Android Client), add your local debug SHA-1: 1F:9F:49:4B:95:38:DD:6A:EA:F7:A4:B9:CF:16:AA:E6:89:93:37:C9 for package com.agileapp977.Kalki_Sena_Drive.\n" +
            "2. Web Client ID: Make sure webClientId is an OAuth client of type 'Web application' (not Android client).",
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
