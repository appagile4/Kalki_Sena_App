import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Radio selection: 1 = Phone Number, 2 = Email (default Email)
  const [selectedMethodId, setSelectedMethodId] = useState<string>("2");
  const [inputValue, setInputValue] = useState("");

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

  const handleSendOtp = () => {
    if (!inputValue.trim()) {
      Alert.alert(
        "Required Field",
        `Please enter your ${isEmail ? "email address" : "phone number"} to receive an OTP.`
      );
      return;
    }

    // Navigate to unified dynamic verify.tsx in forgot_password mode
    router.push({
      pathname: "/Auth/verify",
      params: {
        mode: "forgot_password",
        selectedMethod: isEmail ? "email" : "phone",
        email: isEmail ? inputValue.trim() : "",
        phone: !isEmail ? inputValue.trim() : "",
        identifier: inputValue.trim(),
      },
    });
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
          onPress={() => router.back()}
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
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>
            Verification email or phone number
          </Text>

          {/* Radio Buttons (Phone Number vs Email) */}
          <View style={styles.radioWrapper}>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={setSelectedMethodId}
              selectedId={selectedMethodId}
              layout="row"
              containerStyle={styles.radioGroupStyle}
            />
          </View>

          {/* Dynamic Input (Email / Phone Number) */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={isEmail ? "e.g. abc@gmail.com" : "e.g. 98XXXXXXXX"}
              placeholderTextColor="#516A8A"
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType={isEmail ? "email-address" : "phone-pad"}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleSendOtp}
          >
            <Text style={styles.primaryButtonText}>Send OTP</Text>
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
    marginBottom: 24,
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
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
