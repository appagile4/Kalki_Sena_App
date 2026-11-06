import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { apiService } from "../../../services/api";
import { secureStorage } from "../../../services/secureStorage";

// Stages of the Driver Registration
type FlowStage =
  | "dob_gender"
  | "email"
  | "member_id"
  | "city"
  | "hub"
  | "step_vehicle"
  | "step_license"
  | "step_rc"
  | "step_insurance"
  | "step_citizenship"
  | "step_plate"
  | "waiting_approval"
  | "approved"
  | "rejected"
  | "completed";

const VEHICLE_TYPES = ["Car", "Bike", "Scooter", "Taxi"];

export default function BecomeDriverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Status check state
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Active Flow Stage
  const [stage, setStage] = useState<FlowStage>("dob_gender");

  // Profile info (Part A)
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [rideCity, setRideCity] = useState("");

  // Step 1: Vehicle Details
  const [vehicleType, setVehicleType] = useState("Car");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [seatCount, setSeatCount] = useState("4");
  const [licensePlate, setLicensePlate] = useState("");
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false);

  // Completed Document Steps tracking
  const [completedSteps, setCompletedSteps] = useState<{
    [key: number]: boolean;
  }>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  // Cloudinary Document URLs
  const [licenseFrontUrl, setLicenseFrontUrl] = useState<string>("");
  const [licenseBackUrl, setLicenseBackUrl] = useState<string>("");
  const [rcUploadedUrl, setRcUploadedUrl] = useState<string>("");
  const [insuranceUploadedUrl, setInsuranceUploadedUrl] = useState<string>("");
  const [citizenshipFrontUrl, setCitizenshipFrontUrl] = useState<string>("");
  const [citizenshipBackUrl, setCitizenshipBackUrl] = useState<string>("");
  const [plateFrontUrl, setPlateFrontUrl] = useState<string>("");
  const [plateBackUrl, setPlateBackUrl] = useState<string>("");

  // Currently uploading document identifier
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Initial check on mount: has user already applied?
  useEffect(() => {
    checkDriverStatus();
  }, []);

  const checkDriverStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const user = await secureStorage.getUser();
      setLoggedInUser(user);

      if (user?.email) {
        setEmail(user.email);
      }
      if (user?.dob) {
        setDob(user.dob);
      }
      if (
        user?.gender === "Male" ||
        user?.gender === "Female" ||
        user?.gender === "Other"
      ) {
        setGender(user.gender);
      }

      const res = await apiService.getDriverStatus(user?.email);
      if (res.success && res.hasApplication && res.data) {
        setExistingApplication(res.data);
        if (res.data.status === "pending") {
          setStage("waiting_approval");
        } else if (res.data.status === "approved") {
          setStage("approved");
        } else if (res.data.status === "rejected") {
          setStage("rejected");
        } else {
          setStage("dob_gender");
        }
      } else {
        // No prior application found: show the registration form from step 1
        setStage("dob_gender");
      }
    } catch (err) {
      console.warn("[BecomeDriver] Error checking driver status:", err);
      setStage("dob_gender");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // -------------------------------------------------------------
  // Cloudinary Image Picker & Upload Function
  // -------------------------------------------------------------
  const handlePickAndUploadDocument = async (
    docType:
      | "license_front"
      | "license_back"
      | "rc_document"
      | "insurance_doc"
      | "citizenship_front"
      | "citizenship_back"
      | "plate_front"
      | "plate_back"
  ) => {
    try {
      // 1. Request gallery permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant media gallery access to upload your verification photo."
        );
        return;
      }

      // 2. Launch Image Picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.65,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const imagePayload = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;

      // Sanitized person name for Cloudinary folder
      const applicantName =
        loggedInUser?.fullName || email.split("@")[0] || "driver_applicant";

      setUploadingDoc(docType);

      // 3. Upload to Cloudinary under kalki_sena/drivers/<applicantName>
      const uploadRes = await apiService.uploadDriverDocument(
        imagePayload,
        applicantName,
        docType
      );

      if (uploadRes.success && uploadRes.url) {
        const secureUrl = uploadRes.url;
        switch (docType) {
          case "license_front":
            setLicenseFrontUrl(secureUrl);
            break;
          case "license_back":
            setLicenseBackUrl(secureUrl);
            break;
          case "rc_document":
            setRcUploadedUrl(secureUrl);
            break;
          case "insurance_doc":
            setInsuranceUploadedUrl(secureUrl);
            break;
          case "citizenship_front":
            setCitizenshipFrontUrl(secureUrl);
            break;
          case "citizenship_back":
            setCitizenshipBackUrl(secureUrl);
            break;
          case "plate_front":
            setPlateFrontUrl(secureUrl);
            break;
          case "plate_back":
            setPlateBackUrl(secureUrl);
            break;
        }
      } else {
        throw new Error(
          uploadRes.message || "Failed to upload to Cloudinary. Please try again."
        );
      }
    } catch (error: any) {
      console.error("[BecomeDriver] Document upload error:", error);
      Alert.alert(
        "Upload Failed",
        error.message ||
          "Could not upload image to Cloudinary. Please check your internet connection."
      );
    } finally {
      setUploadingDoc(null);
    }
  };

  // -------------------------------------------------------------
  // Validation Handlers
  // -------------------------------------------------------------

  // Stage 1: Date of Birth & Gender Validation
  const handleValidateDobGender = () => {
    const cleanDob = dob.trim();
    if (!cleanDob) {
      Alert.alert(
        "Date of Birth Required",
        "Please enter your Date of Birth in dd/mm/yyyy format."
      );
      return;
    }

    const dobRegex = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
    if (!dobRegex.test(cleanDob)) {
      Alert.alert(
        "Invalid Date Format",
        "Please enter your Date of Birth in dd/mm/yyyy format (e.g. 15/08/1998)."
      );
      return;
    }

    if (!gender) {
      Alert.alert("Gender Required", "Please select your gender to proceed.");
      return;
    }

    setStage("email");
  };

  // Stage 2: Email Validation
  const handleValidateEmail = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        "Invalid Email",
        "Please provide a valid email address (e.g. name@domain.com)."
      );
      return;
    }

    setStage("member_id");
  };

  // Stage 3: Member ID Validation (Optional)
  const handleValidateMemberId = () => {
    setStage("city");
  };

  // Stage 4: City Validation
  const handleValidateCity = () => {
    const cleanCity = rideCity.trim();
    if (!cleanCity) {
      Alert.alert(
        "City Required",
        "Please enter the city you want to ride in (e.g. Kathmandu, Pokhara, Biratnagar)."
      );
      return;
    }
    if (cleanCity.length < 2) {
      Alert.alert("Invalid City", "City name must be at least 2 characters.");
      return;
    }
    setStage("hub");
  };

  // Step 1 Form: Vehicle Details Validation
  const handleValidateVehicleStep = () => {
    if (!vehicleType) {
      Alert.alert("Vehicle Type Required", "Please select your vehicle type.");
      return;
    }
    if (!vehicleMake.trim()) {
      Alert.alert(
        "Vehicle Make Required",
        "Please enter vehicle make (e.g. Toyota, Honda, Bajaj)."
      );
      return;
    }
    if (!vehicleModel.trim()) {
      Alert.alert(
        "Vehicle Model Required",
        "Please enter vehicle model (e.g. Pulsar 150, Corolla, Activa)."
      );
      return;
    }
    if (!manufactureYear.trim()) {
      Alert.alert(
        "Manufacture Year Required",
        "Please enter the year of manufacture (e.g. 2022)."
      );
      return;
    }
    if (!vehicleColor.trim()) {
      Alert.alert(
        "Vehicle Color Required",
        "Please enter vehicle color (e.g. White, Black, Red)."
      );
      return;
    }
    const seats = parseInt(seatCount, 10);
    if (isNaN(seats) || seats < 1 || seats > 60) {
      Alert.alert(
        "Invalid Seat Count",
        "Please enter a valid seat capacity between 1 and 60."
      );
      return;
    }
    if (!licensePlate.trim()) {
      Alert.alert(
        "License Plate Required",
        "Please enter your official vehicle license plate number."
      );
      return;
    }

    setCompletedSteps((prev) => ({ ...prev, 1: true }));
    setStage("hub");
  };

  // Step 2 Form: License Validation
  const handleValidateLicenseStep = () => {
    if (!licenseFrontUrl || !licenseBackUrl) {
      Alert.alert(
        "Documents Missing",
        "Please upload both the Front and Back sides of your Driving License to Cloudinary."
      );
      return;
    }
    setCompletedSteps((prev) => ({ ...prev, 2: true }));
    setStage("hub");
  };

  // Step 3 Form: RC Document Validation
  const handleValidateRcStep = () => {
    if (!rcUploadedUrl) {
      Alert.alert(
        "Document Missing",
        "Please upload your Vehicle Registration Certificate (RC) to Cloudinary."
      );
      return;
    }
    setCompletedSteps((prev) => ({ ...prev, 3: true }));
    setStage("hub");
  };

  // Step 4 Form: Insurance Document Validation
  const handleValidateInsuranceStep = () => {
    if (!insuranceUploadedUrl) {
      Alert.alert(
        "Document Missing",
        "Please upload your Vehicle Insurance document to Cloudinary."
      );
      return;
    }
    setCompletedSteps((prev) => ({ ...prev, 4: true }));
    setStage("hub");
  };

  // Step 5 Form: Citizenship Validation
  const handleValidateCitizenshipStep = () => {
    if (!citizenshipFrontUrl || !citizenshipBackUrl) {
      Alert.alert(
        "Documents Missing",
        "Please upload both Front and Back photos of your National Identity Card or Citizenship."
      );
      return;
    }
    setCompletedSteps((prev) => ({ ...prev, 5: true }));
    setStage("hub");
  };

  // Step 6 Form: Number Plate Validation
  const handleValidatePlateStep = () => {
    if (!plateFrontUrl || !plateBackUrl) {
      Alert.alert(
        "Photos Missing",
        "Please upload both Front and Back photos showing your vehicle with number plate."
      );
      return;
    }
    setCompletedSteps((prev) => ({ ...prev, 6: true }));
    setStage("hub");
  };

  // Final Application Submission to Backend
  const handleSubmitFinalApplication = async () => {
    const missing: number[] = [];
    for (let i = 1; i <= 6; i++) {
      if (!completedSteps[i]) missing.push(i);
    }
    if (missing.length > 0) {
      Alert.alert(
        "Incomplete Application",
        `Please complete all 6 steps before submitting. Steps remaining: ${missing.join(
          ", "
        )}.`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        fullName: loggedInUser?.fullName || "Driver Applicant",
        email: email.trim().toLowerCase(),
        phone: loggedInUser?.phone || "",
        dob: dob.trim(),
        gender,
        memberId: memberId.trim(),
        rideCity: rideCity.trim(),
        vehicleType,
        vehicleMake: vehicleMake.trim(),
        vehicleModel: vehicleModel.trim(),
        manufactureYear: manufactureYear.trim(),
        vehicleColor: vehicleColor.trim(),
        seatCount: parseInt(seatCount, 10) || 4,
        licensePlate: licensePlate.trim().toUpperCase(),
        documents: {
          licenseFront: licenseFrontUrl,
          licenseBack: licenseBackUrl,
          rcUploaded: rcUploadedUrl,
          insuranceUploaded: insuranceUploadedUrl,
          citizenshipFront: citizenshipFrontUrl,
          citizenshipBack: citizenshipBackUrl,
          plateFront: plateFrontUrl,
          plateBack: plateBackUrl,
        },
      };

      const res = await apiService.submitDriverApplication(payload);

      if (res.success && res.data) {
        setExistingApplication(res.data);
        setStage("waiting_approval");
      } else {
        throw new Error(res.message || "Failed to submit driver application.");
      }
    } catch (err: any) {
      console.error("[BecomeDriver] submit error:", err);
      Alert.alert(
        "Submission Error",
        err.message ||
          "Could not submit your driver application. Please check your internet connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Back Button navigation
  const handleBack = () => {
    switch (stage) {
      case "dob_gender":
        router.back();
        break;
      case "email":
        setStage("dob_gender");
        break;
      case "member_id":
        setStage("email");
        break;
      case "city":
        setStage("member_id");
        break;
      case "hub":
        setStage("city");
        break;
      case "step_vehicle":
      case "step_license":
      case "step_rc":
      case "step_insurance":
      case "step_citizenship":
      case "step_plate":
        setStage("hub");
        break;
      case "waiting_approval":
      case "approved":
      case "rejected":
      case "completed":
        router.replace("/Home" as any);
        break;
    }
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  // -------------------------------------------------------------
  // Initial Loading Spinner while checking status
  // -------------------------------------------------------------
  if (isCheckingStatus) {
    return (
      <View style={[styles.container, styles.centeredLoading]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42", "#021124"]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#1E78E5" />
        <Text style={styles.loadingText}>Checking verification status...</Text>
      </View>
    );
  }

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
      {stage !== "waiting_approval" &&
        stage !== "approved" &&
        stage !== "rejected" &&
        stage !== "completed" && (
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            {stage !== "dob_gender" &&
              stage !== "email" &&
              stage !== "member_id" &&
              stage !== "city" && (
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Driver Registration
                </Text>
              )}

            <View style={styles.headerRightSpacer} />
          </View>
        )}

      {/* ========================================================= */}
      {/* 1. WAITING FOR APPROVAL SCREEN (when already submitted)   */}
      {/* ========================================================= */}
      {stage === "waiting_approval" && (
        <ScrollView
          contentContainerStyle={[
            styles.statusScreenContainer,
            {
              paddingTop: insets.top + 30,
              paddingBottom: Math.max(insets.bottom, 24) + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View style={styles.waitingBadge}>
            <View style={styles.amberPulseDot} />
            <Text style={styles.waitingBadgeText}>WAITING FOR ADMIN APPROVAL</Text>
          </View>

          {/* Icon */}
          <View style={styles.statusIconCircle}>
            <Ionicons name="time" size={42} color="#F59E0B" />
          </View>

          <Text style={styles.underReviewTitle}>
            Your Application is Under Review
          </Text>

          <Text style={styles.underReviewSubtitle}>
            Your driver registration and vehicle verification documents have been
            uploaded to Cloudinary and submitted to the Superadmin portal.
          </Text>

          {/* Application Detail Card */}
          <View style={styles.applicationCard}>
            <View style={styles.appCardHeader}>
              <Text style={styles.appCardHeaderTitle}>Application Summary</Text>
              <View style={styles.pendingStatusPill}>
                <Text style={styles.pendingStatusText}>● Pending Approval</Text>
              </View>
            </View>

            <View style={styles.appCardDivider} />

            <View style={styles.appCardRow}>
              <Text style={styles.appCardLabel}>Applicant Name</Text>
              <Text style={styles.appCardValue}>
                {existingApplication?.fullName ||
                  loggedInUser?.fullName ||
                  "Driver Applicant"}
              </Text>
            </View>

            <View style={styles.appCardRow}>
              <Text style={styles.appCardLabel}>Registered Email</Text>
              <Text style={styles.appCardValue}>
                {existingApplication?.email || email}
              </Text>
            </View>

            <View style={styles.appCardRow}>
              <Text style={styles.appCardLabel}>City</Text>
              <Text style={styles.appCardValue}>
                {existingApplication?.rideCity || rideCity || "Kathmandu"}
              </Text>
            </View>

            <View style={styles.appCardRow}>
              <Text style={styles.appCardLabel}>Vehicle</Text>
              <Text style={styles.appCardValue}>
                {existingApplication?.vehicle?.vehicleType || vehicleType} •{" "}
                {existingApplication?.vehicle?.make || vehicleMake}{" "}
                {existingApplication?.vehicle?.model || vehicleModel}
              </Text>
            </View>

            <View style={styles.appCardRow}>
              <Text style={styles.appCardLabel}>Number Plate</Text>
              <Text
                style={[
                  styles.appCardValue,
                  { color: "#38BDF8", fontFamily: "monospace" },
                ]}
              >
                {existingApplication?.vehicle?.licensePlate || licensePlate}
              </Text>
            </View>

            <View style={styles.appCardRow}>
              <Text style={styles.appCardLabel}>Cloudinary Folder</Text>
              <Text
                style={[
                  styles.appCardValue,
                  { color: "#10B981", fontFamily: "monospace", fontSize: 11 },
                ]}
              >
                kalki_sena/drivers/
                {(
                  existingApplication?.fullName ||
                  loggedInUser?.fullName ||
                  "applicant"
                )
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "_")}
              </Text>
            </View>

            <View style={styles.appCardRow}>
              <Text style={styles.appCardLabel}>Submitted On</Text>
              <Text style={styles.appCardValue}>
                {existingApplication?.createdAt
                  ? new Date(existingApplication.createdAt).toLocaleDateString()
                  : "Today"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.refreshStatusBtn}
            activeOpacity={0.85}
            onPress={checkDriverStatus}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.refreshStatusBtnText}>Refresh Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeBtn}
            activeOpacity={0.85}
            onPress={() => router.replace("/Home" as any)}
          >
            <Text style={styles.backHomeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ========================================================= */}
      {/* 2. APPROVED SCREEN                                        */}
      {/* ========================================================= */}
      {stage === "approved" && (
        <View
          style={[
            styles.statusScreenContainer,
            {
              paddingTop: insets.top + 40,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          <View style={styles.approvedBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.approvedBadgeText}>VERIFIED DRIVER PARTNER</Text>
          </View>

          <View
            style={[
              styles.statusIconCircle,
              { backgroundColor: "#064E3B", borderColor: "#10B981" },
            ]}
          >
            <Ionicons name="checkmark-done" size={44} color="#10B981" />
          </View>

          <Text style={styles.underReviewTitle}>
            Congratulations! You Are Approved
          </Text>

          <Text style={styles.underReviewSubtitle}>
            Your driver partner application has been verified and approved by the
            administration. You are now authorized to accept rides on the Kalki
            Sena fleet.
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { marginTop: 30, width: "100%", maxWidth: 320 },
            ]}
            activeOpacity={0.85}
            onPress={() => router.replace("/Home" as any)}
          >
            <Text style={styles.primaryButtonText}>Go to Driver Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ========================================================= */}
      {/* 3. REJECTED SCREEN                                        */}
      {/* ========================================================= */}
      {stage === "rejected" && (
        <ScrollView
          contentContainerStyle={[
            styles.statusScreenContainer,
            {
              paddingTop: insets.top + 30,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          <View style={styles.rejectedBadge}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.rejectedBadgeText}>
              APPLICATION REQUIRES ATTENTION
            </Text>
          </View>

          <View
            style={[
              styles.statusIconCircle,
              { backgroundColor: "#450A0A", borderColor: "#EF4444" },
            ]}
          >
            <Ionicons name="close" size={44} color="#EF4444" />
          </View>

          <Text style={styles.underReviewTitle}>Application Needs Revision</Text>

          <Text style={styles.underReviewSubtitle}>
            The Superadmin team reviewed your submission and noted the following:
          </Text>

          <View style={styles.rejectionReasonBox}>
            <Text style={styles.rejectionReasonTitle}>Reason from Superadmin:</Text>
            <Text style={styles.rejectionReasonText}>
              "{existingApplication?.rejectionReason ||
                "Please verify your documents and ensure clear photo uploads."}"
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { marginTop: 24, width: "100%", maxWidth: 320 },
            ]}
            activeOpacity={0.85}
            onPress={() => setStage("hub")}
          >
            <Text style={styles.primaryButtonText}>Edit Details & Re-apply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeBtn}
            activeOpacity={0.85}
            onPress={() => router.replace("/Home" as any)}
          >
            <Text style={styles.backHomeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ========================================================= */}
      {/* 4. MULTI-STAGE REGISTRATION FORM                          */}
      {/* ========================================================= */}
      {stage !== "waiting_approval" &&
        stage !== "approved" &&
        stage !== "rejected" && (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 20 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* ---------------- PART A - SCREEN 1: DOB & GENDER ---------------- */}
            {stage === "dob_gender" && (
              <View style={styles.stageContainer}>
                <Text style={styles.formSectionTitle}>Date of Birth</Text>
                <View style={styles.inputBoxWithIcon}>
                  <TextInput
                    style={styles.inputField}
                    value={dob}
                    onChangeText={setDob}
                    placeholder="dd/mm/yyyy (e.g. 15/08/1998)"
                    placeholderTextColor="#7A8D9E"
                    keyboardType="numbers-and-punctuation"
                  />
                  <Ionicons name="calendar-outline" size={18} color="#7A8D9E" />
                </View>

                <Text style={[styles.formSectionTitle, { marginTop: 24 }]}>
                  Select your Gender
                </Text>
                {(["Male", "Female", "Other"] as const).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.radioRow}
                    activeOpacity={0.8}
                    onPress={() => setGender(item)}
                  >
                    <Ionicons
                      name={
                        gender === item ? "radio-button-on" : "radio-button-off"
                      }
                      size={20}
                      color={gender === item ? "#3087E5" : "#4A5D72"}
                    />
                    <Text style={styles.radioLabel}>{item}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 28 }]}
                  activeOpacity={0.85}
                  onPress={handleValidateDobGender}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ---------------- PART A - SCREEN 2: EMAIL ---------------- */}
            {stage === "email" && (
              <View style={styles.stageContainer}>
                <Text style={styles.formSectionTitle}>Enter your Email</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputField}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@mail.com"
                    placeholderTextColor="#7A8D9E"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 24 }]}
                  activeOpacity={0.85}
                  onPress={handleValidateEmail}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ---------------- PART A - SCREEN 3: MEMBER ID (OPTIONAL) ---------------- */}
            {stage === "member_id" && (
              <View style={styles.stageContainer}>
                <Text style={styles.formSectionTitle}>
                  Enter your Member ID{" "}
                  <Text style={styles.optionalText}>(optional)</Text>
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputField}
                    value={memberId}
                    onChangeText={setMemberId}
                    placeholder="Member ID code (if any)"
                    placeholderTextColor="#7A8D9E"
                    autoCapitalize="characters"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 24 }]}
                  activeOpacity={0.85}
                  onPress={handleValidateMemberId}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ---------------- PART A - SCREEN 4: CITY ---------------- */}
            {stage === "city" && (
              <View style={styles.stageContainer}>
                <Text style={styles.formSectionTitle}>
                  Tell us from which city you want to ride
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputField}
                    value={rideCity}
                    onChangeText={setRideCity}
                    placeholder="City name (e.g. Kathmandu)"
                    placeholderTextColor="#7A8D9E"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 24 }]}
                  activeOpacity={0.85}
                  onPress={handleValidateCity}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ---------------- PART B - HUB: 6 STEPS DASHBOARD ---------------- */}
            {stage === "hub" && (
              <View style={styles.stageContainer}>
                <Text style={styles.hubWelcomeTitle}>
                  Welcome, {loggedInUser?.fullName || "Applicant"}
                </Text>
                <Text style={styles.hubSubtitle}>
                  Complete your driver registration
                </Text>

                {/* 6 Steps Progress Bar */}
                <View style={styles.progressBarRow}>
                  {[1, 2, 3, 4, 5, 6].map((stepNum) => (
                    <View
                      key={stepNum}
                      style={[
                        styles.progressSegment,
                        completedSteps[stepNum] && styles.progressSegmentActive,
                      ]}
                    />
                  ))}
                </View>

                <Text style={styles.stepsCountText}>
                  {completedCount} of 6 Steps Completed
                </Text>

                {/* Step 1: Vehicle Details */}
                <TouchableOpacity
                  style={styles.stepCard}
                  activeOpacity={0.8}
                  onPress={() => setStage("step_vehicle")}
                >
                  <View style={styles.stepTextCol}>
                    <Text style={styles.stepCardTitle}>Vehicle Details</Text>
                    {!completedSteps[1] && (
                      <Text style={styles.stepCardSub}>Recommended Step</Text>
                    )}
                  </View>
                  {completedSteps[1] ? (
                    <View style={styles.completedBadgeRow}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                      <Ionicons name="checkmark" size={16} color="#22C55E" />
                    </View>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#7A8D9E"
                    />
                  )}
                </TouchableOpacity>

                {/* Step 2: Driving License */}
                <TouchableOpacity
                  style={styles.stepCard}
                  activeOpacity={0.8}
                  onPress={() => setStage("step_license")}
                >
                  <View style={styles.stepTextCol}>
                    <Text style={styles.stepCardTitle}>Driving License</Text>
                    {licenseFrontUrl && licenseBackUrl && (
                      <Text style={styles.uploadedCloudinaryTag}>
                        Cloudinary Synced
                      </Text>
                    )}
                  </View>
                  {completedSteps[2] ? (
                    <View style={styles.completedBadgeRow}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                      <Ionicons name="checkmark" size={16} color="#22C55E" />
                    </View>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#7A8D9E"
                    />
                  )}
                </TouchableOpacity>

                {/* Step 3: Registration Certificate (RC) */}
                <TouchableOpacity
                  style={styles.stepCard}
                  activeOpacity={0.8}
                  onPress={() => setStage("step_rc")}
                >
                  <View style={styles.stepTextCol}>
                    <Text style={styles.stepCardTitle}>
                      Registration Certificate (RC)
                    </Text>
                    {rcUploadedUrl && (
                      <Text style={styles.uploadedCloudinaryTag}>
                        Cloudinary Synced
                      </Text>
                    )}
                  </View>
                  {completedSteps[3] ? (
                    <View style={styles.completedBadgeRow}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                      <Ionicons name="checkmark" size={16} color="#22C55E" />
                    </View>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#7A8D9E"
                    />
                  )}
                </TouchableOpacity>

                {/* Step 4: Vehicle Insurance Document */}
                <TouchableOpacity
                  style={styles.stepCard}
                  activeOpacity={0.8}
                  onPress={() => setStage("step_insurance")}
                >
                  <View style={styles.stepTextCol}>
                    <Text style={styles.stepCardTitle}>
                      Vehicle Insurance Document
                    </Text>
                    {insuranceUploadedUrl && (
                      <Text style={styles.uploadedCloudinaryTag}>
                        Cloudinary Synced
                      </Text>
                    )}
                  </View>
                  {completedSteps[4] ? (
                    <View style={styles.completedBadgeRow}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                      <Ionicons name="checkmark" size={16} color="#22C55E" />
                    </View>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#7A8D9E"
                    />
                  )}
                </TouchableOpacity>

                {/* Step 5: National Identity Card or Citizenship */}
                <TouchableOpacity
                  style={styles.stepCard}
                  activeOpacity={0.8}
                  onPress={() => setStage("step_citizenship")}
                >
                  <View style={styles.stepTextCol}>
                    <Text style={styles.stepCardTitle}>
                      National Identity Card or Citizenship
                    </Text>
                    {citizenshipFrontUrl && citizenshipBackUrl && (
                      <Text style={styles.uploadedCloudinaryTag}>
                        Cloudinary Synced
                      </Text>
                    )}
                  </View>
                  {completedSteps[5] ? (
                    <View style={styles.completedBadgeRow}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                      <Ionicons name="checkmark" size={16} color="#22C55E" />
                    </View>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#7A8D9E"
                    />
                  )}
                </TouchableOpacity>

                {/* Step 6: Number Plate Image */}
                <TouchableOpacity
                  style={styles.stepCard}
                  activeOpacity={0.8}
                  onPress={() => setStage("step_plate")}
                >
                  <View style={styles.stepTextCol}>
                    <Text style={styles.stepCardTitle}>Number Plate Image</Text>
                    {plateFrontUrl && plateBackUrl && (
                      <Text style={styles.uploadedCloudinaryTag}>
                        Cloudinary Synced
                      </Text>
                    )}
                  </View>
                  {completedSteps[6] ? (
                    <View style={styles.completedBadgeRow}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                      <Ionicons name="checkmark" size={16} color="#22C55E" />
                    </View>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#7A8D9E"
                    />
                  )}
                </TouchableOpacity>

                {/* Submit Final Application Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      marginTop: 24,
                      opacity: completedCount === 6 && !isSubmitting ? 1 : 0.6,
                    },
                  ]}
                  activeOpacity={0.85}
                  disabled={completedCount !== 6 || isSubmitting}
                  onPress={handleSubmitFinalApplication}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {completedCount === 6
                        ? "Submit Application to Admin"
                        : `Complete All Steps (${completedCount}/6)`}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ---------------- STEP 1: VEHICLE DETAILS ---------------- */}
            {stage === "step_vehicle" && (
              <View style={styles.stageContainer}>
                <Text style={styles.stepTracker}>Step 1 of 6</Text>

                <Text style={styles.inputLabel}>Vehicle Type *</Text>
                <TouchableOpacity
                  style={styles.dropdownInput}
                  activeOpacity={0.8}
                  onPress={() => setShowVehicleTypeModal(true)}
                >
                  <Text style={styles.dropdownInputText}>{vehicleType}</Text>
                  <Ionicons name="chevron-down" size={18} color="#7A8D9E" />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Vehicle Make *</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputField}
                    value={vehicleMake}
                    onChangeText={setVehicleMake}
                    placeholder="e.g Toyota, Bajaj, Honda"
                    placeholderTextColor="#7A8D9E"
                  />
                </View>

                <Text style={styles.inputLabel}>Vehicle Model *</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputField}
                    value={vehicleModel}
                    onChangeText={setVehicleModel}
                    placeholder="e.g Pulsar 150, Corolla, Activa"
                    placeholderTextColor="#7A8D9E"
                  />
                </View>

                <Text style={styles.inputLabel}>Year of Manufacture *</Text>
                <View style={styles.inputBoxWithIcon}>
                  <TextInput
                    style={styles.inputField}
                    value={manufactureYear}
                    onChangeText={setManufactureYear}
                    placeholder="e.g 2022"
                    placeholderTextColor="#7A8D9E"
                    keyboardType="numeric"
                  />
                  <Ionicons name="calendar-outline" size={18} color="#7A8D9E" />
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={styles.halfCol}>
                    <Text style={styles.inputLabel}>Color *</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.inputField}
                        value={vehicleColor}
                        onChangeText={setVehicleColor}
                        placeholder="e.g White"
                        placeholderTextColor="#7A8D9E"
                      />
                    </View>
                  </View>

                  <View style={styles.halfCol}>
                    <Text style={styles.inputLabel}>Seats *</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.inputField}
                        value={seatCount}
                        onChangeText={setSeatCount}
                        placeholder="e.g 4"
                        placeholderTextColor="#7A8D9E"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>License Plate Number *</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputField}
                    value={licensePlate}
                    onChangeText={setLicensePlate}
                    placeholder="e.g BA-2-PA-1234"
                    placeholderTextColor="#7A8D9E"
                    autoCapitalize="characters"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 24 }]}
                  activeOpacity={0.85}
                  onPress={handleValidateVehicleStep}
                >
                  <Text style={styles.primaryButtonText}>Save & Next Step</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ---------------- STEP 2: DRIVING LICENSE ---------------- */}
            {stage === "step_license" && (
              <View style={styles.stageContainer}>
                <Text style={styles.stepTracker}>Step 2 of 6</Text>
                <Text style={styles.uploadSectionHeading}>
                  Upload your Driving License
                </Text>

                {/* Front Upload Box */}
                <TouchableOpacity
                  style={[
                    styles.uploadBoxDashed,
                    licenseFrontUrl && styles.uploadBoxUploaded,
                  ]}
                  activeOpacity={0.8}
                  disabled={uploadingDoc === "license_front"}
                  onPress={() => handlePickAndUploadDocument("license_front")}
                >
                  {uploadingDoc === "license_front" ? (
                    <View style={styles.uploadingBoxInner}>
                      <ActivityIndicator size="small" color="#1E78E5" />
                      <Text style={styles.uploadingText}>
                        Uploading to Cloudinary...
                      </Text>
                    </View>
                  ) : licenseFrontUrl ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image
                        source={{ uri: licenseFrontUrl }}
                        style={styles.uploadedDocThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.uploadedCheckOverlay}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#22C55E"
                        />
                        <Text style={styles.uploadedOverlayText}>
                          Front Synced
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadBoxInnerPill}>
                      <Ionicons name="cloud-upload" size={16} color="#FFFFFF" />
                      <Text style={styles.uploadBoxInnerText}>
                        Choose License Front
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Back Upload Box */}
                <TouchableOpacity
                  style={[
                    styles.uploadBoxDashed,
                    licenseBackUrl && styles.uploadBoxUploaded,
                  ]}
                  activeOpacity={0.8}
                  disabled={uploadingDoc === "license_back"}
                  onPress={() => handlePickAndUploadDocument("license_back")}
                >
                  {uploadingDoc === "license_back" ? (
                    <View style={styles.uploadingBoxInner}>
                      <ActivityIndicator size="small" color="#1E78E5" />
                      <Text style={styles.uploadingText}>
                        Uploading to Cloudinary...
                      </Text>
                    </View>
                  ) : licenseBackUrl ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image
                        source={{ uri: licenseBackUrl }}
                        style={styles.uploadedDocThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.uploadedCheckOverlay}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#22C55E"
                        />
                        <Text style={styles.uploadedOverlayText}>
                          Back Synced
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadBoxInnerPill}>
                      <Ionicons name="cloud-upload" size={16} color="#FFFFFF" />
                      <Text style={styles.uploadBoxInnerText}>
                        Choose License Back
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.uploadGuidanceNote}>
                  Uploads are securely saved on Cloudinary under your personal
                  applicant folder.
                </Text>

                <View style={styles.uploadActionRow}>
                  <TouchableOpacity
                    style={styles.reuploadButton}
                    onPress={() => {
                      setLicenseFrontUrl("");
                      setLicenseBackUrl("");
                    }}
                  >
                    <Text style={styles.reuploadButtonText}>Clear</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitUploadButton}
                    onPress={handleValidateLicenseStep}
                  >
                    <Text style={styles.submitUploadButtonText}>
                      Confirm & Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ---------------- STEP 3: RC CERTIFICATE ---------------- */}
            {stage === "step_rc" && (
              <View style={styles.stageContainer}>
                <Text style={styles.stepTracker}>Step 3 of 6</Text>
                <Text style={styles.uploadSectionHeading}>
                  Upload your Vehicle Registration Certificate (RC)
                </Text>

                <TouchableOpacity
                  style={[
                    styles.largeUploadBoxDashed,
                    rcUploadedUrl && styles.uploadBoxUploaded,
                  ]}
                  activeOpacity={0.8}
                  disabled={uploadingDoc === "rc_document"}
                  onPress={() => handlePickAndUploadDocument("rc_document")}
                >
                  {uploadingDoc === "rc_document" ? (
                    <View style={styles.uploadingBoxInner}>
                      <ActivityIndicator size="small" color="#1E78E5" />
                      <Text style={styles.uploadingText}>
                        Uploading to Cloudinary...
                      </Text>
                    </View>
                  ) : rcUploadedUrl ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image
                        source={{ uri: rcUploadedUrl }}
                        style={styles.uploadedDocThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.uploadedCheckOverlay}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#22C55E"
                        />
                        <Text style={styles.uploadedOverlayText}>
                          RC Document Synced
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadBoxInnerPill}>
                      <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                      <Text style={styles.uploadBoxInnerText}>
                        Choose RC Document Image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.uploadGuidanceNote}>
                  This document proves that your vehicle is legally registered
                  and road-ready.
                </Text>

                <View style={styles.uploadActionRow}>
                  <TouchableOpacity
                    style={styles.reuploadButton}
                    onPress={() => setRcUploadedUrl("")}
                  >
                    <Text style={styles.reuploadButtonText}>Clear</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitUploadButton}
                    onPress={handleValidateRcStep}
                  >
                    <Text style={styles.submitUploadButtonText}>
                      Confirm & Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ---------------- STEP 4: INSURANCE DOCUMENT ---------------- */}
            {stage === "step_insurance" && (
              <View style={styles.stageContainer}>
                <Text style={styles.stepTracker}>Step 4 of 6</Text>
                <Text style={styles.uploadSectionHeading}>
                  Upload your Vehicle Insurance
                </Text>

                <TouchableOpacity
                  style={[
                    styles.largeUploadBoxDashed,
                    insuranceUploadedUrl && styles.uploadBoxUploaded,
                  ]}
                  activeOpacity={0.8}
                  disabled={uploadingDoc === "insurance_doc"}
                  onPress={() => handlePickAndUploadDocument("insurance_doc")}
                >
                  {uploadingDoc === "insurance_doc" ? (
                    <View style={styles.uploadingBoxInner}>
                      <ActivityIndicator size="small" color="#1E78E5" />
                      <Text style={styles.uploadingText}>
                        Uploading to Cloudinary...
                      </Text>
                    </View>
                  ) : insuranceUploadedUrl ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image
                        source={{ uri: insuranceUploadedUrl }}
                        style={styles.uploadedDocThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.uploadedCheckOverlay}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#22C55E"
                        />
                        <Text style={styles.uploadedOverlayText}>
                          Insurance Document Synced
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadBoxInnerPill}>
                      <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                      <Text style={styles.uploadBoxInnerText}>
                        Choose Insurance Certificate
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.uploadGuidanceNote}>
                  We require a valid insurance certificate for your vehicle to
                  ensure rider and driver safety.
                </Text>

                <View style={styles.uploadActionRow}>
                  <TouchableOpacity
                    style={styles.reuploadButton}
                    onPress={() => setInsuranceUploadedUrl("")}
                  >
                    <Text style={styles.reuploadButtonText}>Clear</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitUploadButton}
                    onPress={handleValidateInsuranceStep}
                  >
                    <Text style={styles.submitUploadButtonText}>
                      Confirm & Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ---------------- STEP 5: CITIZENSHIP / NATIONAL ID ---------------- */}
            {stage === "step_citizenship" && (
              <View style={styles.stageContainer}>
                <Text style={styles.stepTracker}>Step 5 of 6</Text>
                <Text style={styles.uploadSectionHeading}>
                  Upload a photo of your National Identity Card or Citizenship
                </Text>

                {/* Front Photo */}
                <TouchableOpacity
                  style={[
                    styles.uploadBoxDashed,
                    citizenshipFrontUrl && styles.uploadBoxUploaded,
                  ]}
                  activeOpacity={0.8}
                  disabled={uploadingDoc === "citizenship_front"}
                  onPress={() =>
                    handlePickAndUploadDocument("citizenship_front")
                  }
                >
                  {uploadingDoc === "citizenship_front" ? (
                    <View style={styles.uploadingBoxInner}>
                      <ActivityIndicator size="small" color="#1E78E5" />
                      <Text style={styles.uploadingText}>
                        Uploading to Cloudinary...
                      </Text>
                    </View>
                  ) : citizenshipFrontUrl ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image
                        source={{ uri: citizenshipFrontUrl }}
                        style={styles.uploadedDocThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.uploadedCheckOverlay}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#22C55E"
                        />
                        <Text style={styles.uploadedOverlayText}>
                          Citizenship Front Synced
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadBoxInnerPill}>
                      <Ionicons name="cloud-upload" size={16} color="#FFFFFF" />
                      <Text style={styles.uploadBoxInnerText}>
                        Choose ID / Citizenship Front
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Back Photo */}
                <TouchableOpacity
                  style={[
                    styles.uploadBoxDashed,
                    citizenshipBackUrl && styles.uploadBoxUploaded,
                  ]}
                  activeOpacity={0.8}
                  disabled={uploadingDoc === "citizenship_back"}
                  onPress={() =>
                    handlePickAndUploadDocument("citizenship_back")
                  }
                >
                  {uploadingDoc === "citizenship_back" ? (
                    <View style={styles.uploadingBoxInner}>
                      <ActivityIndicator size="small" color="#1E78E5" />
                      <Text style={styles.uploadingText}>
                        Uploading to Cloudinary...
                      </Text>
                    </View>
                  ) : citizenshipBackUrl ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image
                        source={{ uri: citizenshipBackUrl }}
                        style={styles.uploadedDocThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.uploadedCheckOverlay}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#22C55E"
                        />
                        <Text style={styles.uploadedOverlayText}>
                          Citizenship Back Synced
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadBoxInnerPill}>
                      <Ionicons name="cloud-upload" size={16} color="#FFFFFF" />
                      <Text style={styles.uploadBoxInnerText}>
                        Choose ID / Citizenship Back
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.uploadGuidanceNote}>
                  We use this to verify your identity. It must match the name on
                  your license.
                </Text>

                <View style={styles.uploadActionRow}>
                  <TouchableOpacity
                    style={styles.reuploadButton}
                    onPress={() => {
                      setCitizenshipFrontUrl("");
                      setCitizenshipBackUrl("");
                    }}
                  >
                    <Text style={styles.reuploadButtonText}>Clear</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitUploadButton}
                    onPress={handleValidateCitizenshipStep}
                  >
                    <Text style={styles.submitUploadButtonText}>
                      Confirm & Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ---------------- STEP 6: NUMBER PLATE PHOTO ---------------- */}
            {stage === "step_plate" && (
              <View style={styles.stageContainer}>
                <Text style={styles.stepTracker}>Step 6 of 6</Text>
                <Text style={styles.uploadSectionHeading}>
                  Upload photos of your vehicle number plate
                </Text>

                {/* Front Photo Box */}
                <TouchableOpacity
                  style={[
                    styles.plateBoxWrapper,
                    plateFrontUrl && styles.uploadBoxUploaded,
                  ]}
                  activeOpacity={0.85}
                  disabled={uploadingDoc === "plate_front"}
                  onPress={() => handlePickAndUploadDocument("plate_front")}
                >
                  {uploadingDoc === "plate_front" ? (
                    <View style={styles.uploadingBoxInner}>
                      <ActivityIndicator size="small" color="#1E78E5" />
                      <Text style={styles.uploadingText}>
                        Uploading to Cloudinary...
                      </Text>
                    </View>
                  ) : plateFrontUrl ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image
                        source={{ uri: plateFrontUrl }}
                        style={styles.uploadedDocThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.uploadedCheckOverlay}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#22C55E"
                        />
                        <Text style={styles.uploadedOverlayText}>
                          Front Plate Synced
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadBoxInnerPill}>
                      <Ionicons name="camera" size={16} color="#FFFFFF" />
                      <Text style={styles.uploadBoxInnerText}>
                        Choose Vehicle Front Plate
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Back Photo Box */}
                <TouchableOpacity
                  style={[
                    styles.plateBoxWrapper,
                    plateBackUrl && styles.uploadBoxUploaded,
                  ]}
                  activeOpacity={0.85}
                  disabled={uploadingDoc === "plate_back"}
                  onPress={() => handlePickAndUploadDocument("plate_back")}
                >
                  {uploadingDoc === "plate_back" ? (
                    <View style={styles.uploadingBoxInner}>
                      <ActivityIndicator size="small" color="#1E78E5" />
                      <Text style={styles.uploadingText}>
                        Uploading to Cloudinary...
                      </Text>
                    </View>
                  ) : plateBackUrl ? (
                    <View style={styles.uploadedPreviewContainer}>
                      <Image
                        source={{ uri: plateBackUrl }}
                        style={styles.uploadedDocThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.uploadedCheckOverlay}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#22C55E"
                        />
                        <Text style={styles.uploadedOverlayText}>
                          Back Plate Synced
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadBoxInnerPill}>
                      <Ionicons name="camera" size={16} color="#FFFFFF" />
                      <Text style={styles.uploadBoxInnerText}>
                        Choose Vehicle Back Plate
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.uploadGuidanceNote}>
                  Please ensure your vehicle plate numbers and letters are
                  clearly visible and match your RC document.
                </Text>

                <View style={styles.uploadActionRow}>
                  <TouchableOpacity
                    style={styles.reuploadButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      setPlateFrontUrl("");
                      setPlateBackUrl("");
                    }}
                  >
                    <Text style={styles.reuploadButtonText}>Clear</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitUploadButton}
                    activeOpacity={0.85}
                    onPress={handleValidatePlateStep}
                  >
                    <Text style={styles.submitUploadButtonText}>
                      Confirm & Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}

      {/* Vehicle Type Dropdown Modal */}
      <Modal
        visible={showVehicleTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVehicleTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.vehicleTypeCard}>
            <View style={styles.vehicleTypeHeader}>
              <Text style={styles.vehicleTypeTitle}>Select Vehicle Type</Text>
              <TouchableOpacity
                onPress={() => setShowVehicleTypeModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#7A8D9E" />
              </TouchableOpacity>
            </View>

            {VEHICLE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.vehicleTypeRow,
                  vehicleType === type && styles.vehicleTypeRowSelected,
                ]}
                onPress={() => {
                  setVehicleType(type);
                  setShowVehicleTypeModal(false);
                }}
              >
                <Text
                  style={[
                    styles.vehicleTypeRowText,
                    vehicleType === type && styles.vehicleTypeRowTextSelected,
                  ]}
                >
                  {type}
                </Text>
                <Ionicons
                  name={
                    vehicleType === type
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={vehicleType === type ? "#1E78E5" : "#4A5D72"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Re-export alias in case existing code references BecomeDoctor
export { BecomeDriverScreen as BecomeDoctor };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
  },
  centeredLoading: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#CADDF7",
    fontSize: 14,
    fontWeight: "500",
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
  stageContainer: {
    width: "100%",
  },

  // Part A Inputs
  formSectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  optionalText: {
    color: "#7A8D9E",
    fontSize: 13,
    fontWeight: "400",
  },
  inputBox: {
    backgroundColor: "#051A34",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#102A4C",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputBoxWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#051A34",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#102A4C",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputField: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  radioLabel: {
    color: "#CADDF7",
    fontSize: 14,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Part B Hub Dashboard
  hubWelcomeTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  hubSubtitle: {
    color: "#7A8D9E",
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: 16,
  },
  progressBarRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0B2544",
  },
  progressSegmentActive: {
    backgroundColor: "#1E78E5",
  },
  stepsCountText: {
    color: "#1E78E5",
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 14,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#0F2A4C",
    marginBottom: 10,
  },
  stepTextCol: {
    flex: 1,
  },
  stepCardTitle: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },
  stepCardSub: {
    color: "#1E78E5",
    fontSize: 11,
    marginTop: 3,
  },
  uploadedCloudinaryTag: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  completedBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedBadgeText: {
    color: "#22C55E",
    fontSize: 12.5,
    fontWeight: "600",
  },

  // Form Steps
  stepTracker: {
    color: "#1E78E5",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  inputLabel: {
    color: "#CADDF7",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#102A4C",
  },
  dropdownInputText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },

  // Upload Styles
  uploadSectionHeading: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 16,
  },
  uploadBoxDashed: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#1E78E5",
    borderRadius: 12,
    backgroundColor: "#04142B",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  largeUploadBoxDashed: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#1E78E5",
    borderRadius: 12,
    backgroundColor: "#04142B",
    height: 170,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  uploadBoxUploaded: {
    borderStyle: "solid",
    borderColor: "#22C55E",
    backgroundColor: "#04221A",
  },
  uploadBoxInnerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#061F40",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  uploadBoxInnerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  uploadingBoxInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  uploadingText: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "600",
  },
  uploadedPreviewContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  uploadedDocThumbnail: {
    width: "100%",
    height: "100%",
  },
  uploadedCheckOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 11, 24, 0.85)",
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  uploadedOverlayText: {
    color: "#22C55E",
    fontSize: 11,
    fontWeight: "700",
  },
  uploadGuidanceNote: {
    color: "#7A8D9E",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  uploadActionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  reuploadButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E78E5",
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  reuploadButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
  submitUploadButton: {
    flex: 1,
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  submitUploadButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },

  // ---------------- Status Screens (Waiting, Approved, Rejected) ----------------
  statusScreenContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statusIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E1A04",
    borderWidth: 2,
    borderColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18,
  },
  underReviewTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 28,
  },
  underReviewSubtitle: {
    color: "#CADDF7",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 320,
  },
  waitingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  amberPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
  },
  waitingBadgeText: {
    color: "#FBBF24",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  approvedBadgeText: {
    color: "#34D399",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  rejectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  rejectedBadgeText: {
    color: "#F87171",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  applicationCard: {
    width: "100%",
    backgroundColor: "#051A34",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#102A4C",
    padding: 16,
    marginTop: 22,
    marginBottom: 20,
  },
  appCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appCardHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  pendingStatusPill: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingStatusText: {
    color: "#F59E0B",
    fontSize: 10.5,
    fontWeight: "700",
  },
  appCardDivider: {
    height: 1,
    backgroundColor: "#0E2849",
    marginVertical: 12,
  },
  appCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  appCardLabel: {
    color: "#7A8D9E",
    fontSize: 12,
  },
  appCardValue: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "60%",
  },
  rejectionReasonBox: {
    width: "100%",
    backgroundColor: "#290808",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7F1D1D",
    padding: 14,
    marginTop: 18,
  },
  rejectionReasonTitle: {
    color: "#FCA5A5",
    fontSize: 11.5,
    fontWeight: "700",
    marginBottom: 4,
  },
  rejectionReasonText: {
    color: "#FEE2E2",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
  },
  refreshStatusBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    paddingVertical: 13,
    width: "100%",
    maxWidth: 320,
    marginBottom: 10,
  },
  refreshStatusBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
  backHomeBtn: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  backHomeBtnText: {
    color: "#7A8D9E",
    fontSize: 13.5,
    fontWeight: "500",
  },

  plateBoxWrapper: {
    width: "100%",
    height: 135,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1E78E5",
    borderStyle: "dashed",
    backgroundColor: "#071B36",
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  plateImagePreview: {
    width: "100%",
    height: "100%",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  vehicleTypeCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#071B36",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  vehicleTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  vehicleTypeTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  vehicleTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#0F2E59",
  },
  vehicleTypeRowSelected: {
    backgroundColor: "#0B2B52",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  vehicleTypeRowText: {
    color: "#CADDF7",
    fontSize: 14.5,
    fontWeight: "500",
  },
  vehicleTypeRowTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
