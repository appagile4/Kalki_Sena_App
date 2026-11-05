import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import GoogleSignInButton from "../Auth/GoogleSignInButton";

interface LoginPromptCardProps {
  onLoginPress?: () => void;
  onSignupPress?: () => void;
}

export default function LoginPromptCard({
  onLoginPress,
  onSignupPress,
}: LoginPromptCardProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const handleLogin = () => {
    if (onLoginPress) {
      onLoginPress();
    } else {
      router.push("/Auth/login");
    }
  };

  const handleSignup = () => {
    if (onSignupPress) {
      onSignupPress();
    } else {
      router.push("/Auth/signup");
    }
  };

  if (dismissed) {
    // If dismissed, render a small interactive ribbon to reopen or sign in
    return (
      <View style={styles.minimizedContainer}>
        <TouchableOpacity
          style={styles.minimizedButton}
          activeOpacity={0.8}
          onPress={() => setDismissed(false)}
        >
          <Ionicons name="log-in-outline" size={18} color="#38BDF8" />
          <Text style={styles.minimizedText}>
            Browsing as Guest • Tap to Sign In
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#38BDF8" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0c2246", "#081832", "#051022"]}
        locations={[0, 0.5, 1]}
        style={styles.gradientCard}
      >
        {/* Top Header Row with Badge & Close Button */}
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.badgeText}>GUEST BROWSING</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.7}
            onPress={() => setDismissed(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color="#7A8D9E" />
          </TouchableOpacity>
        </View>

        {/* Title and Icon */}
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={20} color="#38BDF8" />
          </View>
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>Sign In to Kalki Sena Drive</Text>
            <Text style={styles.subtitle}>
              Unlock all ride bookings, community programs, emergency SOS, and driver registrations.
            </Text>
          </View>
        </View>

        {/* Primary Login Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleLogin}
        >
          <LinearGradient
            colors={["#2079F2", "#1354AC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>Log In with Email / Phone</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Google One-Tap Sign In */}
        <View style={styles.googleWrapper}>
          <GoogleSignInButton
            title="Continue with Google"
            onSuccess={() => router.replace("/Home" as any)}
            style={styles.googleBtnStyle}
          />
        </View>

        {/* Footer: Create account link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to Kalki Sena? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={handleSignup}>
            <Text style={styles.signupLink}>Create an Account</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 14,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#1E3A66",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  gradientCard: {
    padding: 16,
    borderRadius: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38BDF8",
    marginRight: 6,
  },
  badgeText: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(32, 121, 242, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subtitle: {
    color: "#8EA5C0",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  primaryButton: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    paddingHorizontal: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  googleWrapper: {
    marginBottom: 12,
  },
  googleBtnStyle: {
    height: 44,
    backgroundColor: "#061324",
    borderColor: "#183256",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  footerText: {
    color: "#7A8D9E",
    fontSize: 13,
  },
  signupLink: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "600",
  },
  minimizedContainer: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  minimizedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#071A34",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#1B3B68",
    gap: 8,
  },
  minimizedText: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "600",
  },
});
