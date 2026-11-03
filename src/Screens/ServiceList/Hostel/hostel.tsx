import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const HOSTEL_LOCATIONS = [
  "Kathmandu - Baneshwor",
  "Kathmandu - Maitighar",
  "Lalitpur - Pulchowk",
  "Bhaktapur",
  "Pokhara",
  "Bengaluru",
  "Delhi",
];

export default function HostelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [hostelLocation, setHostelLocation] = useState("");

  // Modals
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const handleRegister = () => {
    if (!fullName.trim()) {
      Alert.alert("Registration", "Please enter your full name.");
      return;
    }
    if (!mobileNumber.trim()) {
      Alert.alert("Registration", "Please enter your mobile number.");
      return;
    }
    setShowSuccessModal(true);
  };

  const handleBackHome = () => {
    setShowSuccessModal(false);
    router.replace("/Home" as any);
  };

  // Extract first name for personalized congratulatory message
  const firstName = fullName.trim().split(" ")[0] || "Subhadip";

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Navy Background Gradient */}
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Register for Hostel
        </Text>

        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsHeader}>
            Register to Stay at the Kalki Sena Hostel and receive:
          </Text>
          <Text style={styles.benefitsBullet}>
            • Free clinic doctor consultation (after the clinic starts)
          </Text>
          <Text style={styles.benefitsBullet}>
            • Free coaching classes (after the coaching program begins)
          </Text>
          <Text style={styles.benefitsFooter}>
            You will receive both facilities.
          </Text>
        </View>

        {/* Registration Form Card */}
        <View style={styles.registrationCard}>
          <Text style={styles.registrationTitle}>Registration</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Enter Full Name"
              placeholderTextColor="#7A8D9E"
              value={fullName}
              onChangeText={setFullName}
              style={styles.textInput}
            />
          </View>

          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Enter Mobile Number"
              placeholderTextColor="#7A8D9E"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              style={styles.textInput}
            />
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#7A8D9E"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.textInput}
            />
          </View>

          {/* Location Dropdown */}
          <TouchableOpacity
            style={styles.dropdownInput}
            activeOpacity={0.8}
            onPress={() => setShowLocationModal(true)}
          >
            <Text
              style={[
                styles.dropdownText,
                !hostelLocation && styles.dropdownPlaceholder,
              ]}
              numberOfLines={1}
            >
              {hostelLocation || "Select Hostel location"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#7A8D9E" />
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            activeOpacity={0.85}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            📌 <Text style={styles.noteTextBold}>Note :</Text> When your hostel
            placement is ready, we will send you a message here.
          </Text>
        </View>
      </ScrollView>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationCard}>
            <View style={styles.locationHeaderRow}>
              <Text style={styles.locationModalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={22} color="#7A8D9E" />
              </TouchableOpacity>
            </View>

            {HOSTEL_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.locationRow,
                  hostelLocation === loc && styles.locationRowSelected,
                ]}
                onPress={() => {
                  setHostelLocation(loc);
                  setShowLocationModal(false);
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={hostelLocation === loc ? "#1E78E5" : "#7A8D9E"}
                />
                <Text
                  style={[
                    styles.locationRowText,
                    hostelLocation === loc && styles.locationRowTextSelected,
                  ]}
                >
                  {loc}
                </Text>
                {hostelLocation === loc && (
                  <Ionicons name="checkmark" size={18} color="#1E78E5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Success Modal (Screen 3) */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleBackHome}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            {/* Top Close 'X' */}
            <TouchableOpacity
              style={styles.modalCloseTopRight}
              onPress={handleBackHome}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color="#7A8D9E" />
            </TouchableOpacity>

            <View style={styles.successHeaderSection}>
              <Text style={styles.successTitle}>
                Congratulations {firstName}!
              </Text>
              <Text style={styles.successSubtitle}>
                You've successfully Registered for the{"\n"}Hostel Facility
              </Text>
            </View>

            {/* Registered Details Table */}
            <View style={styles.detailsTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Full Name</Text>
                <Text style={styles.tableValue} numberOfLines={1}>
                  {fullName || "Sudipto Bhowmick"}
                </Text>
              </View>
              <View style={styles.tableDivider} />

              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Mobile Number</Text>
                <Text style={styles.tableValue} numberOfLines={1}>
                  {mobileNumber || "+977 9876543210"}
                </Text>
              </View>
              <View style={styles.tableDivider} />

              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Email Address</Text>
                <Text style={styles.tableValue} numberOfLines={1}>
                  {emailAddress || "bhow.sudipto321@gmail.com"}
                </Text>
              </View>
              <View style={styles.tableDivider} />

              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Hostel Location</Text>
                <Text style={styles.tableValue} numberOfLines={1}>
                  {hostelLocation || "Bengaluru"}
                </Text>
              </View>
            </View>

            {/* Back Home Button */}
            <TouchableOpacity
              style={styles.backHomeButton}
              activeOpacity={0.85}
              onPress={handleBackHome}
            >
              <Text style={styles.backHomeButtonText}>Back Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 4,
    minWidth: 70,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    letterSpacing: 0.2,
  },
  headerRightSpacer: {
    minWidth: 70,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // Benefits Card
  benefitsCard: {
    backgroundColor: "#071B36",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#0E2B52",
    marginBottom: 20,
  },
  benefitsHeader: {
    color: "#CADDF7",
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 19,
    marginBottom: 10,
  },
  benefitsBullet: {
    color: "#CADDF7",
    fontSize: 12.5,
    lineHeight: 18.5,
    marginBottom: 6,
  },
  benefitsFooter: {
    color: "#CADDF7",
    fontSize: 12.5,
    marginTop: 6,
    fontWeight: "500",
  },

  // Registration Form Card
  registrationCard: {
    backgroundColor: "#071B36",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#1E78E5",
    marginBottom: 18,
  },
  registrationTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: "#FFFFFF",
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: "#102A4C",
  },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#102A4C",
    marginBottom: 16,
  },
  dropdownText: {
    color: "#FFFFFF",
    fontSize: 13.5,
  },
  dropdownPlaceholder: {
    color: "#7A8D9E",
  },
  registerButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Note Card
  noteCard: {
    backgroundColor: "#071B34",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#102A4C",
  },
  noteText: {
    color: "#CADDF7",
    fontSize: 12,
    lineHeight: 18,
  },
  noteTextBold: {
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Location Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  locationCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#071B36",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  locationHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationModalTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#0F2E59",
  },
  locationRowSelected: {
    backgroundColor: "#0B2B52",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  locationRowText: {
    color: "#CADDF7",
    fontSize: 14,
    flex: 1,
  },
  locationRowTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Success Card (Screen 3)
  successCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 26,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  modalCloseTopRight: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 6,
  },
  successHeaderSection: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 20,
  },
  successTitle: {
    color: "#1A202C",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  successSubtitle: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18.5,
  },
  detailsTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tableDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  tableLabel: {
    color: "#64748B",
    fontSize: 12.5,
    fontWeight: "500",
    width: 110,
  },
  tableValue: {
    color: "#1A202C",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  backHomeButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    paddingVertical: 13,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  backHomeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
