import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface FailedPaymentProps {
  visible?: boolean;
  onClose?: () => void;
  onBackHome?: () => void;
  title?: string;
  errorMessage?: string;
}

export function PaymentFailedModal({
  visible = true,
  onClose,
  onBackHome,
  title = "Payment Failed!",
  errorMessage = "Check your internet connection or try again later.",
}: FailedPaymentProps) {
  const router = useRouter();

  const handleHome = () => {
    if (onBackHome) {
      onBackHome();
    } else {
      router.replace("/Home" as any);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.failedCard}>
          {/* Top Close 'X' */}
          <TouchableOpacity
            style={styles.modalCloseTopRight}
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={22} color="#7A8D9E" />
          </TouchableOpacity>

          {/* Centered Message Content */}
          <View style={styles.messageContent}>
            <Text style={styles.failedTitle}>{title}</Text>
            <Text style={styles.failedSubtitle}>{errorMessage}</Text>
          </View>

          {/* Back Home Button */}
          <TouchableOpacity
            style={styles.backHomeButton}
            activeOpacity={0.85}
            onPress={handleHome}
          >
            <Text style={styles.backHomeButtonText}>Back Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function FailedPaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Navy Background Gradient */}
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Dimmed Background Mock of Checkout Header */}
      <View style={[styles.mockHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.mockBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.mockBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.mockHeaderTitle}>Donate to doctors:</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.mockContent}>
        <View style={styles.mockDropdown}>
          <Text style={styles.mockDropdownText}>Select Payment Method</Text>
          <Ionicons name="chevron-down" size={18} color="#7A8D9E" />
        </View>
      </View>

      {/* Failed Payment Modal Dialog */}
      <PaymentFailedModal
        visible={true}
        onClose={() => router.back()}
        onBackHome={() => router.replace("/Home" as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
  },
  mockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    opacity: 0.6,
  },
  mockBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mockBackText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  mockHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "700",
  },
  mockContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    opacity: 0.5,
  },
  mockDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#071B34",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#102A4C",
  },
  mockDropdownText: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  // Modal Overlay & Card
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  failedCard: {
    width: "100%",
    maxWidth: 360,
    minHeight: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  modalCloseTopRight: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 6,
  },
  messageContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginTop: 40,
    marginBottom: 24,
  },
  failedTitle: {
    color: "#1E293B",
    fontSize: 18.5,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  failedSubtitle: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18.5,
  },
  backHomeButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    paddingVertical: 13,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  backHomeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
