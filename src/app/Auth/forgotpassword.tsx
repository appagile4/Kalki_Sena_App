import React, { useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { forgotPasswordThunk, clearError } from "../../redux/slices/authSlice";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { otpLoading, otpError } = useAppSelector((state) => state.auth);

  // Radio selection: 1 = Phone Number, 2 = Email (default Email)
  const [selectedMethodId, setSelectedMethodId] = useState<string>("2");
  const [inputValue, setInputValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (otpError) {
      setErrorMessage(otpError);
    }
  }, [otpError]);

  const radioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: "1",
        label: "Phone Number",
        value: "phone",
        color: "#2079F2",
        borderColor: "#2079F2",
        size: 18,
        labelStyle: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "500" },
        containerStyle: { marginRight: 16 },
      },
      {
        id: "2",
        label: "Email",
        value: "email",
        color: "#2079F2",
        borderColor: "#2079F2",
        size: 18,
        labelStyle: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "500" },
      },
    ],
    []
  );

  const isEmail = selectedMethodId === "2";

  const handleSendOtp = async () => {
    const val = inputValue.trim();

    if (!val) {
      setFieldError(
        `Please enter your ${isEmail ? "email address" : "phone number"}.`
      );
      return;
    }

    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setFieldError("Please enter a valid email address");
        return;
      }
    } else {
      const digits = val.replace(/\D/g, "");
      if (digits.length < 7) {
        setFieldError("Please enter a valid phone number (at least 7 digits)");
        return;
      }
    }

    setFieldError(null);
    setErrorMessage(null);
    dispatch(clearError());

    try {
      const result = await dispatch(
        forgotPasswordThunk({ identifier: val })
      ).unwrap();

      // Navigate to unified dynamic verify.tsx in forgot_password mode
      router.push({
        pathname: "/Auth/verify",
        params: {
          mode: "forgot_password",
          selectedMethod: isEmail ? "email" : "phone",
          email: result.email || (isEmail ? val : ""),
          phone: result.phone || (!isEmail ? val : ""),
          identifier: val,
          name: result.name || "User",
        },
      });
    } catch (err: any) {
      setErrorMessage(
        typeof err === "string"
          ? err
          : "Failed to send verification code. Please check your details."
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Navy Background Gradient */}
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
              router.replace("/Auth/login");
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          disabled={otpLoading}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>
            Verification email or phone number
          </Text>

          {/* Radio Buttons (Phone Number vs Email) */}
          <View style={styles.radioWrapper}>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={(id) => {
                setSelectedMethodId(id);
                setFieldError(null);
                setErrorMessage(null);
              }}
              selectedId={selectedMethodId}
              layout="row"
              containerStyle={styles.radioGroupStyle}
            />
          </View>

          {/* Dynamic Input (Email / Phone Number) */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                fieldError || errorMessage ? styles.inputError : null,
              ]}
              placeholder={isEmail ? "e.g. abc@gmail.com" : "e.g. 98XXXXXXXX"}
              placeholderTextColor="#516A8A"
              value={inputValue}
              onChangeText={(text) => {
                setInputValue(text);
                if (fieldError) setFieldError(null);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType={isEmail ? "email-address" : "phone-pad"}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!otpLoading}
            />
            {fieldError && (
              <Text style={styles.fieldErrorText}>{fieldError}</Text>
            )}
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[styles.primaryButton, otpLoading && styles.buttonDisabled]}
            activeOpacity={0.85}
            onPress={handleSendOtp}
            disabled={otpLoading}
          >
            {otpLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 30,
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  radioWrapper: {
    marginBottom: 20,
  },
  radioGroupStyle: {
    alignItems: "center",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    backgroundColor: "#030e1d",
    borderWidth: 1,
    borderColor: "#163155",
    borderRadius: 8,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 14.5,
  },
  inputError: {
    borderColor: "#FF5252",
  },
  fieldErrorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
    fontWeight: "500",
  },
  errorBox: {
    backgroundColor: "#2C0B0E",
    borderWidth: 1,
    borderColor: "#5A161C",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 12.5,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
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
});
