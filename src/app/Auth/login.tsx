import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { loginUser, clearError } from "../../redux/slices/authSlice";
import GoogleSignInButton from "../../components/Auth/GoogleSignInButton";

// --- Gmail Vector Icon ---
const GmailIcon = ({ size = 18 }: { size?: number }) => {
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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Form Fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Error States
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync redux error with local error message
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  const validate = (): boolean => {
    let isValid = true;
    const cleanId = identifier.trim();

    // 1. Identifier validation (Email or Phone)
    if (!cleanId) {
      setIdentifierError("Email or Phone number is required");
      isValid = false;
    } else if (cleanId.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanId)) {
        setIdentifierError("Please enter a valid email address");
        isValid = false;
      } else {
        setIdentifierError(null);
      }
    } else {
      const digitsOnly = cleanId.replace(/\D/g, "");
      if (digitsOnly.length < 7) {
        setIdentifierError("Please enter a valid phone number (at least 7 digits)");
        isValid = false;
      } else {
        setIdentifierError(null);
      }
    }

    // 2. Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleLoginPress = async () => {
    if (!validate()) {
      return;
    }

    setErrorMessage(null);
    dispatch(clearError());

    try {
      const result = await dispatch(
        loginUser({
          identifier: identifier.trim(),
          password,
        })
      ).unwrap();

      if (result.success) {
        router.replace("/Home" as any);
      }
    } catch (err: any) {
      setErrorMessage(
        err || "Your Email or Password are Incorrect.\nPlease try again !"
      );
    }
  };

  const handleForgotPassword = () => {
    router.push("/Auth/forgotpassword");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Navy Gradient Background */}
      <LinearGradient
        colors={["#020b18", "#03152c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header Bar with Back Button */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/Onboarding/onBoarding");
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.loginTitle}>
            Sign in with your email or phone number
          </Text>

          {/* Email / Phone input */}
          <View style={styles.fieldGroup}>
            <TextInput
              style={[
                styles.input,
                identifierError ? styles.inputError : null,
              ]}
              placeholder="Email or Phone number"
              placeholderTextColor="#516A8A"
              value={identifier}
              onChangeText={(val) => {
                setIdentifier(val);
                if (identifierError) setIdentifierError(null);
                if (errorMessage) setErrorMessage(null);
              }}
              autoCapitalize="none"
              editable={!isLoading}
            />
            {identifierError && (
              <Text style={styles.fieldErrorText}>{identifierError}</Text>
            )}
          </View>

          {/* Password input */}
          <View style={styles.fieldGroup}>
            <View
              style={[
                styles.inputWithIcon,
                passwordError ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={styles.inputInner}
                placeholder="Enter Your Password"
                placeholderTextColor="#516A8A"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (passwordError) setPasswordError(null);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.rightIconWrapper}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#5A7394"
                />
              </TouchableOpacity>
            </View>
            {passwordError && (
              <Text style={styles.fieldErrorText}>{passwordError}</Text>
            )}
          </View>

          {/* Error Banner (Matching Design) */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Forgotten password? Link */}
          <View style={styles.forgotPasswordRow}>
            <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
              <Text style={styles.forgotPasswordText}>Forgotten password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            activeOpacity={0.85}
            onPress={handleLoginPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Continue with Google Button */}
          <GoogleSignInButton
            title="Continue with Google"
            onError={(err) => setErrorMessage(err)}
            onSuccess={() => router.replace("/Home" as any)}
            style={{ marginBottom: 20 }}
          />

          {/* Bottom Link: Don't have an account? Sign Up */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/Auth/signup")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    paddingBottom: 8,
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
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 30,
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldErrorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
  input: {
    height: 48,
    backgroundColor: "#030e1d",
    borderWidth: 1,
    borderColor: "#163155",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 14,
  },
  inputError: {
    borderColor: "#FF5252",
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
    fontSize: 14,
  },
  rightIconWrapper: {
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBox: {
    backgroundColor: "#2C0B0E",
    borderWidth: 1,
    borderColor: "#5A161C",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 12.5,
    fontWeight: "500",
    lineHeight: 18,
  },
  errorSubText: {
    color: "#FF5252",
    fontSize: 12.5,
    fontWeight: "500",
    lineHeight: 18,
  },
  forgotPasswordRow: {
    alignItems: "flex-end",
    marginBottom: 20,
    marginTop: 2,
  },
  forgotPasswordText: {
    color: "#FF5252",
    fontSize: 13,
    fontWeight: "500",
  },
  primaryButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2079F2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2079F2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
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
    marginBottom: 20,
  },
  gmailIconWrapper: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  gmailButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  footerText: {
    color: "#8CAAC7",
    fontSize: 13.5,
  },
  signupLink: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
});
