import React from "react";
import { StyleSheet, View, TouchableOpacity, Linking, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface SocialLinksProps {
  onWhatsAppPress?: () => void;
  onInstagramPress?: () => void;
  onSosPress?: () => void;
  onFacebookPress?: () => void;
  onYouTubePress?: () => void;
}

export default function SocialLinks({
  onWhatsAppPress,
  onInstagramPress,
  onSosPress,
  onFacebookPress,
  onYouTubePress,
}: SocialLinksProps) {
  const router = useRouter();

  const handleWhatsApp = () => {
    if (onWhatsAppPress) {
      onWhatsAppPress();
    } else {
      Linking.openURL("https://whatsapp.com").catch(() => {});
    }
  };

  const handleInstagram = () => {
    if (onInstagramPress) {
      onInstagramPress();
    } else {
      Linking.openURL("https://instagram.com").catch(() => {});
    }
  };

  const handleSos = () => {
    if (onSosPress) {
      onSosPress();
    } else {
      router.push("/Home/emergencySOS" as any);
    }
  };

  const handleFacebook = () => {
    if (onFacebookPress) {
      onFacebookPress();
    } else {
      Linking.openURL("https://facebook.com").catch(() => {});
    }
  };

  const handleYouTube = () => {
    if (onYouTubePress) {
      onYouTubePress();
    } else {
      Linking.openURL("https://youtube.com").catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. WhatsApp Button */}
      <TouchableOpacity
        style={[styles.socialButton, styles.whatsappButton]}
        activeOpacity={0.8}
        onPress={handleWhatsApp}
      >
        <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 2. Instagram Button (Gradient) */}
      <TouchableOpacity
        style={styles.socialButton}
        activeOpacity={0.8}
        onPress={handleInstagram}
      >
        <LinearGradient
          colors={["#833ab4", "#fd1d1d", "#fcb045"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          <Ionicons name="logo-instagram" size={26} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* 3. SOS Button (Center) */}
      <TouchableOpacity
        style={[styles.socialButton, styles.sosButton]}
        activeOpacity={0.85}
        onPress={handleSos}
      >
        <View style={styles.sosInnerRing}>
          <Text style={styles.sosText}>SOS</Text>
        </View>
      </TouchableOpacity>

      {/* 4. Facebook Button */}
      <TouchableOpacity
        style={[styles.socialButton, styles.facebookButton]}
        activeOpacity={0.8}
        onPress={handleFacebook}
      >
        <Ionicons name="logo-facebook" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 5. YouTube Button */}
      <TouchableOpacity
        style={[styles.socialButton, styles.youtubeButton]}
        activeOpacity={0.8}
        onPress={handleYouTube}
      >
        <Ionicons name="logo-youtube" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginVertical: 18,
    paddingHorizontal: 14,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  gradientFill: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  sosButton: {
    backgroundColor: "#E5252A",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#E5252A",
  },
  sosInnerRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  facebookButton: {
    backgroundColor: "#1877F2",
    borderRadius: 24,
  },
  youtubeButton: {
    backgroundColor: "#FF0000",
  },
});
