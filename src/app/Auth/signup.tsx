import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GoogleSignInButton from "../../components/Auth/GoogleSignInButton";
import CountryCodeModal, {
  CountryItem,
} from "../../components/Main/countrycodeModal";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  clearError,
  registerUser,
  sendOtpThunk,
} from "../../redux/slices/authSlice";

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Avatar Image state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedGenderId, setSelectedGenderId] = useState<string | undefined>(
    "1",
  );
  const radioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: "1",
        label: "Male",
        value: "Male",
        color: "#2079F2",
        borderColor: "#2079F2",
        size: 18,
        labelStyle: { color: "#FFFFFF", fontSize: 13.5 },
        containerStyle: { marginRight: 16 },
      },
      {
        id: "2",
        label: "Female",
        value: "Female",
        color: "#2079F2",
        borderColor: "#2079F2",
        size: 18,
        labelStyle: { color: "#FFFFFF", fontSize: 13.5 },
        containerStyle: { marginRight: 16 },
      },
      {
        id: "3",
        label: "Other",
        value: "Other",
        color: "#2079F2",
        borderColor: "#2079F2",
        size: 18,
        labelStyle: { color: "#FFFFFF", fontSize: 13.5 },
      },
    ],
    [],
  );

  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>({
    name: "Nepal",
    code: "+977",
    iso: "NP",
    flag: "🇳🇵",
  });
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Validation Error States
  const [nameError, setNameError] = useState<string | null>(null);
  const [dobError, setDobError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync Redux error with local state
  useEffect(() => {
    if (error) {
      setServerError(error);
    }
    console.log("Error:", error);
  }, [error]);

  // Form Validation
  const validateForm = (): boolean => {
    let isValid = true;

    // Full Name
    if (!fullName.trim()) {
      setNameError("Full name is required");
      isValid = false;
    } else if (fullName.trim().length < 2) {
      setNameError("Full name must be at least 2 characters");
      isValid = false;
    } else {
      setNameError(null);
    }

    // Date of Birth
    if (!dob.trim()) {
      setDobError("Date of birth is required");
      isValid = false;
    } else {
      setDobError(null);
    }

    // Phone Number
    const cleanPhone = phoneNumber.trim().replace(/\D/g, "");
    if (!phoneNumber.trim()) {
      setPhoneError("Phone number is required");
      isValid = false;
    } else if (cleanPhone.length < 7) {
      setPhoneError("Please enter a valid phone number (at least 7 digits)");
      isValid = false;
    } else {
      setPhoneError(null);
    }

    // Email
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      setEmailError("Email address is required");
      isValid = false;
    } else if (!emailRegex.test(cleanEmail)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError(null);
    }

    // Password
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    // Confirm Password
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError(null);
    }

    // Terms
    if (!agreedToTerms) {
      setTermsError("You must agree to the Terms and Conditions");
      isValid = false;
    } else {
      setTermsError(null);
    }

    return isValid;
  };

  // --- Image Picker Handlers ---
  const pickImageFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload your profile picture.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const avatarData = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setAvatarUri(avatarData);
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick image from gallery.");
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera permissions to take a profile picture.",
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const avatarData = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setAvatarUri(avatarData);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open camera.");
    }
  };

  const handleAvatarPress = () => {
    Alert.alert("Profile Picture", "Choose how to set your profile picture", [
      { text: "Take Photo", onPress: takePhotoWithCamera },
      { text: "Choose from Gallery", onPress: pickImageFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // --- Date Picker Handlers (backward compatible with onValueChange & onChange) ---
  const handleDateValueChange = (_event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      setDob(`${day}/${month}/${year}`);
      if (dobError) setDobError(null);
    }
  };

  // Keep handleDateChange alias so any pending render/callback never throws ReferenceError
  const handleDateChange = handleDateValueChange;

  const handleDateDismiss = () => {
    setShowDatePicker(false);
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setServerError(null);
    dispatch(clearError());

    const genderObj = radioButtons.find((r) => r.id === selectedGenderId);
    const gender = genderObj ? (genderObj.value as string) : "Male";
    const formattedPhone = `${selectedCountry.code} ${phoneNumber.trim()}`;

    try {
      const result = await dispatch(
        registerUser({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: formattedPhone,
          dob: dob.trim(),
          gender,
          password,
          avatar: avatarUri || "",
        }),
      ).unwrap();

      if (result.success) {
        // Pre-send the verification OTP via Nodemailer
        try {
          await dispatch(
            sendOtpThunk({
              email: email.trim(),
              name: fullName.trim(),
              type: "signup",
            }),
          ).unwrap();
        } catch (otpErr) {
          console.warn("Could not pre-send OTP:", otpErr);
        }

        // Route to the verification stage (Email / Phone OTP)
        router.push({
          pathname: "/Auth/verify",
          params: {
            mode: "signup",
            name: fullName.trim(),
            email: email.trim(),
            phone: formattedPhone,
            identifier: email.trim(),
            selectedMethod: "email",
          },
        });
      }
    } catch (err: any) {
      setServerError(
        typeof err === "string"
          ? err
          : "Failed to create account. Please try again.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Navy Blue Gradient Background */}
      <LinearGradient
        colors={["#020b18", "#03152c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {/* Header Bar */}
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
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Your Account</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Profile Upload */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={handleAvatarPress}
              activeOpacity={0.85}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={50} color="#FFFFFF" />
              )}
              {/* Camera Badge */}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#061B36" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Server Error Banner */}
            {serverError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{serverError}</Text>
              </View>
            )}

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                placeholder="e.g John Doe"
                placeholderTextColor="#516A8A"
                value={fullName}
                onChangeText={(val) => {
                  setFullName(val);
                  if (nameError) setNameError(null);
                  if (serverError) setServerError(null);
                }}
                autoCapitalize="words"
                editable={!isLoading}
              />
              {nameError && (
                <Text style={styles.fieldErrorText}>{nameError}</Text>
              )}
            </View>

            {/* Date of birth with Date Picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date of birth</Text>
              <TouchableOpacity
                style={[
                  styles.inputWithIcon,
                  dobError ? styles.inputError : null,
                ]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <TextInput
                  style={styles.inputInner}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#516A8A"
                  value={dob}
                  editable={false}
                  pointerEvents="none"
                />
                <View style={styles.rightIconWrapper}>
                  <Ionicons name="calendar-outline" size={18} color="#5A7394" />
                </View>
              </TouchableOpacity>
              {dobError && (
                <Text style={styles.fieldErrorText}>{dobError}</Text>
              )}
            </View>

            {/* DatePicker Component (Android) */}
            {showDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                onValueChange={handleDateValueChange}
                onDismiss={handleDateDismiss}
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
                          const day = String(selectedDate.getDate()).padStart(
                            2,
                            "0",
                          );
                          const month = String(
                            selectedDate.getMonth() + 1,
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
                      onValueChange={handleDateValueChange}
                      onDismiss={handleDateDismiss}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Gender Radio Buttons using react-native-radio-buttons-group */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gender</Text>
              <RadioGroup
                radioButtons={radioButtons}
                onPress={setSelectedGenderId}
                selectedId={selectedGenderId}
                layout="row"
                containerStyle={styles.radioGroupContainer}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneRow}>
                {/* Country Code Selector */}
                <TouchableOpacity
                  style={styles.countryCodePicker}
                  onPress={() => setShowCountryModal(true)}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCodeText}>
                    {selectedCountry.code}
                  </Text>
                  <Ionicons name="chevron-down" size={15} color="#8EA5C0" />
                </TouchableOpacity>

                {/* Phone Input */}
                <TextInput
                  style={[
                    styles.input,
                    styles.phoneInput,
                    phoneError ? styles.inputError : null,
                  ]}
                  placeholder="e.g 9812345678"
                  placeholderTextColor="#516A8A"
                  value={phoneNumber}
                  onChangeText={(val) => {
                    setPhoneNumber(val);
                    if (phoneError) setPhoneError(null);
                    if (serverError) setServerError(null);
                  }}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
              {phoneError && (
                <Text style={styles.fieldErrorText}>{phoneError}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="e.g example@gmail.com"
                placeholderTextColor="#516A8A"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (emailError) setEmailError(null);
                  if (serverError) setServerError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {emailError && (
                <Text style={styles.fieldErrorText}>{emailError}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWithIcon,
                  passwordError ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.inputInner}
                  placeholder="password (min 6 characters)"
                  placeholderTextColor="#516A8A"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (passwordError) setPasswordError(null);
                    if (serverError) setServerError(null);
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

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View
                style={[
                  styles.inputWithIcon,
                  confirmPasswordError ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.inputInner}
                  placeholder="confirm password"
                  placeholderTextColor="#516A8A"
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (confirmPasswordError) setConfirmPasswordError(null);
                    if (serverError) setServerError(null);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
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
              {confirmPasswordError && (
                <Text style={styles.fieldErrorText}>
                  {confirmPasswordError}
                </Text>
              )}
            </View>

            {/* Terms and Conditions Checkbox */}
            <View style={{ marginBottom: 16 }}>
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => {
                  setAgreedToTerms(!agreedToTerms);
                  if (termsError) setTermsError(null);
                }}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <View
                  style={[
                    styles.checkboxCircle,
                    agreedToTerms && styles.checkboxCircleSelected,
                    termsError && !agreedToTerms ? styles.checkboxError : null,
                  ]}
                >
                  {agreedToTerms && <View style={styles.checkboxDot} />}
                </View>
                <Text style={styles.termsText}>
                  By signing up you are agree to{" "}
                  <Text style={styles.termsLink}>Terms and condition.</Text>
                </Text>
              </TouchableOpacity>
              {termsError && (
                <Text
                  style={[
                    styles.fieldErrorText,
                    { marginLeft: 26, marginTop: 2 },
                  ]}
                >
                  {termsError}
                </Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Continue with Google */}
            <GoogleSignInButton
              title="Continue with Google"
              onError={(err) => setServerError(err)}
              onSuccess={() => router.replace("/Home" as any)}
              style={{ marginBottom: 20 }}
            />

            {/* Footer: Already have an account? Login */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/Auth/login")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Bottom Sheet Modal */}
      <CountryCodeModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        onSelect={(country) => setSelectedCountry(country)}
        selectedCode={selectedCountry.code}
      />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  headerRightSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  avatarWrapper: {
    alignItems: "center",
    marginVertical: 14,
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#455A7E",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  cameraBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#020b18",
    zIndex: 5,
  },
  formContainer: {
    width: "100%",
  },
  fieldGroup: {
    marginBottom: 13,
  },
  fieldErrorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 4,
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
    marginBottom: 14,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
  },
  label: {
    color: "#E2EEFC",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    height: 46,
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
    height: 46,
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
  radioGroupContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 2,
    marginLeft: -8,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countryCodePicker: {
    height: 46,
    width: 96,
    backgroundColor: "#030e1d",
    borderWidth: 1,
    borderColor: "#163155",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 6,
  },
  flagEmoji: {
    fontSize: 15,
  },
  countryCodeText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  checkboxCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.8,
    borderColor: "#2079F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxCircleSelected: {
    borderColor: "#2079F2",
  },
  checkboxError: {
    borderColor: "#FF5252",
  },
  checkboxDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#2079F2",
  },
  termsText: {
    color: "#D6E5F5",
    fontSize: 12.5,
    flex: 1,
  },
  termsLink: {
    color: "#2582F8",
    textDecorationLine: "underline",
  },
  signUpButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2079F2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2079F2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  footerText: {
    color: "#8CAAC7",
    fontSize: 13.5,
  },
  loginLink: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  // iOS DatePicker Modal Styles
  iosModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  iosModalContainer: {
    backgroundColor: "#04162e",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#1b375d",
  },
  iosModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#163155",
  },
  iosModalTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  iosModalCancel: {
    color: "#8EA5C0",
    fontSize: 15,
  },
  iosModalDone: {
    color: "#2079F2",
    fontSize: 15,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1E293B",
  },
  dividerText: {
    color: "#7A8D9E",
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 12,
  },
});
