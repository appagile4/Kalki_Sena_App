import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export default function CarServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Navy Background Gradient */}
      <LinearGradient
        colors={["#020b18", "#03152c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Cab Service
        </Text>

        {/* Right Spacer to center header title */}
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Description Text */}
        <Text style={styles.descriptionText}>
          People can come book a car or cab service from here. They can buy here
          as well. This option will be active on 1st March
        </Text>

        {/* Launching Banner Graphic */}
        <View style={styles.launchingGraphicWrapper}>
          {!imageError ? (
            <Image
              source={require("../../../assets/images/comingsoon.png")}
              style={styles.comingSoonImage}
              contentFit="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.typographyFallback}>
              <Text style={styles.launchingText}>LAUNCHING</Text>
              <View style={styles.onDateRow}>
                <Text style={styles.onText}>ON </Text>
                <Text style={styles.dateText}>1ST MARCH</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 6,
    minWidth: 70,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    letterSpacing: 0.2,
  },
  headerRightSpacer: {
    minWidth: 70,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexGrow: 1,
  },
  descriptionText: {
    color: "#CADDF7",
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "400",
    marginBottom: 40,
  },
  launchingGraphicWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
  },
  comingSoonImage: {
    width: "100%",
    height: 300,
    maxWidth: 380,
  },
  typographyFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  launchingText: {
    fontSize: 44,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  onDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },
  onText: {
    fontSize: 40,
    fontWeight: "900",
    color: "#FF9800",
    letterSpacing: 1.2,
  },
  dateText: {
    fontSize: 40,
    fontWeight: "900",
    color: "#2196F3",
    letterSpacing: 1.2,
  },
});
