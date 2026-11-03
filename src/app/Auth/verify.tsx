import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

export type VerificationStep =
  | "SELECT_METHOD" // Screen 1: Verify your account
  | "ENTER_OTP" // Screen 2 / 3: Phone/Email OTP verification
  | "VERIFIED_SUCCESS" // Screen 4: Number Verification Successful
  | "SET_NEW_PASSWORD" // Screen 5: Set New Password (for forgot_password flow)
  | "PASSWORD_CHANGED" // Screen 6: Successfully Password Changed (for forgot_password flow)
  | "LOADING" // Loading spinner
  | "FINAL_SCREEN"; // Screen 5: "Account Created Successfully" (signup) OR "Welcome Back! Subhodip" (login)

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    mode?: "signup" | "login" | "forgot_password";
    selectedMethod?: "phone" | "email";
    name?: string;
    email?: string;
    phone?: string;
    identifier?: string;
  }>();

  const mode = params.mode || "signup";
  const userName = params.name || (mode === "login" ? "Subhodip" : "User");

  // Determine initial selection based on provided params
  const defaultMethod =
    params.selectedMethod === "phone" ||
    (params.identifier && !params.identifier.includes("@"))
      ? "2"
      : "1";

  // If coming from forgot_password, the contact was already provided on Screen 2, so proceed directly to OTP!
  const initialStep: VerificationStep =
    mode === "forgot_password" ? "ENTER_OTP" : "SELECT_METHOD";

  const [step, setStep] = useState<VerificationStep>(initialStep);
  const [selectedMethodId, setSelectedMethodId] =
    useState<string>(defaultMethod);

  // Radio Options for sending OTP
  const methodRadioButtons: RadioButtonProps[] = useMemo(() => {
    const emailLabel = params.email
      ? `Email (${params.email})`
      : params.identifier && params.identifier.includes("@")
        ? `Email (${params.identifier})`
        : "Email";

    const phoneLabel = params.phone
      ? `Phone Number (${params.phone})`
      : params.identifier && !params.identifier.includes("@")
        ? `Phone Number (${params.identifier})`
        : "Phone Number";

    return [
      {
        id: "1",
        label: emailLabel,
        value: "Email",
        color: "#2079F2",
        borderColor: "#2079F2",
        size: 18,
        labelStyle: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "500" },
        containerStyle: { marginBottom: 18 },
      },
      {
        id: "2",
        label: phoneLabel,
        value: "Phone Number",
        color: "#2079F2",
        borderColor: "#2079F2",
        size: 18,
        labelStyle: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "500" },
      },
    ];
  }, [params.email, params.phone, params.identifier]);

  // 5-digit OTP state
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputRefs = useRef<Array<any>>([]);

  // Resend countdown timer
  const [timer, setTimer] = useState(30);

  // New Password State (for forgot_password flow)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Spinner rotation animation
  const spinValue = useRef(new Animated.Value(0)).current;

  // Screen fade animations
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Countdown timer in OTP step
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === "ENTER_OTP" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Loading spinner loop
  useEffect(() => {
    if (step === "LOADING") {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Automatically advance to Step 5 (Final Screen) after 1.6 seconds
      const timeout = setTimeout(() => {
        transitionTo("FINAL_SCREEN");
      }, 1600);

      return () => clearTimeout(timeout);
    }
  }, [step]);

  // Step 4 (Verified Success) transitions
  useEffect(() => {
    if (step === "VERIFIED_SUCCESS") {
      const timeout = setTimeout(() => {
        if (mode === "forgot_password") {
          // In forgot password flow, advance to Set New Password screen!
          transitionTo("SET_NEW_PASSWORD");
        } else {
          transitionTo("LOADING");
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [step, mode]);

  // Step 5 (Final Screen) auto-redirects to Home after 1.8 seconds (for signup/login)
  useEffect(() => {
    if (step === "FINAL_SCREEN") {
      const timeout = setTimeout(() => {
        router.replace("/Home" as any);
      }, 1800);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  // Step 6 (Password Changed) auto-redirects back to Login after 1.8 seconds
  useEffect(() => {
    if (step === "PASSWORD_CHANGED") {
      const timeout = setTimeout(() => {
        router.replace("/Auth/login");
      }, 1800);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  // Auto focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === "ENTER_OTP") {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 250);
    }
  }, [step]);

  const transitionTo = (nextStep: VerificationStep) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next box if digit is entered
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    transitionTo("VERIFIED_SUCCESS");
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(["", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleSaveNewPassword = () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    // At least 1 number or special character requirement
    const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      newPassword,
    );
    if (!hasNumberOrSpecial) {
      setPasswordError(
        "Password must contain at least 1 number or special character.",
      );
      return;
    }

    setPasswordError(null);
    transitionTo("PASSWORD_CHANGED");
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Navy Background Gradient */}
      <LinearGradient
        colors={["#020b18", "#03142c", "#051c3d", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header with Back Button */}
      {(step === "SELECT_METHOD" ||
        step === "ENTER_OTP" ||
        step === "SET_NEW_PASSWORD") && (
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === "ENTER_OTP") {
                if (mode === "forgot_password") {
                  router.back();
                } else {
                  transitionTo("SELECT_METHOD");
                }
              } else if (step === "SET_NEW_PASSWORD") {
                transitionTo("ENTER_OTP");
              } else {
                router.back();
              }
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
          {/* ======================================================== */}
          {/* SCREEN 1: VERIFY YOUR ACCOUNT (SIGNUP / LOGIN FLOW)      */}
          {/* ======================================================== */}
          {step === "SELECT_METHOD" && (
            <View style={styles.stepContainer}>
              <Text style={styles.mainTitle}>Verify your account</Text>
              <Text style={styles.subtitle}>Send OTP on -</Text>

              {/* Method Selection Options using RadioGroup */}
              <View style={styles.optionsList}>
                <RadioGroup
                  radioButtons={methodRadioButtons}
                  onPress={setSelectedMethodId}
                  selectedId={selectedMethodId}
                  layout="column"
                  containerStyle={styles.radioGroupStyle}
                />
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => transitionTo("ENTER_OTP")}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ======================================================== */}
          {/* SCREEN 2 / 3: PHONE / OTP VERIFICATION                   */}
          {/* ======================================================== */}
          {step === "ENTER_OTP" && (
            <View style={[styles.stepContainer, styles.centeredHeader]}>
              <Text style={styles.screen2Title}>
                {selectedMethodId === "2"
                  ? "Phone verification"
                  : "Email verification"}
              </Text>
              <Text style={styles.screen2Subtitle}>Enter your OTP code</Text>

              {/* 5-Digit White OTP Input Boxes */}
              <View style={styles.otpRow}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={styles.otpBox}
                    value={otp[index]}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    textAlign="center"
                  />
                ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={handleVerify}
              >
                <Text style={styles.primaryButtonText}>Verify</Text>
              </TouchableOpacity>

              {/* Resend Link */}
              <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive code? </Text>
                {timer > 0 ? (
                  <Text style={styles.resendTimerText}>({timer}s)</Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendLink}>Resend again</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* SCREEN 4: NUMBER VERIFICATION SUCCESSFUL                 */}
          {/* ======================================================== */}
          {step === "VERIFIED_SUCCESS" && (
            <View style={styles.fullCenterContainer}>
              <Text style={styles.successTitle}>
                {selectedMethodId === "2"
                  ? "Number Verification Successful"
                  : "Number Verification Successful"}
              </Text>
              <Text style={styles.successSubtitle}>
                You've successfully Joined the Kalki Sena Free Coaching Center
                for Medical Preparation
              </Text>
            </View>
          )}

          {/* ======================================================== */}
          {/* SCREEN 5: SET NEW PASSWORD (FORGOT PASSWORD FLOW)        */}
          {/* ======================================================== */}
          {step === "SET_NEW_PASSWORD" && (
            <View style={styles.stepContainer}>
              <Text style={styles.mainTitle}>Set New Password</Text>
              <Text style={styles.subtitle}>Set your new password</Text>

              {/* Enter your new password */}
              <View style={styles.inputGroup}>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={styles.inputInner}
                    placeholder="Enter your new password"
                    placeholderTextColor="#516A8A"
                    value={newPassword}
                    onChangeText={(val) => {
                      setNewPassword(val);
                      if (passwordError) setPasswordError(null);
                    }}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.rightIconWrapper}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                      size={18}
                      color="#5A7394"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm password */}
              <View style={styles.inputGroup}>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={styles.inputInner}
                    placeholder="Confirm password"
                    placeholderTextColor="#516A8A"
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (passwordError) setPasswordError(null);
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.rightIconWrapper}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={18}
                      color="#5A7394"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Requirement Hint Text (Matching Mockup) */}
              <Text style={styles.passwordHintText}>
                {passwordError || "Atleast 1 number or special character"}
              </Text>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={handleSaveNewPassword}
              >
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ======================================================== */}
          {/* SCREEN 6: PASSWORD CHANGED (FORGOT PASSWORD FLOW)        */}
          {/* ======================================================== */}
          {step === "PASSWORD_CHANGED" && (
            <View style={styles.fullCenterContainer}>
              <Text style={styles.passwordChangedTitle}>Successfully</Text>
              <Text style={styles.passwordChangedSubtitle}>
                Password Changed
              </Text>
            </View>
          )}

          {/* ======================================================== */}
          {/* LOADING SPINNER (SIGNUP / LOGIN FLOW)                    */}
          {/* ======================================================== */}
          {step === "LOADING" && (
            <View style={styles.fullCenterContainer}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Svg width={46} height={46} viewBox="0 0 48 48" fill="none">
                  <Circle
                    cx={24}
                    cy={24}
                    r={20}
                    stroke="#2079F2"
                    strokeWidth={4.5}
                    strokeDasharray="92 40"
                    strokeLinecap="round"
                  />
                </Svg>
              </Animated.View>
            </View>
          )}

          {/* ======================================================== */}
          {/* FINAL SCREEN (DYNAMIC FOR SIGNUP & LOGIN)                */}
          {/* ======================================================== */}
          {step === "FINAL_SCREEN" && (
            <View style={styles.fullCenterContainer}>
              {mode === "login" ? (
                // --- Login Mode: Welcome Back Screen ---
                <>
                  <Text style={styles.welcomeBackTitle}>Welcome Back!</Text>
                  <Text style={styles.welcomeUserName}>{userName}</Text>
                </>
              ) : (
                // --- Signup Mode: Account Created Successfully Screen ---
                <>
                  <Text style={styles.successTitle}>
                    Account Created Successfully
                  </Text>
                  <Text style={styles.successSubtitle}>
                    You've successfully Joined the Kalki Sena Free Coaching
                    Center for Medical Preparation
                  </Text>
                </>
              )}
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 6,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 22,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#8EA5C0",
    marginBottom: 24,
  },
  optionsList: {
    marginBottom: 36,
  },
  radioGroupStyle: {
    alignItems: "flex-start",
  },
  primaryButton: {
    height: 48,
    borderRadius: 8,
    width: "100%",
    backgroundColor: "#2079F2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2079F2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  centeredHeader: {
    alignItems: "center",
    paddingTop: 10,
  },
  screen2Title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  screen2Subtitle: {
    fontSize: 14,
    color: "#8EA5C0",
    textAlign: "center",
    marginBottom: 30,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    width: "100%",
    marginBottom: 30,
  },
  otpBox: {
    width: 48,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontSize: 22,
    fontWeight: "700",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  resendText: {
    color: "#8EA5C0",
    fontSize: 13.5,
  },
  resendLink: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },
  resendTimerText: {
    color: "#2079F2",
    fontSize: 13.5,
    fontWeight: "600",
  },
  fullCenterContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: -40,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 28,
  },
  successSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: "#8EA5C0",
    textAlign: "center",
    maxWidth: "90%",
  },
  welcomeBackTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeUserName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputWithIcon: {
    height: 48,
    backgroundColor: "#030e1d",
    borderWidth: 1,
    borderColor: "#163155",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  inputInner: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 14.5,
  },
  rightIconWrapper: {
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordHintText: {
    color: "#FF5252",
    fontSize: 12.5,
    fontWeight: "500",
    marginBottom: 20,
    marginTop: 2,
  },
  passwordChangedTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  passwordChangedSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#CADDF7",
    textAlign: "center",
  },
});
