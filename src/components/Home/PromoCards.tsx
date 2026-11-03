import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface PromoCardsProps {
  videoTitle?: string;
  videoThumbnail?: string;
  bookTitle?: string;
  onPlayPress?: () => void;
  onBuyBookPress?: () => void;
}

export default function PromoCards({
  videoTitle = "Message form MR.666",
  videoThumbnail = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
  bookTitle = "Buy book to support Gen Z free education",
  onPlayPress,
  onBuyBookPress,
}: PromoCardsProps) {
  return (
    <View style={styles.container}>
      {/* Left Card: Video Promo Card */}
      <TouchableOpacity
        style={styles.videoCard}
        activeOpacity={0.85}
        onPress={onPlayPress}
      >
        <Image
          source={{ uri: videoThumbnail }}
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
          <Text style={styles.videoTitleText}>{videoTitle}</Text>
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
        <Text style={styles.bookDescriptionText}>{bookTitle}</Text>

        {/* Action Pill Button */}
        <View style={styles.buyButtonPill}>
          <Text style={styles.buyButtonText}>Buy Book</Text>
          <Ionicons name="chevron-forward" size={11} color="#CADDF7" />
        </View>
      </TouchableOpacity>
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
  },
  videoBadge: {
    alignSelf: "flex-start",
  },
  videoTitleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.1,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  playButtonWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
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
});
