import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { AuthProvider, useAuth } from "../context/AuthContext";
import {
  registerForPushNotificationsAsync,
  setupPushNotificationListeners,
} from "../services/notificationService";

function RootNavigationLayout() {
  const { isInitialized, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until secure storage initialization and session validation finish
    if (!isInitialized) return;

    const rootSegment = segments[0];
    const subSegment = segments[1];
    const inAuthGroup = rootSegment === "Auth";
    const inOnboardingGroup = rootSegment === "Onboarding";

    if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
      // User is authenticated but navigating to login, signup, or onboarding -> redirect to Home
      router.replace("/Home");
    } else if (!isAuthenticated && rootSegment === "Home" && subSegment === "profile") {
      // Profile screen requires authentication
      router.replace("/Auth/login");
    }
  }, [isInitialized, isAuthenticated, segments, router]);

  // Push notifications registration & listener lifecycle
  useEffect(() => {
    if (!isAuthenticated) return;

    // Register Expo push token when user is logged in
    registerForPushNotificationsAsync().catch((err) => {
      console.warn("[RootLayout] Push registration error:", err.message);
    });

    // Handle incoming and tapped push notifications
    const unsubscribe = setupPushNotificationListeners(
      (notification) => {
        console.log("[RootLayout] Received foreground notification:", notification.request.content.title);
      },
      (response) => {
        const data = response?.notification?.request?.content?.data;
        if (!data) return;

        if (data.screen === "OrderDetails" || data.orderId) {
          router.push("/Home/mybook" as any);
        } else if (data.screen === "notifications") {
          router.push("/Home/notifications" as any);
        } else if (data.screen) {
          try {
            router.push(data.screen as any);
          } catch {
            router.push("/Home" as any);
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, router]);

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#020b18" },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <RootNavigationLayout />
      </AuthProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020b18",
  },
});
