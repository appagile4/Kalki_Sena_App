import React from "react";
import { StyleSheet, View, TouchableOpacity, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface SocialLinksProps {
  onWhatsAppPress?: () => void;
  onInstagramPress?: () => void;
  onFacebookPress?: () => void;
  onYouTubePress?: () => void;
}

export default function SocialLinks({
  onWhatsAppPress,
  onInstagramPress,
  onFacebookPress,
  onYouTubePress,
}: SocialLinksProps) {
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
        <Ionicons name="logo-whatsapp" size={30} color="#FFFFFF" />
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
          <Ionicons name="logo-instagram" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* 3. Facebook Button */}
      <TouchableOpacity
        style={[styles.socialButton, styles.facebookButton]}
        activeOpacity={0.8}
        onPress={handleFacebook}
      >
        <Ionicons name="logo-facebook" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 4. YouTube Button */}
      <TouchableOpacity
        style={[styles.socialButton, styles.youtubeButton]}
        activeOpacity={0.8}
        onPress={handleYouTube}
      >
        <Ionicons name="logo-youtube" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginVertical: 18,
    paddingHorizontal: 16,
  },
  socialButton: {
    width: 52,
    height: 52,
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
  facebookButton: {
    backgroundColor: "#1877F2",
    borderRadius: 26,
  },
  youtubeButton: {
    backgroundColor: "#FF0000",
  },
});
