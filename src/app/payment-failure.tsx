import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentFailureRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const message =
    (params.message as string) ||
    "Payment was cancelled by the user or could not be completed.";

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.card}>
        <View style={styles.iconBadge}>
          <Ionicons name="close" size={40} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Payment Not Completed</Text>
        <Text style={styles.subtitle}>{message}</Text>

        <TouchableOpacity
          style={[styles.btn, styles.btnBlue]}
          activeOpacity={0.85}
          onPress={() => router.replace("/Home/bookdetails" as any)}
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          activeOpacity={0.85}
          onPress={() => router.replace("/Home" as any)}
        >
          <Text style={[styles.btnText, { color: "#8EA4BE" }]}>
            Return Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#081E38",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#183359",
    padding: 24,
    alignItems: "center",
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#8EA4BE",
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  btn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  btnBlue: {
    backgroundColor: "#3087E5",
  },
  btnGhost: {
    backgroundColor: "transparent",
    marginBottom: 0,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
