import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  logoutUser,
  updateProfileThunk,
  uploadAvatarThunk,
} from "../../redux/slices/authSlice";

// Current Active Sub-View
type ProfileView =
  | "main"
  | "view_profile"
  | "edit_profile"
  | "documents"
  | "driving_preferences"
  | "ride_activity"
  | "saved_addresses"
  | "settings"
  | "notifications_promotions";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Navigation Sub-view
  const [currentView, setCurrentView] = useState<ProfileView>("main");

  // Profile Data State
  const [profileData, setProfileData] = useState({
    name: user?.fullName || "John Deo",
    phone: user?.phone || "+977 9800000000",
    memberId: user?._id ? user._id.slice(-8).toUpperCase() : "123-456-789",
    fullName: user?.fullName || "Alex Turner",
    email: user?.email || "alex.turner@example.com",
    gender: user?.gender || "Male",
    dob: user?.dob || "14/06/1995",
    rating: "4.8",
    tripsCompleted: "50 trips over a month",
    acceptanceRate: "80%",
    cancellationRate: "20%",
  });

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        gender: user.gender || prev.gender,
        dob: user.dob || prev.dob,
        memberId: user._id ? user._id.slice(-8).toUpperCase() : prev.memberId,
      }));
      setEditName(user.fullName || "");
      setEditEmail(user.email || "");
      setEditDob(user.dob || "");
    }
  }, [user]);

  const currentAvatarSource = user?.avatar
    ? { uri: user.avatar }
    : require("../../../assets/images/avatar.png");

  // Handlers for picking profile avatar via Camera or Gallery
  const pickAvatarImage = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Permission Required",
          `Please grant ${useCamera ? "camera" : "gallery"} permissions to update your profile photo.`,
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Data = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        setIsUploadingAvatar(true);
        try {
          await dispatch(
            uploadAvatarThunk({
              imageSource: base64Data,
              token,
            }),
          ).unwrap();

          Alert.alert(
            "Success",
            "Profile photo updated successfully!",
          );
        } catch (uploadErr: any) {
          console.log("Upload error:", uploadErr);
          Alert.alert(
            "Upload Result",
            typeof uploadErr === "string"
              ? uploadErr
              : "Could not upload avatar to Cloudinary.",
          );
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (err) {
      Alert.alert("Error", "Could not pick image.");
    }
  };

  const handleEditAvatarPress = () => {
    Alert.alert("Profile Photo", "Choose an option to update photo", [
      { text: "Take Photo", onPress: () => pickAvatarImage(true) },
      { text: "Choose from Gallery", onPress: () => pickAvatarImage(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Edit Profile Form State
  const [editName, setEditName] = useState(profileData.fullName);
  const [editPhone, setEditPhone] = useState("9812345678");
  const [editCountryCode, setEditCountryCode] = useState("+977");
  const [editEmail, setEditEmail] = useState(profileData.email);
  const [editGender, setEditGender] = useState<"Male" | "Female" | "Other">(
    "Male",
  );
  const [editDob, setEditDob] = useState(profileData.dob);

  // Driving Preferences State
  const [acceptCash, setAcceptCash] = useState(false);
  const [autoAccept, setAutoAccept] = useState(true);
  const [longDistance, setLongDistance] = useState(false);
  const [excludeLowRated, setExcludeLowRated] = useState(false);
  const [preferredNav, setPreferredNav] = useState<"Google Maps" | "Maps">(
    "Google Maps",
  );

  // Notifications & Promotions State
  const [notifPush, setNotifPush] = useState(false);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifWhatsapp, setNotifWhatsapp] = useState(false);

  // Ride Activity Week state
  const [rideWeek, setRideWeek] = useState<"empty" | "active">("active");

  // Vehicles state
  const [selectedVehicle, setSelectedVehicle] = useState("Hyundai");

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState<
    "English" | "नेपाली"
  >("English");

  // Password change form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modals visibility
  const [showNavModal, setShowNavModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showAccountMgmtModal, setShowAccountMgmtModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // Handle Back
  const handleBack = () => {
    if (currentView === "edit_profile") {
      setCurrentView("view_profile");
    } else if (currentView !== "main") {
      setCurrentView("main");
    } else {
      router.back();
    }
  };

  // Save Edit Profile
  const handleSaveProfile = async () => {
    const fullPhone = `${editCountryCode} ${editPhone}`;
    setProfileData((prev) => ({
      ...prev,
      fullName: editName,
      email: editEmail,
      gender: editGender,
      dob: editDob,
      phone: fullPhone,
    }));

    if (token) {
      try {
        await dispatch(
          updateProfileThunk({
            data: {
              fullName: editName,
              phone: fullPhone,
              gender: editGender,
              dob: editDob,
            },
            token,
          }),
        ).unwrap();
      } catch (err) {
        console.warn("Could not sync profile to MongoDB:", err);
      }
    }

    Alert.alert("Profile Updated", "Your Updated Successfully.");
    setCurrentView("view_profile");
  };

  // Save Preferences
  const handleSavePreferences = () => {
    Alert.alert("Saved", "Driving preferences have been successfully updated.");
    setCurrentView("main");
  };

  // Logout handler
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
            } catch {
              // Handled
            }
            router.replace("/Auth/login" as any);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ========================================================= */}
      {/* 1. MAIN SCREEN: PROFILE SETTINGS (SIDEBAR)                */}
      {/* ========================================================= */}
      {currentView === "main" && (
        <View style={styles.flexOne}>
          {/* Header */}
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile Settings</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* User Profile Card */}
            <TouchableOpacity
              style={styles.userBannerCard}
              activeOpacity={0.85}
              onPress={() => setCurrentView("view_profile")}
            >
              <View style={styles.userBannerTextCol}>
                <Text style={styles.userBannerName}>{profileData.name}</Text>
                <Text style={styles.userBannerLink}>View Profile</Text>
              </View>

              <View style={styles.userAvatarContainer}>
                <Image
                  source={currentAvatarSource}
                  style={styles.bannerAvatar}
                  contentFit="cover"
                />
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={10} color="#FBBF24" />
                  <Text style={styles.ratingBadgeText}>
                    {profileData.rating}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Menu Items List */}
            <View style={styles.menuContainer}>
              {/* Documents */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() => setCurrentView("documents")}
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#CADDF7"
                  />
                  <Text style={styles.menuLabel}>Documents</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Driving preferences */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() => setCurrentView("driving_preferences")}
              >
                <View style={styles.menuLeft}>
                  <MaterialCommunityIcons
                    name="steering"
                    size={20}
                    color="#CADDF7"
                  />
                  <Text style={styles.menuLabel}>Driving preferences</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Notifications */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() => setCurrentView("notifications_promotions")}
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#CADDF7"
                  />
                  <Text style={styles.menuLabel}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Payments */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() => router.push("/Home/checkout" as any)}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name="card-outline" size={20} color="#CADDF7" />
                  <Text style={styles.menuLabel}>Payments</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Ride activity */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() => setCurrentView("ride_activity")}
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name="car-sport-outline"
                    size={20}
                    color="#CADDF7"
                  />
                  <Text style={styles.menuLabel}>Ride activity</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Saved addresses */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() => setCurrentView("saved_addresses")}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name="bookmark-outline" size={20} color="#CADDF7" />
                  <Text style={styles.menuLabel}>Saved addresses</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Account Management */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() => setShowAccountMgmtModal(true)}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name="person-outline" size={20} color="#CADDF7" />
                  <Text style={styles.menuLabel}>Account Management</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Account Settings */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() => setCurrentView("settings")}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name="settings-outline" size={20} color="#CADDF7" />
                  <Text style={styles.menuLabel}>Account Settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Privacy policy */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() =>
                  Alert.alert(
                    "Privacy Policy",
                    "Kalki Sena Drive is committed to safeguarding your personal data, privacy, and trip security according to Nepal data protection regulations.",
                  )
                }
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#CADDF7"
                  />
                  <Text style={styles.menuLabel}>Privacy policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Emergency contacts */}
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                onPress={() => setShowEmergencyModal(true)}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name="call-outline" size={20} color="#CADDF7" />
                  <Text style={styles.menuLabel}>Emergency contacts</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
              </TouchableOpacity>

              {/* Logout */}
              <TouchableOpacity
                style={[styles.menuRow, { borderBottomWidth: 0 }]}
                activeOpacity={0.75}
                onPress={handleLogout}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={[styles.menuLabel, { color: "#EF4444" }]}>
                    Logout
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* ========================================================= */}
      {/* 2. SUB-VIEW: VIEW PROFILE                                 */}
      {/* ========================================================= */}
      {currentView === "view_profile" && (
        <View style={styles.flexOne}>
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>View profile</Text>
            <Text style={styles.headerRightInfo}>
              M-Id : {profileData.memberId}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar & Header */}
            <View style={styles.viewProfileTop}>
              <Image
                source={currentAvatarSource}
                style={styles.viewProfileAvatar}
                contentFit="cover"
              />
              <Text style={styles.viewProfileName}>{profileData.name}</Text>
              <Text style={styles.viewProfilePhone}>{profileData.phone}</Text>

              <TouchableOpacity
                style={styles.editProfileButtonPill}
                activeOpacity={0.8}
                onPress={() => setCurrentView("edit_profile")}
              >
                <Ionicons name="create-outline" size={14} color="#CADDF7" />
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Read-Only Info Fields */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldCardLabel}>Full Name</Text>
              <Text style={styles.fieldCardValue}>{profileData.fullName}</Text>
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldCardLabel}>Email</Text>
              <Text style={styles.fieldCardValue}>{profileData.email}</Text>
            </View>

            <View style={styles.rowTwoCols}>
              <View style={[styles.fieldCard, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.fieldCardLabel}>Gender</Text>
                <Text style={styles.fieldCardValue}>{profileData.gender}</Text>
              </View>
              <View style={[styles.fieldCard, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.fieldCardLabel}>Date of birth</Text>
                <Text style={styles.fieldCardValue}>{profileData.dob}</Text>
              </View>
            </View>

            {/* Trips Completed Stats */}
            <View style={styles.statsSection}>
              <Text style={styles.statsSubtitle}>Trip completed</Text>
              <Text style={styles.statsBigText}>
                {profileData.tripsCompleted}
              </Text>

              <View style={styles.rowTwoCols}>
                <View style={styles.statRateBox}>
                  <Text style={styles.statRateLabel}>Acceptance rate</Text>
                  <Text style={styles.statRateValue}>
                    {profileData.acceptanceRate}
                  </Text>
                </View>
                <View style={styles.statRateBox}>
                  <Text style={styles.statRateLabel}>Cancellation rate</Text>
                  <Text style={styles.statRateValue}>
                    {profileData.cancellationRate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Review & Rating */}
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionHeading}>Review & Rating</Text>

              <View style={styles.reviewCard}>
                <View style={styles.reviewTextCol}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons key={i} name="star" size={14} color="#FBBF24" />
                    ))}
                  </View>
                  <Text style={styles.reviewComment}>Good</Text>
                </View>
                <Image
                  source={require("../../../assets/images/avatar.png")}
                  style={styles.reviewerAvatar}
                  contentFit="cover"
                />
              </View>

              <View style={styles.reviewCard}>
                <View style={styles.reviewTextCol}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons key={i} name="star" size={14} color="#FBBF24" />
                    ))}
                  </View>
                  <Text style={styles.reviewComment}>Great</Text>
                </View>
                <Image
                  source={require("../../../assets/images/avatar.png")}
                  style={styles.reviewerAvatar}
                  contentFit="cover"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* ========================================================= */}
      {/* 3. SUB-VIEW: EDIT PROFILE                                 */}
      {/* ========================================================= */}
      {currentView === "edit_profile" && (
        <View style={styles.flexOne}>
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar with Camera badge */}
            <View style={styles.editAvatarWrapper}>
              <View style={styles.avatarBorderLarge}>
                {isUploadingAvatar ? (
                  <View
                    style={[
                      styles.editAvatar,
                      { justifyContent: "center", alignItems: "center" },
                    ]}
                  >
                    <ActivityIndicator size="small" color="#2079F2" />
                  </View>
                ) : (
                  <Image
                    source={currentAvatarSource}
                    style={styles.editAvatar}
                    contentFit="cover"
                  />
                )}
              </View>
              <TouchableOpacity
                style={styles.cameraBadgeButton}
                activeOpacity={0.8}
                disabled={isUploadingAvatar}
                onPress={handleEditAvatarPress}
              >
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Full Name */}
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.textInputBox}>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Full Name"
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Phone Number with country code */}
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.phoneInputRow}>
              <TouchableOpacity
                style={styles.countryCodePill}
                onPress={() =>
                  Alert.alert(
                    "Country Code",
                    "Select code:\n+977 (Nepal)\n+91 (India)",
                  )
                }
              >
                <Text style={styles.countryCodeText}>{editCountryCode}</Text>
                <Ionicons name="chevron-down" size={14} color="#CADDF7" />
              </TouchableOpacity>
              <View style={[styles.textInputBox, { flex: 1 }]}>
                <TextInput
                  style={styles.textInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="9812345678"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Email */}
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.textInputBox}>
              <TextInput
                style={styles.textInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="example@mail.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Gender Radio */}
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderRadioRow}>
              {(["Male", "Female", "Other"] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.radioItem}
                  onPress={() => setEditGender(g)}
                >
                  <Ionicons
                    name={
                      editGender === g ? "radio-button-on" : "radio-button-off"
                    }
                    size={20}
                    color={editGender === g ? "#1E78E5" : "#64748B"}
                  />
                  <Text style={styles.radioLabel}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date of birth */}
            <Text style={styles.inputLabel}>Date of birth</Text>
            <View style={styles.textInputBoxWithIcon}>
              <TextInput
                style={styles.textInput}
                value={editDob}
                onChangeText={setEditDob}
                placeholder="dd/mm/yyyy"
                placeholderTextColor="#64748B"
              />
              <Ionicons name="calendar-outline" size={18} color="#7A8D9E" />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveActionButton}
              activeOpacity={0.85}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveActionButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ========================================================= */}
      {/* 4. SUB-VIEW: DOCUMENTS                                    */}
      {/* ========================================================= */}
      {currentView === "documents" && (
        <View style={styles.flexOne}>
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Documents</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile photo */}
            <TouchableOpacity
              style={styles.documentItemCard}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert("Profile Photo", "Status: Verified & Approved ✓")
              }
            >
              <View style={styles.documentItemLeft}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.documentItemTitle}>Profile photo</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Citizenship */}
            <TouchableOpacity
              style={styles.documentItemCard}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert("Citizenship", "Status: Verified & Approved ✓")
              }
            >
              <View style={styles.documentItemLeft}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.documentItemTitle}>Citizenship</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Driving licence */}
            <TouchableOpacity
              style={styles.documentItemCard}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  "Driving Licence",
                  "Status: Submitted, currently under review by our safety team.",
                )
              }
            >
              <View style={styles.documentItemLeft}>
                <Ionicons name="time" size={20} color="#1E78E5" />
                <View style={styles.documentTextCol}>
                  <Text style={styles.documentItemTitle}>Driving licence</Text>
                  <Text style={styles.documentItemSubtext}>
                    Submitted, under review
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Vehicle Header */}
            <Text style={styles.vehicleDocHeader}>Honda City - 7AB5630TT</Text>

            {/* Vehicle registration certificate */}
            <TouchableOpacity
              style={styles.documentItemCard}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  "Vehicle Registration (RC)",
                  "Please re-upload a clear copy of your vehicle RC.",
                )
              }
            >
              <View style={styles.documentItemLeft}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <View style={styles.documentTextCol}>
                  <Text style={styles.documentItemTitle}>
                    Vehicle registration certificate
                  </Text>
                  <Text style={styles.documentItemErrorText}>
                    The document you submitted are invalid or incorrect, hence
                    wasn't approved. Please submit your valid documents.
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Vehicle insurance */}
            <TouchableOpacity
              style={styles.documentItemCard}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  "Vehicle Insurance",
                  "Please update your policy document.",
                )
              }
            >
              <View style={styles.documentItemLeft}>
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <View style={styles.documentTextCol}>
                  <Text style={styles.documentItemTitle}>
                    Vehicle insurance
                  </Text>
                  <Text style={styles.documentItemSubtext}>
                    Update your vehicle insurance
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Vehicle Number */}
            <TouchableOpacity
              style={styles.documentItemCard}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert("Vehicle Number", "Status: Submitted, under review")
              }
            >
              <View style={styles.documentItemLeft}>
                <Ionicons name="time" size={20} color="#1E78E5" />
                <View style={styles.documentTextCol}>
                  <Text style={styles.documentItemTitle}>Vehicle Number</Text>
                  <Text style={styles.documentItemSubtext}>
                    Submitted, under review
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ========================================================= */}
      {/* 5. SUB-VIEW: DRIVING PREFERENCES                          */}
      {/* ========================================================= */}
      {currentView === "driving_preferences" && (
        <View style={styles.flexOne}>
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Driving preferences</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Accept Cash */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="#CADDF7"
                />
                <Text style={styles.prefTitle}>Accept Cash</Text>
              </View>
              <Switch
                value={acceptCash}
                onValueChange={setAcceptCash}
                trackColor={{ false: "#1E293B", true: "#1E78E5" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Auto-accept Trips */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Ionicons name="person-outline" size={22} color="#CADDF7" />
                <Text style={styles.prefTitle}>Auto-accept Trips</Text>
              </View>
              <Switch
                value={autoAccept}
                onValueChange={setAutoAccept}
                trackColor={{ false: "#1E293B", true: "#1E78E5" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Long Distance Trips */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <MaterialCommunityIcons
                  name="road-variant"
                  size={22}
                  color="#CADDF7"
                />
                <View style={styles.prefTextCol}>
                  <Text style={styles.prefTitle}>Long Distance Trips</Text>
                  <Text style={styles.prefSubtext}>
                    Show the trip which will be more than 45min
                  </Text>
                </View>
              </View>
              <Switch
                value={longDistance}
                onValueChange={setLongDistance}
                trackColor={{ false: "#1E293B", true: "#1E78E5" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Exclude low-rated riders */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Ionicons name="star-outline" size={22} color="#CADDF7" />
                <View style={styles.prefTextCol}>
                  <Text style={styles.prefTitle}>Exclude low-rated riders</Text>
                  <Text style={styles.prefSubtext}>
                    Don't show request from riders with low-ratings
                  </Text>
                </View>
              </View>
              <Switch
                value={excludeLowRated}
                onValueChange={setExcludeLowRated}
                trackColor={{ false: "#1E293B", true: "#1E78E5" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Preferred Navigation */}
            <TouchableOpacity
              style={styles.prefRow}
              activeOpacity={0.8}
              onPress={() => setShowNavModal(true)}
            >
              <View style={styles.prefLeft}>
                <Ionicons name="navigate-outline" size={22} color="#CADDF7" />
                <View style={styles.prefTextCol}>
                  <Text style={styles.prefTitle}>Preferred Navigation</Text>
                  <Text style={styles.prefSubtext}>{preferredNav}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveActionButton, { marginTop: 40 }]}
              activeOpacity={0.85}
              onPress={handleSavePreferences}
            >
              <Text style={styles.saveActionButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ========================================================= */}
      {/* 6. SUB-VIEW: RIDE ACTIVITY                                */}
      {/* ========================================================= */}
      {currentView === "ride_activity" && (
        <View style={styles.flexOne}>
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ride activity</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Week Selector Bar */}
            <View style={styles.weekSelectorBar}>
              <TouchableOpacity
                onPress={() => setRideWeek("empty")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chevron-back" size={18} color="#1E78E5" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setRideWeek(rideWeek === "active" ? "empty" : "active")
                }
              >
                <Text style={styles.weekRangeText}>
                  {rideWeek === "active"
                    ? "Aug 17 - Aug 23"
                    : "Aug 10 - Aug 16"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRideWeek("active")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chevron-forward" size={18} color="#1E78E5" />
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.rideStatsRow}>
              <View style={styles.rideStatCol}>
                <Text style={styles.rideStatLabel}>Earnings</Text>
                <Text style={styles.rideStatVal}>
                  {rideWeek === "active" ? "Rs 5000" : "Rs 0"}
                </Text>
              </View>
              <View style={styles.rideStatDivider} />
              <View style={styles.rideStatCol}>
                <Text style={styles.rideStatLabel}>Online</Text>
                <Text style={styles.rideStatVal}>
                  {rideWeek === "active" ? "3 hrs 5 min" : "0 min"}
                </Text>
              </View>
              <View style={styles.rideStatDivider} />
              <View style={styles.rideStatCol}>
                <Text style={styles.rideStatLabel}>Rides</Text>
                <Text style={styles.rideStatVal}>
                  {rideWeek === "active" ? "20" : "0"}
                </Text>
              </View>
            </View>

            {/* Empty State */}
            {rideWeek === "empty" && (
              <View style={styles.emptyRideContainer}>
                <Text style={styles.emptyRideHeading}>
                  You have not take any rides this week
                </Text>
                <Text style={styles.emptyRideSub}>
                  Once you successfully complete a ride, all the ride activities
                  will be shown here.
                </Text>
              </View>
            )}

            {/* Active Populated Rides List */}
            {rideWeek === "active" && (
              <View style={styles.ridesListSection}>
                {/* Day 1: Sat, 17 Aug */}
                <View style={styles.dayGroupHeader}>
                  <Text style={styles.dayGroupTitle}>Sat, 17 Aug</Text>
                  <Text style={styles.dayGroupTotal}>500</Text>
                </View>

                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.rideItemRow}>
                    <View style={styles.rideItemLeft}>
                      <Ionicons
                        name="car-sport-outline"
                        size={18}
                        color="#CADDF7"
                      />
                      <View style={styles.rideItemDetails}>
                        <Text style={styles.rideItemDestination}>
                          Ride to Tinkune
                        </Text>
                        <Text style={styles.rideItemTime}>02:30 pm</Text>
                      </View>
                    </View>
                    <Text style={styles.rideItemFare}>Rs. 200</Text>
                  </View>
                ))}

                {/* Day 2: Sat, 20 Aug */}
                <View style={[styles.dayGroupHeader, { marginTop: 18 }]}>
                  <Text style={styles.dayGroupTitle}>Sat, 20 Aug</Text>
                  <Text style={styles.dayGroupTotal}>Rs.0</Text>
                </View>
                <View style={styles.noActivityRow}>
                  <Text style={styles.noActivityText}>No activity</Text>
                </View>

                {/* Day 3: Sat, 17 Aug */}
                <View style={[styles.dayGroupHeader, { marginTop: 18 }]}>
                  <Text style={styles.dayGroupTitle}>Sat, 17 Aug</Text>
                  <Text style={styles.dayGroupTotal}>500</Text>
                </View>
                <View style={styles.rideItemRow}>
                  <View style={styles.rideItemLeft}>
                    <Ionicons
                      name="car-sport-outline"
                      size={18}
                      color="#CADDF7"
                    />
                    <View style={styles.rideItemDetails}>
                      <Text style={styles.rideItemDestination}>
                        Ride to Tinkune
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.rideItemFare}>Rs. 200</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* ========================================================= */}
      {/* 7. SUB-VIEW: SAVED ADDRESS                                */}
      {/* ========================================================= */}
      {currentView === "saved_addresses" && (
        <View style={styles.flexOne}>
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Saved address</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {[1, 2].map((idx) => (
              <View key={idx} style={styles.savedAddressCard}>
                <View style={styles.savedAddressIconBox}>
                  <Ionicons name="location-sharp" size={18} color="#CADDF7" />
                </View>
                <Text style={styles.savedAddressText}>
                  Boudhanath Stupa, Boudha Main Road, Boudha Chowk, KTM
                </Text>
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() =>
                    Alert.alert(
                      "Address Options",
                      "Boudhanath Stupa, Boudha Main Road",
                      [
                        { text: "Edit" },
                        { text: "Delete", style: "destructive" },
                        { text: "Cancel", style: "cancel" },
                      ],
                    )
                  }
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    color="#7A8D9E"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ========================================================= */}
      {/* 8. SUB-VIEW: SETTINGS (ACCOUNT SETTINGS)                  */}
      {/* ========================================================= */}
      {currentView === "settings" && (
        <View style={styles.flexOne}>
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Change Password */}
            <TouchableOpacity
              style={styles.settingsRow}
              activeOpacity={0.8}
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={styles.settingsLeft}>
                <MaterialCommunityIcons
                  name="shield-key-outline"
                  size={20}
                  color="#CADDF7"
                />
                <Text style={styles.settingsLabel}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Language */}
            <TouchableOpacity
              style={styles.settingsRow}
              activeOpacity={0.8}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.settingsLeft}>
                <Ionicons name="globe-outline" size={20} color="#CADDF7" />
                <Text style={styles.settingsLabel}>Language</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Notifications & promotion */}
            <TouchableOpacity
              style={styles.settingsRow}
              activeOpacity={0.8}
              onPress={() => setCurrentView("notifications_promotions")}
            >
              <View style={styles.settingsLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#CADDF7"
                />
                <Text style={styles.settingsLabel}>
                  Notifications & promotion
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ========================================================= */}
      {/* 9. SUB-VIEW: NOTIFICATIONS & PROMOTIONS                   */}
      {/* ========================================================= */}
      {currentView === "notifications_promotions" && (
        <View style={styles.flexOne}>
          <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications & promotion</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.notifSectionTitle}>
              Promotion & notifications
            </Text>
            <Text style={styles.notifSectionSubtitle}>
              Receive updates about our newest promotions and special offers
            </Text>

            {/* Notifications switch */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#CADDF7"
                />
                <Text style={styles.prefTitle}>Notifications</Text>
              </View>
              <Switch
                value={notifPush}
                onValueChange={setNotifPush}
                trackColor={{ false: "#1E293B", true: "#1E78E5" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Email switch */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Ionicons name="mail-outline" size={20} color="#CADDF7" />
                <Text style={styles.prefTitle}>Email</Text>
              </View>
              <Switch
                value={notifEmail}
                onValueChange={setNotifEmail}
                trackColor={{ false: "#1E293B", true: "#1E78E5" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Whatsapp switch */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Ionicons name="logo-whatsapp" size={20} color="#CADDF7" />
                <Text style={styles.prefTitle}>Whatsapp</Text>
              </View>
              <Switch
                value={notifWhatsapp}
                onValueChange={setNotifWhatsapp}
                trackColor={{ false: "#1E293B", true: "#1E78E5" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
        </View>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SELECT NAVIGATION APP                            */}
      {/* ========================================================= */}
      <Modal
        visible={showNavModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNavModal(false)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={styles.modalContentCard}>
            <Text style={styles.modalHeaderTitle}>Select navigation app</Text>

            <TouchableOpacity
              style={styles.modalRadioRow}
              onPress={() => {
                setPreferredNav("Google Maps");
                setShowNavModal(false);
              }}
            >
              <View style={styles.modalRadioLeft}>
                <Image
                  source={require("../../../assets/images/map_preview.png")}
                  style={styles.modalAppIcon}
                  contentFit="contain"
                />
                <Text style={styles.modalRadioLabel}>Google Maps</Text>
              </View>
              <Ionicons
                name={
                  preferredNav === "Google Maps"
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={22}
                color={preferredNav === "Google Maps" ? "#1E78E5" : "#64748B"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalRadioRow}
              onPress={() => {
                setPreferredNav("Maps");
                setShowNavModal(false);
              }}
            >
              <View style={styles.modalRadioLeft}>
                <Ionicons name="map" size={22} color="#EF4444" />
                <Text style={styles.modalRadioLabel}>Maps</Text>
              </View>
              <Ionicons
                name={
                  preferredNav === "Maps"
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={22}
                color={preferredNav === "Maps" ? "#1E78E5" : "#64748B"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: EMERGENCY CALL (CALL "100")                       */}
      {/* ========================================================= */}
      <Modal
        visible={showEmergencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalContentCard, { alignItems: "center" }]}>
            <Text style={styles.modalEmergencyTitle}>Call "100"</Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalOutlineBtn}
                onPress={() => setShowEmergencyModal(false)}
              >
                <Text style={styles.modalOutlineBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSolidBtn}
                onPress={() => {
                  setShowEmergencyModal(false);
                  Alert.alert(
                    "Emergency Call",
                    "Connecting to Nepal Police Emergency Helpline 100...",
                  );
                }}
              >
                <Text style={styles.modalSolidBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: ACCOUNT MANAGEMENT SHEET                         */}
      {/* ========================================================= */}
      <Modal
        visible={showAccountMgmtModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountMgmtModal(false)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalHeaderTitle}>Account Management</Text>
              <TouchableOpacity
                onPress={() => setShowAccountMgmtModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#7A8D9E" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalActionItemRow}
              onPress={() => {
                setShowAccountMgmtModal(false);
                setShowDeleteConfirmModal(true);
              }}
            >
              <Ionicons
                name="person-remove-outline"
                size={20}
                color="#EF4444"
              />
              <Text style={styles.deleteAccountItemText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: DELETE ACCOUNT CONFIRMATION                      */}
      {/* ========================================================= */}
      <Modal
        visible={showDeleteConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmModal(false)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalContentCard, { alignItems: "center" }]}>
            <Image
              source={require("../../../assets/images/delete_account_ill.png")}
              style={styles.deleteAccountGraphic}
              contentFit="contain"
            />

            <Text style={styles.deleteConfirmTitle}>
              Are you sure to delete your account?
            </Text>
            <Text style={styles.deleteConfirmSub}>
              Your data will be deleted and can't be reused
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalOutlineBtn}
                onPress={() => setShowDeleteConfirmModal(false)}
              >
                <Text style={styles.modalOutlineBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSolidBtn}
                onPress={() => {
                  setShowDeleteConfirmModal(false);
                  Alert.alert(
                    "Account Deleted",
                    "Your account has been deleted.",
                    [
                      {
                        text: "OK",
                        onPress: () => router.replace("/Auth/login" as any),
                      },
                    ],
                  );
                }}
              >
                <Text style={styles.modalSolidBtnText}>Yes, Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: CHANGE PASSWORD                                  */}
      {/* ========================================================= */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalHeaderTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#7A8D9E" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputBox}>
              <TextInput
                style={styles.modalTextInput}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Old Password"
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </View>

            <View style={styles.modalInputBox}>
              <TextInput
                style={styles.modalTextInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </View>

            <View style={styles.modalInputBox}>
              <TextInput
                style={styles.modalTextInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                if (!newPassword || newPassword !== confirmPassword) {
                  Alert.alert("Error", "Passwords do not match.");
                  return;
                }
                setShowPasswordModal(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                Alert.alert(
                  "Password Changed",
                  "Your password was updated successfully.",
                );
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 6: CHANGE LANGUAGE                                  */}
      {/* ========================================================= */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalHeaderTitle}>Change Language</Text>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#7A8D9E" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalRadioRow}
              onPress={() => {
                setSelectedLanguage("English");
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.modalRadioLabel}>English</Text>
              <Ionicons
                name={
                  selectedLanguage === "English"
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={22}
                color={selectedLanguage === "English" ? "#1E78E5" : "#64748B"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalRadioRow}
              onPress={() => {
                setSelectedLanguage("नेपाली");
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.modalRadioLabel}>नेपाली</Text>
              <Ionicons
                name={
                  selectedLanguage === "नेपाली"
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={22}
                color={selectedLanguage === "नेपाली" ? "#1E78E5" : "#64748B"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 7: SELECT YOUR VEHICLE                              */}
      {/* ========================================================= */}
      <Modal
        visible={showVehicleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalHeaderTitle}>Select your vehicle</Text>
              <TouchableOpacity
                onPress={() => setShowVehicleModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#7A8D9E" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addVehicleRow}
              onPress={() => {
                setShowVehicleModal(false);
                router.push("/Home/becomedriver" as any);
              }}
            >
              <View style={styles.addVehicleLeft}>
                <Ionicons name="car-outline" size={20} color="#CADDF7" />
                <Text style={styles.addVehicleLabel}>Add vehicle</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalRadioRow}
              onPress={() => {
                setSelectedVehicle("Hyundai");
                setShowVehicleModal(false);
              }}
            >
              <View style={styles.modalRadioLeft}>
                <Ionicons name="car-outline" size={20} color="#CADDF7" />
                <Text style={styles.modalRadioLabel}>Hyundai</Text>
              </View>
              <Ionicons
                name={
                  selectedVehicle === "Hyundai"
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={22}
                color={selectedVehicle === "Hyundai" ? "#1E78E5" : "#64748B"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalRadioRow}
              onPress={() => {
                setSelectedVehicle("Maruti Suzuki");
                setShowVehicleModal(false);
              }}
            >
              <View style={styles.modalRadioLeft}>
                <Ionicons name="car-outline" size={20} color="#CADDF7" />
                <Text style={styles.modalRadioLabel}>Maruti Suzuki</Text>
              </View>
              <Ionicons
                name={
                  selectedVehicle === "Maruti Suzuki"
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={22}
                color={
                  selectedVehicle === "Maruti Suzuki" ? "#1E78E5" : "#64748B"
                }
              />
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
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // Header Bar
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  headerIconButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  headerRightSpacer: {
    width: 28,
  },
  headerRightInfo: {
    color: "#CADDF7",
    fontSize: 12,
    fontWeight: "500",
  },

  // Main Profile Settings User Card
  userBannerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0A2540",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  userBannerTextCol: {
    flex: 1,
  },
  userBannerName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  userBannerLink: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "600",
  },
  userAvatarContainer: {
    position: "relative",
  },
  bannerAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  ratingBadge: {
    position: "absolute",
    bottom: -2,
    right: -4,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#1E293B",
    gap: 3,
  },
  ratingBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  // Menu List
  menuContainer: {
    backgroundColor: "#051A34",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#0F2E59",
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#0A2447",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuLabel: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "500",
  },

  // View Profile Styles
  viewProfileTop: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 16,
  },
  viewProfileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#1E78E5",
  },
  viewProfileName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  viewProfilePhone: {
    color: "#8EA2C6",
    fontSize: 13,
    marginTop: 3,
  },
  editProfileButtonPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0A2540",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  editProfileButtonText: {
    color: "#CADDF7",
    fontSize: 12.5,
    fontWeight: "600",
  },
  fieldCard: {
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0F2E59",
    marginBottom: 10,
  },
  fieldCardLabel: {
    color: "#8EA2C6",
    fontSize: 11.5,
    fontWeight: "500",
    marginBottom: 4,
  },
  fieldCardValue: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "600",
  },
  rowTwoCols: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  statsSubtitle: {
    color: "#8EA2C6",
    fontSize: 12,
    textAlign: "center",
  },
  statsBigText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 12,
  },
  statRateBox: {
    flex: 1,
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#0F2E59",
    alignItems: "center",
    marginHorizontal: 4,
  },
  statRateLabel: {
    color: "#8EA2C6",
    fontSize: 12,
    marginBottom: 4,
  },
  statRateValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  reviewsSection: {
    marginTop: 6,
  },
  sectionHeading: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  reviewCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0F2E59",
    marginBottom: 8,
  },
  reviewTextCol: {
    gap: 4,
  },
  starsRow: {
    flexDirection: "row",
    gap: 3,
  },
  reviewComment: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "500",
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // Edit Profile Styles
  editAvatarWrapper: {
    alignItems: "center",
    marginVertical: 14,
    position: "relative",
  },
  avatarBorderLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "#1E78E5",
    overflow: "hidden",
  },
  editAvatar: {
    width: "100%",
    height: "100%",
  },
  cameraBadgeButton: {
    position: "absolute",
    bottom: 2,
    right: Dimensions.get("window").width / 2 - 46,
    backgroundColor: "#1E78E5",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#020b18",
  },
  inputLabel: {
    color: "#CADDF7",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },
  textInputBox: {
    backgroundColor: "#051A34",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0F2E59",
    paddingHorizontal: 14,
    height: 48,
    justifyContent: "center",
  },
  textInputBoxWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0F2E59",
    paddingHorizontal: 14,
    height: 48,
  },
  textInput: {
    color: "#FFFFFF",
    fontSize: 14,
    flex: 1,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countryCodePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#051A34",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0F2E59",
    paddingHorizontal: 12,
    height: 48,
  },
  countryCodeText: {
    color: "#CADDF7",
    fontSize: 14,
    fontWeight: "600",
  },
  genderRadioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginVertical: 4,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radioLabel: {
    color: "#CADDF7",
    fontSize: 14,
  },
  saveActionButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },
  saveActionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Documents Screen Styles
  documentItemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0F2E59",
    marginBottom: 8,
  },
  documentItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  documentTextCol: {
    flex: 1,
  },
  documentItemTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  documentItemSubtext: {
    color: "#8EA2C6",
    fontSize: 11.5,
    marginTop: 2,
  },
  documentItemErrorText: {
    color: "#CADDF7",
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  vehicleDocHeader: {
    color: "#1E78E5",
    fontSize: 13.5,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },

  // Driving Preferences & Toggles
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0F2E59",
    marginBottom: 8,
  },
  prefLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  prefTextCol: {
    flex: 1,
  },
  prefTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  prefSubtext: {
    color: "#8EA2C6",
    fontSize: 11.5,
    marginTop: 2,
  },

  // Ride Activity
  weekSelectorBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#0F2E59",
    marginBottom: 14,
  },
  weekRangeText: {
    color: "#1E78E5",
    fontSize: 14,
    fontWeight: "700",
  },
  rideStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#051A34",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0F2E59",
    paddingVertical: 14,
    marginBottom: 20,
  },
  rideStatCol: {
    flex: 1,
    alignItems: "center",
  },
  rideStatLabel: {
    color: "#8EA2C6",
    fontSize: 11.5,
    marginBottom: 3,
  },
  rideStatVal: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  rideStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#0F2E59",
  },
  emptyRideContainer: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyRideHeading: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyRideSub: {
    color: "#8EA2C6",
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
  },
  ridesListSection: {
    gap: 8,
  },
  dayGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dayGroupTitle: {
    color: "#CADDF7",
    fontSize: 13,
    fontWeight: "600",
  },
  dayGroupTotal: {
    color: "#CADDF7",
    fontSize: 13,
    fontWeight: "700",
  },
  rideItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#0F2E59",
  },
  rideItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rideItemDetails: {
    gap: 2,
  },
  rideItemDestination: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "500",
  },
  rideItemTime: {
    color: "#8EA2C6",
    fontSize: 11,
  },
  rideItemFare: {
    color: "#CADDF7",
    fontSize: 13,
    fontWeight: "700",
  },
  noActivityRow: {
    backgroundColor: "#051A34",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0F2E59",
  },
  noActivityText: {
    color: "#64748B",
    fontSize: 13,
  },

  // Saved Address
  savedAddressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0F2E59",
    marginBottom: 10,
    gap: 12,
  },
  savedAddressIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0A2540",
    alignItems: "center",
    justifyContent: "center",
  },
  savedAddressText: {
    color: "#FFFFFF",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Settings
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#051A34",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#0F2E59",
    marginBottom: 8,
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsLabel: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "500",
  },

  // Notifications & Promotions
  notifSectionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  notifSectionSubtitle: {
    color: "#8EA2C6",
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 16,
  },

  // Modals Styles
  modalOverlayDark: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContentCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#071B36",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  modalTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalRadioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0F2E59",
  },
  modalRadioLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalAppIcon: {
    width: 22,
    height: 22,
  },
  modalRadioLabel: {
    color: "#CADDF7",
    fontSize: 14,
    fontWeight: "500",
  },
  modalEmergencyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginVertical: 12,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 18,
  },
  modalOutlineBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E78E5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOutlineBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalSolidBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#1E78E5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSolidBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  modalActionItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  deleteAccountItemText: {
    color: "#EF4444",
    fontSize: 14.5,
    fontWeight: "600",
  },
  deleteAccountGraphic: {
    width: 110,
    height: 110,
    marginBottom: 12,
  },
  deleteConfirmTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  deleteConfirmSub: {
    color: "#8EA2C6",
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 17,
  },
  modalInputBox: {
    backgroundColor: "#051A34",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0F2E59",
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
    marginBottom: 10,
  },
  modalTextInput: {
    color: "#FFFFFF",
    fontSize: 13.5,
  },
  modalPrimaryBtn: {
    backgroundColor: "#1E78E5",
    borderRadius: 8,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  modalPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  addVehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0F2E59",
  },
  addVehicleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addVehicleLabel: {
    color: "#CADDF7",
    fontSize: 14,
    fontWeight: "600",
  },
});
