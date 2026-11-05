import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setPasswordThunk } from "../../redux/slices/authSlice";

interface SetPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SetPasswordModal({
  visible,
  onClose,
  onSuccess,
}: SetPasswordModalProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // DOB state
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1));

  // Gender state
  const [selectedGenderId, setSelectedGenderId] = useState<string>("1");

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Radio button items for Gender
  const genderRadioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: "1",
        label: "Male",
        value: "Male",
        color: "#2079F2",
        labelStyle: { color: "#FFFFFF", fontSize: 14, fontWeight: "500" },
      },
      {
        id: "2",
        label: "Female",
        value: "Female",
        color: "#2079F2",
        labelStyle: { color: "#FFFFFF", fontSize: 14, fontWeight: "500" },
      },
      {
        id: "3",
        label: "Other",
        value: "Other",
        color: "#2079F2",
        labelStyle: { color: "#FFFFFF", fontSize: 14, fontWeight: "500" },
      },
    ],
    []
  );

  // Pre-fill DOB and Gender from current user (populated from Google or previous record)
  useEffect(() => {
    if (visible && user) {
      if (user.dob) {
        setDob(user.dob);
        // Try parsing DD/MM/YYYY into selectedDate
        const parts = user.dob.split("/");
        if (parts.length === 3) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
            setSelectedDate(new Date(y, m, d));
          }
        }
      }
      if (user.gender) {
        if (user.gender.toLowerCase() === "male") setSelectedGenderId("1");
        else if (user.gender.toLowerCase() === "female") setSelectedGenderId("2");
        else if (user.gender.toLowerCase() === "other") setSelectedGenderId("3");
      }
      setPassword("");
      setConfirmPassword("");
      setFormError(null);
    }
  }, [visible, user]);

  const handleDateValueChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      setDob(`${day}/${month}/${year}`);
    }
  };

  const getSelectedGender = (): string => {
    const selected = genderRadioButtons.find((r) => r.id === selectedGenderId);
    return selected?.value || "Male";
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!password) {
      setFormError("Please enter a new password");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const gender = getSelectedGender();

      await dispatch(
        setPasswordThunk({
          password,
          dob: dob || undefined,
          gender: gender || undefined,
        })
      ).unwrap();

      setLoading(false);
      Alert.alert(
        "Password Set Successfully",
        "Your password and profile details have been saved. You can now also log in using your email.",
        [
          {
            text: "OK",
            onPress: () => {
              onClose();
              if (onSuccess) onSuccess();
            },
          },
        ]
      );
    } catch (err: any) {
      setLoading(false);
      setFormError(err || "Failed to set password. Please try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.dialogCard}>
            <LinearGradient
              colors={["#0c2246", "#081832", "#051022"]}
              locations={[0, 0.5, 1]}
              style={styles.gradientCard}
            >
              {/* Header Close Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Shield / Key Icon */}
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={["#2079F2", "#1354b5"]}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
                  </LinearGradient>
                </View>

                {/* Title & Description */}
                <Text style={styles.title}>Secure Your Account</Text>
                <Text style={styles.subtitle}>
                  Set a password for your Google account so you can also sign in
                  with your email anytime.
                </Text>

                {formError && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorBannerText}>{formError}</Text>
                  </View>
                )}

                {/* Form Fields */}
                <View style={styles.formSection}>
                  {/* Password */}
                  <Text style={styles.label}>Create Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#64748B"
                      style={styles.leftIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Minimum 6 characters"
                      placeholderTextColor="#475569"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        if (formError) setFormError(null);
                      }}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={18}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Confirm Password */}
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="shield-outline"
                      size={18}
                      color="#64748B"
                      style={styles.leftIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter password"
                      placeholderTextColor="#475569"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={(t) => {
                        setConfirmPassword(t);
                        if (formError) setFormError(null);
                      }}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-outline"
                            : "eye-off-outline"
                        }
                        size={18}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Date of Birth */}
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.label}>Date of Birth</Text>
                    {user?.dob ? (
                      <Text style={styles.prefilledBadge}>Google Sync</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    activeOpacity={0.8}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#64748B"
                      style={styles.leftIcon}
                    />
                    <Text
                      style={[
                        styles.input,
                        { color: dob ? "#FFFFFF" : "#475569", paddingTop: 14 },
                      ]}
                    >
                      {dob || "Select your birth date"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color="#64748B"
                      style={styles.eyeBtn}
                    />
                  </TouchableOpacity>

                  {/* DateTimePicker for Android */}
                  {showDatePicker && Platform.OS === "android" && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      minimumDate={new Date(1920, 0, 1)}
                      onChange={handleDateValueChange}
                      onValueChange={handleDateValueChange}
                      onDismiss={() => setShowDatePicker(false)}
                    />
                  )}

                  {/* iOS Modal DatePicker */}
                  {Platform.OS === "ios" && (
                    <Modal
                      transparent
                      animationType="fade"
                      visible={showDatePicker}
                      onRequestClose={() => setShowDatePicker(false)}
                    >
                      <View style={styles.iosModalOverlay}>
                        <View style={styles.iosModalContainer}>
                          <View style={styles.iosModalHeader}>
                            <TouchableOpacity
                              onPress={() => setShowDatePicker(false)}
                            >
                              <Text style={styles.iosModalCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.iosModalTitle}>
                              Select Birth Date
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                const day = String(
                                  selectedDate.getDate()
                                ).padStart(2, "0");
                                const month = String(
                                  selectedDate.getMonth() + 1
                                ).padStart(2, "0");
                                const year = selectedDate.getFullYear();
                                setDob(`${day}/${month}/${year}`);
                                setShowDatePicker(false);
                              }}
                            >
                              <Text style={styles.iosModalDone}>Done</Text>
                            </TouchableOpacity>
                          </View>
                          <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="spinner"
                            textColor="#FFFFFF"
                            themeVariant="dark"
                            maximumDate={new Date()}
                            minimumDate={new Date(1920, 0, 1)}
                            onChange={handleDateValueChange}
                            onValueChange={handleDateValueChange}
                          />
                        </View>
                      </View>
                    </Modal>
                  )}

                  {/* Gender Selector */}
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.label}>Gender</Text>
                    {user?.gender ? (
                      <Text style={styles.prefilledBadge}>Google Sync</Text>
                    ) : null}
                  </View>
                  <View style={styles.radioContainer}>
                    <RadioGroup
                      radioButtons={genderRadioButtons}
                      onPress={setSelectedGenderId}
                      selectedId={selectedGenderId}
                      layout="row"
                      containerStyle={styles.radioGroupStyle}
                    />
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      loading && styles.submitBtnDisabled,
                    ]}
                    activeOpacity={0.85}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={["#2563EB", "#1D4ED8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <View style={styles.btnContent}>
                          <Text style={styles.submitText}>Save Password</Text>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.skipBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      if (onSuccess) onSuccess();
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.skipText}>Skip for Now</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardAvoid: {
    width: "100%",
    maxWidth: 420,
  },
  dialogCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  gradientCard: {
    padding: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 14,
  },
  iconGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2079F2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    color: "#FCA5A5",
    fontSize: 12,
    flex: 1,
  },
  formSection: {
    marginBottom: 16,
  },
  fieldHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 8,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  prefilledBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#38BDF8",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 6, 23, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    height: "100%",
  },
  eyeBtn: {
    padding: 6,
  },
  radioContainer: {
    backgroundColor: "rgba(2, 6, 23, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  radioGroupStyle: {
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  actionsContainer: {
    marginTop: 8,
    gap: 10,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  skipBtn: {
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  skipText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  iosModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  iosModalContainer: {
    backgroundColor: "#071732",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
  },
  iosModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  iosModalCancel: {
    color: "#94A3B8",
    fontSize: 15,
  },
  iosModalTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  iosModalDone: {
    color: "#38BDF8",
    fontSize: 15,
    fontWeight: "600",
  },
});
