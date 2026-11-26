import { Platform } from "react-native";
import type * as NotificationsType from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { API_BASE_URL, getAuthHeaders, ApiResponse } from "./api";
import { secureStorage } from "./secureStorage";

const PUSH_TOKEN_STORAGE_KEY = "kalki_expo_push_token";

let cachedNotifications: typeof import("expo-notifications") | null = null;
let isNativeModuleChecked = false;
let isNativeModuleAvailable = false;

/**
 * Safely resolve expo-notifications module at runtime without crashing top-level bundle
 * evaluation if ExpoPushTokenManager is missing (e.g. running inside standard Expo Go).
 */
export function getNotificationsModule(): typeof import("expo-notifications") | null {
  if (isNativeModuleChecked) {
    return isNativeModuleAvailable ? cachedNotifications : null;
  }

  isNativeModuleChecked = true;
  try {
    const mod = require("expo-notifications");
    if (mod && typeof mod.getExpoPushTokenAsync === "function") {
      cachedNotifications = mod;
      isNativeModuleAvailable = true;

      // Configure how notifications are displayed when app is in foreground
      try {
        mod.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
      } catch (handlerErr: any) {
        console.warn("[PushNotification] setNotificationHandler error:", handlerErr?.message);
      }

      return mod;
    }
  } catch (err: any) {
    console.warn(
      "[PushNotification] Native module 'ExpoPushTokenManager' is not linked in current runtime (e.g. Expo Go).\n" +
      "Push notifications will be active in EAS / native development builds."
    );
    cachedNotifications = null;
    isNativeModuleAvailable = false;
  }

  return null;
}

/**
 * Request notification permissions and register Expo push token with backend
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    const Notifications = getNotificationsModule();
    if (!Notifications) {
      console.log("[PushNotification] Skipping push registration: native module unavailable in this environment.");
      return null;
    }

    // 1. Android Notification Channels configuration
    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("default", {
          name: "General Notifications",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0266B3",
        });

        await Notifications.setNotificationChannelAsync("orders", {
          name: "Order & Ride Updates",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: "#0266B3",
        });
      } catch (channelErr: any) {
        console.warn("[PushNotification] setNotificationChannelAsync warning:", channelErr?.message);
      }
    }

    // 2. Physical device check (Simulators cannot receive remote APNs/FCM pushes)
    if (!Device.isDevice) {
      console.log("[PushNotification] Running on simulator/emulator - push token simulated for testing");
      return null;
    }

    // 3. Permission checks
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[PushNotification] Notification permissions were not granted by user.");
      return null;
    }

    // 4. Retrieve EAS Project ID
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId ||
      "c47df24a-44e6-4729-8d12-ba63144370fb";

    const pushTokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    token = pushTokenData?.data || null;

    if (token) {
      // Store token locally
      await secureStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);

      // Register token with backend server
      await syncTokenWithBackend(token);
    }
  } catch (error: any) {
    console.error("[PushNotification] Error acquiring push token:", error?.message || error);
  }

  return token;
}

/**
 * Sync active Expo Push Token with Backend API
 */
export async function syncTokenWithBackend(token: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    // Only register if user is logged in
    if (!headers.Authorization) {
      console.log("[PushNotification] User not authenticated yet, skipping token sync.");
      return false;
    }

    const payload = {
      token,
      platform: Platform.OS,
      deviceId: Device.osBuildId || Device.modelId || "",
      deviceName: Device.modelName || `${Device.brand || ""} ${Device.modelName || ""}`.trim(),
      appVersion: Constants.expoConfig?.version || "1.0.0",
    };

    const response = await fetch(`${API_BASE_URL}/notifications/register-token`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("[PushNotification] Token successfully synced with backend.");
      return true;
    } else {
      if (response.status === 404) {
        console.log(
          "[PushNotification] Endpoint /api/notifications/register-token is not deployed yet on the server. Token saved locally."
        );
      } else {
        console.warn("[PushNotification] Backend token registration error:", data.message);
      }
      return false;
    }
  } catch (err: any) {
    console.error("[PushNotification] syncTokenWithBackend failed:", err?.message || err);
    return false;
  }
}

/**
 * Deregister token when user logs out
 */
export async function deregisterDeviceToken(): Promise<void> {
  try {
    const token = await secureStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (!token) return;

    const headers = await getAuthHeaders();
    if (headers.Authorization) {
      await fetch(`${API_BASE_URL}/notifications/deregister-token`, {
        method: "POST",
        headers,
        body: JSON.stringify({ token }),
      });
    }

    await secureStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
  } catch (err: any) {
    console.error("[PushNotification] deregisterDeviceToken error:", err?.message || err);
  }
}

/**
 * Setup push notification foreground and click handlers
 */
export function setupPushNotificationListeners(
  onNotificationReceived?: (notification: NotificationsType.Notification) => void,
  onNotificationResponse?: (response: NotificationsType.NotificationResponse) => void
) {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return () => {};
  }

  try {
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[PushNotification] Notification received in foreground:", notification.request.content.title);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[PushNotification] User tapped notification:", response.notification.request.content.data);
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    });

    return () => {
      try {
        receivedSubscription.remove();
        responseSubscription.remove();
      } catch {
        // Ignored
      }
    };
  } catch (listenerErr: any) {
    console.warn("[PushNotification] setupPushNotificationListeners warning:", listenerErr?.message);
    return () => {};
  }
}

/**
 * In-App Notification Center API Calls
 */
export const notificationCenterApi = {
  // Fetch user's in-app notifications
  fetchMyNotifications: async (page = 1, limit = 30): Promise<{
    notifications: any[];
    unreadCount: number;
    total: number;
  }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/notifications/my-notifications?page=${page}&limit=${limit}`,
      { headers }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch notifications");
    }
    return {
      notifications: result.data || [],
      unreadCount: result.unreadCount || 0,
      total: result.pagination?.total || 0,
    };
  },

  // Mark single notification as read
  markAsRead: async (id: string): Promise<number> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers,
    });
    const result = await response.json();
    return result.unreadCount || 0;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: "PATCH",
      headers,
    });
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<number> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
      headers,
    });
    const result = await response.json();
    return result.unreadCount || 0;
  },
};
