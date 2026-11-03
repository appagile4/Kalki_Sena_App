import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FindJobScreen() {
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
          Find a Job.
        </Text>

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
          You can find job and employee both here this tab will be active after
          4-6 months.
        </Text>

        {/* Coming Soon Hanging Sign Graphic */}
        <View style={styles.hangingGraphicWrapper}>
          {!imageError ? (
            <Image
              source={require("../../../../assets/images/comingsoon.png")}
              style={styles.comingSoonImage}
              contentFit="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.typographyBox}>
              <Text style={styles.underConstructionText}>
                UNDER CONSTRUCTION
              </Text>
              <Text style={styles.comingText}>COMING</Text>
              <Text style={styles.soonText}>SOON</Text>
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
  hangingGraphicWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
    position: "relative",
  },
  stringsRow: {
    position: "absolute",
    top: 0,
    width: 140,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  hangingString: {
    width: 2,
    height: 70,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  comingSoonImage: {
    width: "100%",
    height: 280,
    maxWidth: 360,
  },
  typographyBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  underConstructionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7E9BB8",
    letterSpacing: 2,
    marginBottom: 8,
  },
  comingText: {
    fontSize: 44,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  soonText: {
    fontSize: 44,
    fontWeight: "900",
    color: "#2196F3",
    letterSpacing: 1.5,
    marginTop: -4,
  },
});
