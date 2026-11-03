import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeroBannerProps {
  logoSource?: any;
  bulletPoints?: string[];
  onPress?: () => void;
}

export default function HeroBanner({
  logoSource = require("../../../assets/images/logo.png"),
  bulletPoints = [
    "To save country from Pandamic bigger than Covid",
    "To make 1 NRS = 25 INR",
  ],
  onPress,
}: HeroBannerProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      style={styles.cardWrapper}
    >
      <LinearGradient
        colors={["#062449", "#082E5C", "#072044"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {/* Kalki Sena Drive Logo (aligned to flex-start like the bullet points) */}
        <View style={styles.logoContainer}>
          <Image
            source={logoSource}
            style={styles.logoImage}
            contentFit="contain"
            contentPosition="left center"
          />
        </View>

        {/* Mission / Bullet Points */}
        <View style={styles.pointsContainer}>
          {bulletPoints.map((point, index) => (
            <View key={index} style={styles.pointRow}>
              <Text style={styles.bulletSymbol}>•</Text>
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#103C75",
    shadowColor: "#041C3B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  gradientContainer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "flex-start",
  },
  logoContainer: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  logoImage: {
    width: 290,
    height: 70,
    alignSelf: "flex-start",
  },
  pointsContainer: {
    width: "100%",
    paddingTop: 4,
    alignItems: "flex-start",
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bulletSymbol: {
    color: "#E1EEFC",
    fontSize: 14,
    lineHeight: 19,
    marginRight: 6,
  },
  pointText: {
    color: "#E1EEFC",
    fontSize: 12.5,
    fontWeight: "500",
    lineHeight: 18,
    flex: 1,
  },
});
