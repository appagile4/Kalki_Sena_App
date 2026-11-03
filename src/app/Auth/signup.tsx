import CountryCodeModal, {
  CountryItem,
} from "../../components/Main/countrycodeModal";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useMemo } from "react";
import {
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Avatar Image state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedGenderId, setSelectedGenderId] = useState<string | undefined>("1");
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
    []
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

  // --- Image Picker Handlers ---
  const pickImageFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload your profile picture."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
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
          "Sorry, we need camera permissions to take a profile picture."
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
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

  // --- Date Picker Handler ---
  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && date) {
      setSelectedDate(date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      setDob(`${day}/${month}/${year}`);
    }
  };

  const handleSignUp = () => {
    if (!agreedToTerms) {
      Alert.alert(
        "Terms and Conditions",
        "Please accept the terms and conditions to proceed."
      );
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    // Proceed to account verification
    router.push({
      pathname: "/Auth/verify",
      params: {
        mode: "signup",
        name: fullName.trim() || "User",
        email: email.trim(),
        phone: phoneNumber.trim()
          ? `${selectedCountry.code} ${phoneNumber.trim()}`
          : "",
      },
    });
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
            onPress={() => router.back()}
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
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g John Doe"
                placeholderTextColor="#516A8A"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            {/* Date of birth with Date Picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date of birth</Text>
              <TouchableOpacity
                style={styles.inputWithIcon}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
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
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#5A7394"
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* DatePicker Component (Android) */}
            {showDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                onChange={handleDateChange}
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
                      <Text style={styles.iosModalTitle}>Select Birth Date</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const day = String(selectedDate.getDate()).padStart(
                            2,
                            "0"
                          );
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
                      onChange={handleDateChange}
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
                >
                  <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCodeText}>
                    {selectedCountry.code}
                  </Text>
                  <Ionicons name="chevron-down" size={15} color="#8EA5C0" />
                </TouchableOpacity>

                {/* Phone Input */}
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="e.g John Doe"
                  placeholderTextColor="#516A8A"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g example@gmail.com"
                placeholderTextColor="#516A8A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputInner}
                  placeholder="password"
                  placeholderTextColor="#516A8A"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
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
            </View>

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputInner}
                  placeholder="confirm password"
                  placeholderTextColor="#516A8A"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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

            {/* Terms and Conditions Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkboxCircle,
                  agreedToTerms && styles.checkboxCircleSelected,
                ]}
              >
                {agreedToTerms && <View style={styles.checkboxDot} />}
              </View>
              <Text style={styles.termsText}>
                By signing up you are agree to{" "}
                <Text style={styles.termsLink}>Terms and condition.</Text>
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.signUpButton}
              activeOpacity={0.85}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>

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
});
