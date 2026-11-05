import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { AuthProvider, useAuth } from "../context/AuthContext";

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
