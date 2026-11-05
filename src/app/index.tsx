import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { isInitialized, isAuthenticated } = useAuth();

  // Show dark splash loader while reading Expo SecureStore and validating session
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Case 1: Valid authenticated session exists -> Go straight to Home
  if (isAuthenticated) {
    return <Redirect href="/Home" />;
  }

  // Case 2 & 3: No token or invalid/expired session -> Go to Onboarding
  return <Redirect href="/Onboarding/onBoarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020b18",
  },
});
