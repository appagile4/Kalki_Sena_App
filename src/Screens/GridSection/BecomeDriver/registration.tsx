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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";

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
  | "completed";

const VEHICLE_TYPES = ["Car", "Bike", "Scooter", "Taxi"];

export default function BecomeDriverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Active Flow Stage
  const [stage, setStage] = useState<FlowStage>("dob_gender");

  // Profile info (Part A)
  const [dob, setDob] = useState("01/01/2000");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [rideCity, setRideCity] = useState("");

  // Step 1: Vehicle Details
  const [vehicleType, setVehicleType] = useState("Car");
  const [vehicleMake, setVehicleMake] = useState("Toyota");
  const [vehicleModel, setVehicleModel] = useState("Pulsar 150");
  const [manufactureYear, setManufactureYear] = useState("2022");
  const [vehicleColor, setVehicleColor] = useState("White");
  const [seatCount, setSeatCount] = useState("4");
  const [licensePlate, setLicensePlate] = useState("BA-2-PA-1234");
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

  // Upload States for Steps 2 to 6
  const [licenseFront, setLicenseFront] = useState<boolean>(false);
  const [licenseBack, setLicenseBack] = useState<boolean>(false);
  const [rcUploaded, setRcUploaded] = useState<boolean>(false);
  const [insuranceUploaded, setInsuranceUploaded] = useState<boolean>(false);
  const [citizenshipFront, setCitizenshipFront] = useState<boolean>(false);
  const [citizenshipBack, setCitizenshipBack] = useState<boolean>(false);
  const [plateFront, setPlateFront] = useState<boolean>(true);
  const [plateBack, setPlateBack] = useState<boolean>(true);

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
      case "completed":
        router.replace("/Home" as any);
        break;
    }
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

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
      {stage !== "completed" && (
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

      {stage === "completed" ? (
        <TouchableOpacity
          style={[
            styles.underReviewScreen,
            {
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
          activeOpacity={1}
          onPress={() => router.replace("/Home" as any)}
        >
          <View style={styles.underReviewContent}>
            <Text style={styles.underReviewTitle}>
              Your details have been submitted and is{"\n"}under review
            </Text>
            <Text style={styles.underReviewSubtitle}>
              You will be notified with application status{"\n"}or check the status by going to the{" "}
              <Text
                style={styles.settingsLink}
                onPress={() => router.replace("/Home" as any)}
              >
                Settings
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
        {/* ========================================================= */}
        {/* PART A - SCREEN 1: Date of Birth & Gender                 */}
        {/* ========================================================= */}
        {stage === "dob_gender" && (
          <View style={styles.stageContainer}>
            <Text style={styles.formSectionTitle}>Date of Birth</Text>
            <View style={styles.inputBoxWithIcon}>
              <TextInput
                style={styles.inputField}
                value={dob}
                onChangeText={setDob}
                placeholder="dd/mm/yyyy"
                placeholderTextColor="#7A8D9E"
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
                  name={gender === item ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={gender === item ? "#3087E5" : "#4A5D72"}
                />
                <Text style={styles.radioLabel}>{item}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 28 }]}
              activeOpacity={0.85}
              onPress={() => setStage("email")}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* PART A - SCREEN 2: Enter your Email                       */}
        {/* ========================================================= */}
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
              onPress={() => setStage("member_id")}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* PART A - SCREEN 3: Enter your Member ID (optional)        */}
        {/* ========================================================= */}
        {stage === "member_id" && (
          <View style={styles.stageContainer}>
            <Text style={styles.formSectionTitle}>
              Enter your Member ID <Text style={styles.optionalText}>(optional)</Text>
            </Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputField}
                value={memberId}
                onChangeText={setMemberId}
                placeholder="City name"
                placeholderTextColor="#7A8D9E"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 24 }]}
              activeOpacity={0.85}
              onPress={() => setStage("city")}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* PART A - SCREEN 4: City you want to ride                  */}
        {/* ========================================================= */}
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
                placeholder="City name"
                placeholderTextColor="#7A8D9E"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 24 }]}
              activeOpacity={0.85}
              onPress={() => setStage("hub")}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* PART B - SCREEN HUB: Welcome, Subhodip / 6 Steps Dashboard*/}
        {/* ========================================================= */}
        {stage === "hub" && (
          <View style={styles.stageContainer}>
            <Text style={styles.hubWelcomeTitle}>Welcome, Subhodip</Text>
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

            <Text style={styles.stepsCountText}>6 Steps</Text>

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
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
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
              </View>
              {completedSteps[2] ? (
                <View style={styles.completedBadgeRow}>
                  <Text style={styles.completedBadgeText}>Completed</Text>
                  <Ionicons name="checkmark" size={16} color="#22C55E" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
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
              </View>
              {completedSteps[3] ? (
                <View style={styles.completedBadgeRow}>
                  <Text style={styles.completedBadgeText}>Completed</Text>
                  <Ionicons name="checkmark" size={16} color="#22C55E" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
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
              </View>
              {completedSteps[4] ? (
                <View style={styles.completedBadgeRow}>
                  <Text style={styles.completedBadgeText}>Completed</Text>
                  <Ionicons name="checkmark" size={16} color="#22C55E" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
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
              </View>
              {completedSteps[5] ? (
                <View style={styles.completedBadgeRow}>
                  <Text style={styles.completedBadgeText}>Completed</Text>
                  <Ionicons name="checkmark" size={16} color="#22C55E" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
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
              </View>
              {completedSteps[6] ? (
                <View style={styles.completedBadgeRow}>
                  <Text style={styles.completedBadgeText}>Completed</Text>
                  <Ionicons name="checkmark" size={16} color="#22C55E" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              )}
            </TouchableOpacity>

            {/* Finish Button when all are completed */}
            {completedCount === 6 && (
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 24 }]}
                activeOpacity={0.85}
                onPress={() => setStage("completed")}
              >
                <Text style={styles.primaryButtonText}>
                  Submit Application
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 1 FORM: Vehicle Details                              */}
        {/* ========================================================= */}
        {stage === "step_vehicle" && (
          <View style={styles.stageContainer}>
            <Text style={styles.stepTracker}>Step 1 of 6</Text>

            <Text style={styles.inputLabel}>Vehicle Type</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              activeOpacity={0.8}
              onPress={() => setShowVehicleTypeModal(true)}
            >
              <Text style={styles.dropdownInputText}>{vehicleType}</Text>
              <Ionicons name="chevron-down" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Vehicle Make</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputField}
                value={vehicleMake}
                onChangeText={setVehicleMake}
                placeholder="e.g Toyota"
                placeholderTextColor="#7A8D9E"
              />
            </View>

            <Text style={styles.inputLabel}>Vehicle Model</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputField}
                value={vehicleModel}
                onChangeText={setVehicleModel}
                placeholder="e.g Pulsar 150"
                placeholderTextColor="#7A8D9E"
              />
            </View>

            <Text style={styles.inputLabel}>Year of Manufacture</Text>
            <View style={styles.inputBoxWithIcon}>
              <TextInput
                style={styles.inputField}
                value={manufactureYear}
                onChangeText={setManufactureYear}
                placeholder="dd/mm/yyyy"
                placeholderTextColor="#7A8D9E"
              />
              <Ionicons name="calendar-outline" size={18} color="#7A8D9E" />
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.halfCol}>
                <Text style={styles.inputLabel}>Color</Text>
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
                <Text style={styles.inputLabel}>Number of Seats</Text>
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

            <Text style={styles.inputLabel}>License Plate Number</Text>
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
              onPress={() => {
                setCompletedSteps((prev) => ({ ...prev, 1: true }));
                setStage("hub");
              }}
            >
              <Text style={styles.primaryButtonText}>Next Step</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 2 FORM: Driving License                              */}
        {/* ========================================================= */}
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
                licenseFront && styles.uploadBoxUploaded,
              ]}
              activeOpacity={0.8}
              onPress={() => setLicenseFront(!licenseFront)}
            >
              <View style={styles.uploadBoxInnerPill}>
                <Ionicons
                  name={licenseFront ? "checkmark-circle" : "arrow-up"}
                  size={16}
                  color={licenseFront ? "#22C55E" : "#FFFFFF"}
                />
                <Text style={styles.uploadBoxInnerText}>
                  {licenseFront ? "Front Uploaded" : "Front"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Back Upload Box */}
            <TouchableOpacity
              style={[
                styles.uploadBoxDashed,
                licenseBack && styles.uploadBoxUploaded,
              ]}
              activeOpacity={0.8}
              onPress={() => setLicenseBack(!licenseBack)}
            >
              <View style={styles.uploadBoxInnerPill}>
                <Ionicons
                  name={licenseBack ? "checkmark-circle" : "arrow-up"}
                  size={16}
                  color={licenseBack ? "#22C55E" : "#FFFFFF"}
                />
                <Text style={styles.uploadBoxInnerText}>
                  {licenseBack ? "Back Uploaded" : "Back"}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.uploadGuidanceNote}>
              Upload a valid, non-expired driver's license that matches your name
              and vehicle.
            </Text>

            <View style={styles.uploadActionRow}>
              <TouchableOpacity
                style={styles.reuploadButton}
                onPress={() => {
                  setLicenseFront(false);
                  setLicenseBack(false);
                }}
              >
                <Text style={styles.reuploadButtonText}>Re-upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitUploadButton}
                onPress={() => {
                  setLicenseFront(true);
                  setLicenseBack(true);
                  setCompletedSteps((prev) => ({ ...prev, 2: true }));
                  setStage("hub");
                }}
              >
                <Text style={styles.submitUploadButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 3 FORM: Registration Certificate (RC)                */}
        {/* ========================================================= */}
        {stage === "step_rc" && (
          <View style={styles.stageContainer}>
            <Text style={styles.stepTracker}>Step 3 of 6</Text>
            <Text style={styles.uploadSectionHeading}>
              Upload your Vehicle Registration Certificate
            </Text>

            <TouchableOpacity
              style={[
                styles.largeUploadBoxDashed,
                rcUploaded && styles.uploadBoxUploaded,
              ]}
              activeOpacity={0.8}
              onPress={() => setRcUploaded(!rcUploaded)}
            >
              <View style={styles.uploadBoxInnerPill}>
                <Ionicons
                  name={rcUploaded ? "checkmark-circle" : "arrow-up"}
                  size={18}
                  color={rcUploaded ? "#22C55E" : "#FFFFFF"}
                />
                <Text style={styles.uploadBoxInnerText}>
                  {rcUploaded ? "RC Document Uploaded" : "Upload"}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.uploadGuidanceNote}>
              This document proves that your vehicle is legally registered and
              road-ready.
            </Text>

            <View style={styles.uploadActionRow}>
              <TouchableOpacity
                style={styles.reuploadButton}
                onPress={() => setRcUploaded(false)}
              >
                <Text style={styles.reuploadButtonText}>Re-upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitUploadButton}
                onPress={() => {
                  setRcUploaded(true);
                  setCompletedSteps((prev) => ({ ...prev, 3: true }));
                  setStage("hub");
                }}
              >
                <Text style={styles.submitUploadButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 4 FORM: Vehicle Insurance Document                   */}
        {/* ========================================================= */}
        {stage === "step_insurance" && (
          <View style={styles.stageContainer}>
            <Text style={styles.stepTracker}>Step 4 of 6</Text>
            <Text style={styles.uploadSectionHeading}>
              Upload your Vehicle Insurance
            </Text>

            <TouchableOpacity
              style={[
                styles.largeUploadBoxDashed,
                insuranceUploaded && styles.uploadBoxUploaded,
              ]}
              activeOpacity={0.8}
              onPress={() => setInsuranceUploaded(!insuranceUploaded)}
            >
              <View style={styles.uploadBoxInnerPill}>
                <Ionicons
                  name={insuranceUploaded ? "checkmark-circle" : "arrow-up"}
                  size={18}
                  color={insuranceUploaded ? "#22C55E" : "#FFFFFF"}
                />
                <Text style={styles.uploadBoxInnerText}>
                  {insuranceUploaded ? "Insurance Uploaded" : "Upload"}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.uploadGuidanceNote}>
              We require a valid insurance certificate for your vehicle to
              ensure rider and driver safety.
            </Text>

            <View style={styles.uploadActionRow}>
              <TouchableOpacity
                style={styles.reuploadButton}
                onPress={() => setInsuranceUploaded(false)}
              >
                <Text style={styles.reuploadButtonText}>Re-upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitUploadButton}
                onPress={() => {
                  setInsuranceUploaded(true);
                  setCompletedSteps((prev) => ({ ...prev, 4: true }));
                  setStage("hub");
                }}
              >
                <Text style={styles.submitUploadButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 5 FORM: National Identity Card or Citizenship        */}
        {/* ========================================================= */}
        {stage === "step_citizenship" && (
          <View style={styles.stageContainer}>
            <Text style={styles.stepTracker}>Step 5 of 6</Text>
            <Text style={styles.uploadSectionHeading}>
              Upload a photo of your National Identity Card or Citizenship
            </Text>

            <TouchableOpacity
              style={[
                styles.uploadBoxDashed,
                citizenshipFront && styles.uploadBoxUploaded,
              ]}
              activeOpacity={0.8}
              onPress={() => setCitizenshipFront(!citizenshipFront)}
            >
              <View style={styles.uploadBoxInnerPill}>
                <Ionicons
                  name={citizenshipFront ? "checkmark-circle" : "arrow-up"}
                  size={16}
                  color={citizenshipFront ? "#22C55E" : "#FFFFFF"}
                />
                <Text style={styles.uploadBoxInnerText}>
                  {citizenshipFront ? "Front Uploaded" : "Front"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.uploadBoxDashed,
                citizenshipBack && styles.uploadBoxUploaded,
              ]}
              activeOpacity={0.8}
              onPress={() => setCitizenshipBack(!citizenshipBack)}
            >
              <View style={styles.uploadBoxInnerPill}>
                <Ionicons
                  name={citizenshipBack ? "checkmark-circle" : "arrow-up"}
                  size={16}
                  color={citizenshipBack ? "#22C55E" : "#FFFFFF"}
                />
                <Text style={styles.uploadBoxInnerText}>
                  {citizenshipBack ? "Back Uploaded" : "Back"}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.uploadGuidanceNote}>
              We use this to verify your identity. It must match the name on
              your license. Please click a clear photo and avoid using flash.
            </Text>

            <View style={styles.uploadActionRow}>
              <TouchableOpacity
                style={styles.reuploadButton}
                onPress={() => {
                  setCitizenshipFront(false);
                  setCitizenshipBack(false);
                }}
              >
                <Text style={styles.reuploadButtonText}>Re-upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitUploadButton}
                onPress={() => {
                  setCitizenshipFront(true);
                  setCitizenshipBack(true);
                  setCompletedSteps((prev) => ({ ...prev, 5: true }));
                  setStage("hub");
                }}
              >
                <Text style={styles.submitUploadButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 6 FORM: Number Plate Image                           */}
        {/* ========================================================= */}
        {stage === "step_plate" && (
          <View style={styles.stageContainer}>
            <Text style={styles.stepTracker}>Step 6 of 6</Text>
            <Text style={styles.uploadSectionHeading}>
              Upload a photo of your vehicle with number plate
            </Text>

            {/* Front Photo Box */}
            <TouchableOpacity
              style={[
                styles.plateBoxWrapper,
                !plateFront && styles.uploadBoxDashed,
              ]}
              activeOpacity={0.85}
              onPress={() => setPlateFront(!plateFront)}
            >
              {plateFront ? (
                <Image
                  source={require("../../../../assets/images/plate_front.png")}
                  style={styles.plateImagePreview}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.uploadBoxInnerPill}>
                  <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
                  <Text style={styles.uploadBoxInnerText}>Front</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Back Photo Box */}
            <TouchableOpacity
              style={[
                styles.plateBoxWrapper,
                !plateBack && styles.uploadBoxDashed,
              ]}
              activeOpacity={0.85}
              onPress={() => setPlateBack(!plateBack)}
            >
              {plateBack ? (
                <Image
                  source={require("../../../../assets/images/plate_back.png")}
                  style={styles.plateImagePreview}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.uploadBoxInnerPill}>
                  <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
                  <Text style={styles.uploadBoxInnerText}>Back</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.uploadGuidanceNote}>
              We use this to verify your identity. It must match the name on
              your license. Please click a clear photo and avoid using flash .
            </Text>

            <View style={styles.uploadActionRow}>
              <TouchableOpacity
                style={styles.reuploadButton}
                activeOpacity={0.8}
                onPress={() => {
                  setPlateFront(false);
                  setPlateBack(false);
                }}
              >
                <Text style={styles.reuploadButtonText}>Re-upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitUploadButton}
                activeOpacity={0.85}
                onPress={() => {
                  setPlateFront(true);
                  setPlateBack(true);
                  setCompletedSteps((prev) => ({ ...prev, 6: true }));
                  setStage("completed");
                }}
              >
                <Text style={styles.submitUploadButtonText}>Submit</Text>
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
              <Text style={styles.vehicleTypeTitle}>Vehicle Type</Text>
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
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  largeUploadBoxDashed: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#1E78E5",
    borderRadius: 12,
    backgroundColor: "#04142B",
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  uploadBoxUploaded: {
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

  // Under Review / Completed Full Screen
  underReviewScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  underReviewContent: {
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 340,
  },
  underReviewTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 28,
  },
  underReviewSubtitle: {
    color: "#CADDF7",
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 16,
  },
  settingsLink: {
    color: "#1E78E5",
    fontWeight: "700",
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

  // Completed State
  completedContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  completedSuccessBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1E78E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  completedTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  completedSubtitle: {
    color: "#CADDF7",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
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
