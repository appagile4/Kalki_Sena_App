import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { apiService } from "../../services/api";

export interface PromoCardsProps {
  videoTitle?: string;
  videoThumbnail?: string;
  videoUrl?: string;
  bookTitle?: string;
  onPlayPress?: () => void;
  onBuyBookPress?: () => void;
}

export default function PromoCards({
  videoTitle = "Message form MR.666",
  videoThumbnail = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  bookTitle = "Buy book to support Gen Z free education",
  onPlayPress,
  onBuyBookPress,
}: PromoCardsProps) {
  const insets = useSafeAreaInsets();
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Real-time backend video & book sync
  const [backendPromo, setBackendPromo] = useState<any>(null);
  const [backendBookTitle, setBackendBookTitle] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const fetchPromoData = async () => {
      try {
        const res = await apiService.getBookDetails();
        if (res && res.success && res.data && res.data.length > 0 && isMounted) {
          const book = res.data[0];
          if (book.promoVideo) {
            setBackendPromo(book.promoVideo);
          }
          if (book.title) {
            setBackendBookTitle(book.title);
          }
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchPromoData();
    const interval = setInterval(fetchPromoData, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Effective values prioritized from backend
  const effectiveTitle =
    backendPromo?.title || videoTitle || "Message form MR.666";
  const effectiveThumbnail =
    backendPromo?.thumbnailUrl ||
    videoThumbnail ||
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80";
  const effectiveVideoUrl =
    backendPromo?.videoUrl ||
    videoUrl ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const effectiveBookTitle =
    bookTitle ||
    backendBookTitle ||
    "Buy book to support Gen Z free education";

  const handleVideoCardPress = async () => {
    if (onPlayPress) {
      onPlayPress();
    }

    if (Platform.OS === "web") {
      setIsFullScreen(true);
      return;
    }

    // Native player launch via system browser controller (zero unlinked native dependency)
    try {
      await WebBrowser.openBrowserAsync(effectiveVideoUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        toolbarColor: "#020B18",
        controlsColor: "#00E5FF",
        showTitle: true,
      });
    } catch {
      Linking.openURL(effectiveVideoUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Card: Video Promo Card */}
      <TouchableOpacity
        style={styles.videoCard}
        activeOpacity={0.85}
        onPress={handleVideoCardPress}
      >
        <Image
          source={{ uri: effectiveThumbnail }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />

        {/* Dark Vignette Overlay */}
        <LinearGradient
          colors={["rgba(2, 11, 24, 0.75)", "rgba(2, 11, 24, 0.45)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Text Title */}
        <View style={styles.videoBadge}>
          <Text style={styles.videoTitleText} numberOfLines={2}>
            {effectiveTitle}
          </Text>
        </View>

        {/* Center Circular Play Button */}
        <View style={styles.playButtonWrapper}>
          <View style={styles.playButtonCircle}>
            <Ionicons
              name="play"
              size={22}
              color="#FFFFFF"
              style={{ marginLeft: 3 }}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Right Card: Buy Book Card */}
      <TouchableOpacity
        style={styles.bookCard}
        activeOpacity={0.85}
        onPress={onBuyBookPress}
      >
        <LinearGradient
          colors={["#052044", "#031731"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Book Icon */}
        <View style={styles.bookIconContainer}>
          <Ionicons name="book-outline" size={28} color="#7BB1F4" />
        </View>

        {/* Promotional Copy */}
        <Text style={styles.bookDescriptionText} numberOfLines={3}>
          {effectiveBookTitle}
        </Text>

        {/* Action Pill Button */}
        <View style={styles.buyButtonPill}>
          <Text style={styles.buyButtonText}>Buy Book</Text>
          <Ionicons name="chevron-forward" size={11} color="#CADDF7" />
        </View>
      </TouchableOpacity>

      {/* Full-Screen Video Modal (for Web & Desktop previews) */}
      {Platform.OS === "web" && (
        <Modal
          visible={isFullScreen}
          animationType="fade"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsFullScreen(false)}
          statusBarTranslucent
        >
          <View style={styles.fullScreenContainer}>
            <StatusBar style="light" />

            {/* Modal Header Bar */}
            <View
              style={[
                styles.modalHeader,
                { paddingTop: Math.max(insets.top, 16) + 8 },
              ]}
            >
              <View style={styles.modalTitleContainer}>
                <View style={styles.liveBroadcastBadge}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.liveBroadcastText}>
                    OFFICIAL BROADCAST
                  </Text>
                </View>
                <Text style={styles.modalVideoTitle} numberOfLines={1}>
                  {effectiveTitle}
                </Text>
                <Text style={styles.modalVideoSubtitle} numberOfLines={1}>
                  Kalki Sena Drive • Jay Sah (MR. 666)
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                activeOpacity={0.8}
                onPress={() => setIsFullScreen(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Full Screen Video Display */}
            <View style={styles.videoPlayerWrapper}>
              <video
                src={effectiveVideoUrl}
                controls
                autoPlay
                poster={effectiveThumbnail}
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  backgroundColor: "#000000",
                }}
              />
            </View>

            {/* Modal Bottom CTA Footer */}
            <View
              style={[
                styles.modalFooter,
                { paddingBottom: Math.max(insets.bottom, 16) + 10 },
              ]}
            >
              <TouchableOpacity
                style={styles.modalBuyBookButton}
                activeOpacity={0.85}
                onPress={() => {
                  setIsFullScreen(false);
                  if (onBuyBookPress) {
                    onBuyBookPress();
                  }
                }}
              >
                <Ionicons name="book" size={18} color="#FFFFFF" />
                <Text style={styles.modalBuyBookButtonText}>
                  Buy Official Book & Support Free Education
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 10,
    height: 130,
  },
  videoCard: {
    flex: 1.7,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#0E3466",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#03142B",
    position: "relative",
  },
  videoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(3, 20, 43, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(14, 52, 102, 0.8)",
    maxWidth: "85%",
  },
  videoTitleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  playButtonWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  bookCard: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#0E3466",
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#041B38",
    position: "relative",
  },
  bookIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  bookDescriptionText: {
    color: "#C2D9F2",
    fontSize: 10.5,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 2,
  },
  buyButtonPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#082B55",
    borderWidth: 1,
    borderColor: "#154278",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 3,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },

  // Modal Full Screen Styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "space-between",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 10,
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  liveBroadcastBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(48, 135, 229, 0.2)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.35)",
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00E5FF",
  },
  liveBroadcastText: {
    color: "#00E5FF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  modalVideoTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  modalVideoSubtitle: {
    color: "#7A8D9E",
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  videoPlayerWrapper: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 10,
  },
  modalBuyBookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3087E5",
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#3087E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  modalBuyBookButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
