import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Gmail Vector Icon with official branding colors
const GmailIcon = ({ size = 20 }: { size?: number }) => {
  const height = size * 0.77;
  return (
    <Svg width={size} height={height} viewBox="0 0 26 20" fill="none">
      <Path
        d="M1.5 19H5.5V9.5L0 5.375V17.5C0 18.325 0.675 19 1.5 19Z"
        fill="#4285F4"
      />
      <Path
        d="M20.5 19H24.5C25.325 19 26 18.325 26 17.5V5.375L20.5 9.5V19Z"
        fill="#34A853"
      />
      <Path
        d="M20.5 2.5V9.5L26 5.375V3.5C26 1.625 23.85 0.55 22.325 1.65L20.5 2.5Z"
        fill="#FBBC04"
      />
      <Path
        d="M5.5 9.5V2.5L13 8.125L20.5 2.5V9.5L13 15.125L5.5 9.5Z"
        fill="#EA4335"
      />
      <Path
        d="M0 3.5V5.375L5.5 9.5V2.5L3.675 1.65C2.15 0.55 0 1.625 0 3.5Z"
        fill="#C5221F"
      />
    </Svg>
  );
};

export default function OnBoardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Responsive logo dimensions
  const logoWidth = Math.min(SCREEN_WIDTH * 0.88, 360);
  // Original kalkilogo.png aspect ratio is ~2.63 (2048 x 779)
  const logoHeight = logoWidth / 2.63;

  // Final top position of logo inside safe area
  const finalLogoTop =
    (insets.top || (Platform.OS === "android" ? 36 : 48)) + 12;

  // Distance needed to shift from natural top position to exact vertical center
  const screenCenterY = SCREEN_HEIGHT / 2;
  const finalLogoCenterY = finalLogoTop + logoHeight / 2;
  const centerShiftY = screenCenterY - finalLogoCenterY;

  // Animation values
  const logoTranslateX = useRef(
    new Animated.Value(-SCREEN_WIDTH * 1.1),
  ).current;
  const logoTranslateY = useRef(new Animated.Value(centerShiftY)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const contentTranslateY = useRef(new Animated.Value(70)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const runAnimation = () => {
    // 1. Reset values: logo starts fully off-screen on the left at vertical center
    logoTranslateX.setValue(-SCREEN_WIDTH * 1.1);
    logoTranslateY.setValue(centerShiftY);
    logoOpacity.setValue(0);
    contentTranslateY.setValue(70);
    contentOpacity.setValue(0);

    Animated.sequence([
      // STEP 1: Logo glides smoothly in from LEFT to the middle of the screen
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 180, // Quick fade-in so user visibly watches it glide across from the left
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateX, {
          toValue: 0,
          duration: 950,
          easing: Easing.bezier(0.12, 1, 0.25, 1), // smooth cinematic deceleration
          useNativeDriver: true,
        }),
      ]),

      // STEP 2: Hold in the dead center (matches Splash Screen Image 1)
      Animated.delay(500),

      // STEP 3: Logo glides smoothly UP, content smoothly rises from BOTTOM
      Animated.parallel([
        Animated.timing(logoTranslateY, {
          toValue: 0, // Glides up to finalLogoTop
          duration: 850,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // smooth cubic easeInOut
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 800,
          delay: 60,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 750,
          delay: 60,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    // Trigger animation when layout is ready
    const timer = setTimeout(() => {
      runAnimation();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogIn = () => {
    router.push("/Auth/login");
  };

  const handleCreateAccount = () => {
    router.push("/Auth/signup");
  };

  const handleGmailSignUp = () => {
    router.push("/Auth/signup");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Deep Navy Blue Gradient Background */}
      <LinearGradient
        colors={["#020b18", "#041938", "#062248", "#021226"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Kalki Sena Drive Logo (Absolute layer for precise positioning) */}
      <Animated.View
        style={[
          styles.logoAbsoluteContainer,
          {
            top: finalLogoTop,
            left: (SCREEN_WIDTH - logoWidth) / 2,
            width: logoWidth,
            height: logoHeight,
            opacity: logoOpacity,
            transform: [
              { translateX: logoTranslateX },
              { translateY: logoTranslateY },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Image
          source={require("@/assets/images/kalkilogo.png")}
          style={styles.logoImage}
          contentFit="contain"
          priority="high"
        />
      </Animated.View>

      {/* Animated Onboarding Content (Rises smoothly from bottom) */}
      <Animated.View
        style={[
          styles.contentScrollViewWrapper,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: finalLogoTop + logoHeight + 20,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Main Title */}
          <Text style={styles.title}>Kalki Sena Drive</Text>

          {/* Mission / Description text */}
          <Text style={styles.description}>
            A super app as a taxi, motorcycle ride, and food delivery app. All
            profit will be spent on 200 free clinics to stop arrival of
            post-antibiotic era in Nepal and lakhs of lives every year. App will
            also fund research by KRTC to make 1 Nrs = 25 INR. This
            transformation will help provide free health, education, and legal
            services to 3 croee Nepali without insurance.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonsWrapper}>
            {/* Log In Button */}
            <TouchableOpacity
              style={styles.logInButton}
              activeOpacity={0.8}
              onPress={handleLogIn}
            >
              <Text style={styles.logInButtonText}>Log In</Text>
            </TouchableOpacity>

            {/* Create an account Button */}
            <TouchableOpacity
              style={styles.createAccountButton}
              activeOpacity={0.8}
              onPress={handleCreateAccount}
            >
              <Text style={styles.createAccountButtonText}>
                Create an account
              </Text>
            </TouchableOpacity>

            {/* "or" Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign up with Gmail Button */}
            <TouchableOpacity
              style={styles.gmailButton}
              activeOpacity={0.8}
              onPress={handleGmailSignUp}
            >
              <View style={styles.gmailIconWrapper}>
                <GmailIcon size={18} />
              </View>
              <Text style={styles.gmailButtonText}>Sign up with Gmail</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
  },
  logoAbsoluteContainer: {
    position: "absolute",
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  contentScrollViewWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#4A9EF8",
    textAlign: "center",
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 21,
    color: "#C6DBEF",
    textAlign: "center",
    fontWeight: "400",
    paddingHorizontal: 6,
    marginBottom: 24,
  },
  buttonsWrapper: {
    width: "100%",
    marginTop: "auto",
  },
  logInButton: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    backgroundColor: "#061B36",
    borderWidth: 1,
    borderColor: "#183B68",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logInButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  createAccountButton: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2079F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#2079F2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  createAccountButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  dividerText: {
    color: "#7E9BB8",
    fontSize: 13,
    fontWeight: "500",
    paddingHorizontal: 12,
  },
  gmailButton: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    backgroundColor: "#061B36",
    borderWidth: 1,
    borderColor: "#183B68",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  gmailIconWrapper: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  gmailButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
