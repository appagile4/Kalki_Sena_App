import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";

type TabType = "About" | "Chapters" | "Reviews";
type BookAppearance = "physical" | "digital";
type PaymentMethod = "esewa" | "khalti" | "qr" | "bank";
type ScreenStep = "details" | "pickup" | "payment" | "bank_form";

export default function BookDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>("About");

  // Expandable description in top card
  const [isWhyExpanded, setIsWhyExpanded] = useState<boolean>(false);

  // Modals & Navigation steps
  const [currentStep, setCurrentStep] = useState<ScreenStep>("details");
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Selections
  const [bookAppearance, setBookAppearance] =
    useState<BookAppearance>("digital");
  const [selectedPickup, setSelectedPickup] = useState<string>("clinic_1");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");

  // Bank Form State
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchName, setBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Share action
  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "Economic Revolution to make Nepal A World Leader by Jay Sah (MR. 666) - Buy on Kalki E-Book!",
      });
    } catch (e) {
      // Ignored
    }
  };

  // Cart action
  const handleCartPress = () => {
    Alert.alert("Cart", "Your cart has 1 book: Economic Revolution (NPR 1,000/-)");
  };

  // Start checkout flow
  const handleBuyNowPress = () => {
    setShowAppearanceModal(true);
  };

  // Continue from Appearance Modal
  const handleAppearanceContinue = () => {
    setShowAppearanceModal(false);
    if (bookAppearance === "physical") {
      setCurrentStep("pickup");
    } else {
      setCurrentStep("payment");
    }
  };

  // Complete Payment
  const handleCompletePayment = () => {
    setShowSuccessModal(true);
  };

  // Finish and return Home
  const handleSuccessBackHome = () => {
    setShowSuccessModal(false);
    router.replace("/Home" as any);
  };

  // -------------------------------------------------------------
  // STEP: PICKUP LOCATION (For Physical Book)
  // -------------------------------------------------------------
  if (currentStep === "pickup") {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42", "#021124"]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep("details")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Your Pickup Location</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.stepContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#7A8D9E" />
            <TextInput
              placeholder="Search for Kalki Sena Clinics in your city"
              placeholderTextColor="#7A8D9E"
              style={styles.searchInput}
            />
          </View>

          {/* Subheader */}
          <View style={styles.clinicSubheader}>
            <Ionicons name="globe-outline" size={16} color="#3087E5" />
            <Text style={styles.clinicSubheaderText}>
              Select one of the Kalki Sena Clinic
            </Text>
          </View>

          {/* Map Preview Graphic */}
          <View style={styles.mapCard}>
            <Image
              source={require("../../../assets/images/map_preview.png")}
              style={styles.mapImage}
              contentFit="cover"
            />
          </View>

          {/* Clinic List Options */}
          <TouchableOpacity
            style={[
              styles.clinicOption,
              selectedPickup === "clinic_1" && styles.clinicOptionSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPickup("clinic_1")}
          >
            <Ionicons
              name="location"
              size={22}
              color={selectedPickup === "clinic_1" ? "#3087E5" : "#7A8D9E"}
            />
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>
                Kalki Clinic - Baneshwor Branch
              </Text>
              <Text style={styles.clinicDetails}>1.2 Km away / 9 AM - 6 PM</Text>
            </View>
            <Ionicons
              name={
                selectedPickup === "clinic_1"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={selectedPickup === "clinic_1" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.clinicOption,
              selectedPickup === "clinic_2" && styles.clinicOptionSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPickup("clinic_2")}
          >
            <Ionicons
              name="location"
              size={22}
              color={selectedPickup === "clinic_2" ? "#3087E5" : "#7A8D9E"}
            />
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>
                Kalki Sena Clinic - Baneshwor Branch
              </Text>
              <Text style={styles.clinicDetails}>1.2 Km away / 9 AM - 6 PM</Text>
            </View>
            <Ionicons
              name={
                selectedPickup === "clinic_2"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={selectedPickup === "clinic_2" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.clinicOption,
              selectedPickup === "clinic_3" && styles.clinicOptionSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPickup("clinic_3")}
          >
            <Ionicons
              name="location"
              size={22}
              color={selectedPickup === "clinic_3" ? "#3087E5" : "#7A8D9E"}
            />
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>
                Kalki Clinic - Maitighar Branch
              </Text>
              <Text style={styles.clinicDetails}>2.5 Km away / 9 AM - 6 PM</Text>
            </View>
            <Ionicons
              name={
                selectedPickup === "clinic_3"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={selectedPickup === "clinic_3" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.primaryActionButton}
            activeOpacity={0.85}
            onPress={() => setCurrentStep("payment")}
          >
            <Text style={styles.primaryActionButtonText}>
              Confirm Pickup Location
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // -------------------------------------------------------------
  // STEP: BANK DETAILS FORM
  // -------------------------------------------------------------
  if (currentStep === "bank_form") {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42", "#021124"]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep("payment")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter your Bank Details</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.stepContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Dropdown: Pay from Bank */}
          <View style={styles.bankDropdown}>
            <Text style={styles.bankDropdownText}>Pay from Bank</Text>
            <Ionicons name="chevron-down" size={18} color="#7A8D9E" />
          </View>

          {/* Input Fields */}
          <View style={styles.bankInputGroup}>
            <TextInput
              placeholder="Account Holder Name"
              placeholderTextColor="#7A8D9E"
              value={accountHolder}
              onChangeText={setAccountHolder}
              style={styles.bankInput}
            />
          </View>

          <View style={styles.bankInputGroup}>
            <TextInput
              placeholder="Account Number"
              placeholderTextColor="#7A8D9E"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              style={styles.bankInput}
            />
          </View>

          <View style={styles.bankInputGroup}>
            <TextInput
              placeholder="Branch Name"
              placeholderTextColor="#7A8D9E"
              value={branchName}
              onChangeText={setBranchName}
              style={styles.bankInput}
            />
          </View>

          <View style={styles.bankInputGroup}>
            <TextInput
              placeholder="IFSC Code"
              placeholderTextColor="#7A8D9E"
              value={ifscCode}
              onChangeText={setIfscCode}
              autoCapitalize="characters"
              style={styles.bankInput}
            />
          </View>

          {/* Complete Payment Button */}
          <TouchableOpacity
            style={[styles.primaryActionButton, { marginTop: 24 }]}
            activeOpacity={0.85}
            onPress={handleCompletePayment}
          >
            <Text style={styles.primaryActionButtonText}>Complete Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryLinkButton}
            onPress={() => Alert.alert("Saved", "Bank details saved for future.")}
          >
            <Text style={styles.secondaryLinkText}>Save Details</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Success Modal */}
        {renderSuccessModal()}
      </View>
    );
  }

  // -------------------------------------------------------------
  // STEP: CHOOSE PAYMENT OPTION
  // -------------------------------------------------------------
  if (currentStep === "payment") {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#020b18", "#03142c", "#051f42", "#021124"]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (bookAppearance === "physical") {
                setCurrentStep("pickup");
              } else {
                setCurrentStep("details");
              }
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Payment Option</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.stepContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Summary Card */}
          <View style={styles.orderSummaryCard}>
            <Image
              source={require("../../../assets/images/bookcover.png")}
              style={styles.orderBookThumbnail}
              contentFit="cover"
            />
            <View style={styles.orderSummaryTextCol}>
              <Text style={styles.orderBookTitle}>
                Economic Revolution to make Nepal A World Leader
              </Text>
              <Text style={styles.orderBookAuthor}>
                by Dr. Uma Shankar Prasad (Economist, T.V.)
              </Text>
              <Text style={styles.orderDeliveryNote}>
                {bookAppearance === "physical"
                  ? "Your book will be sent to: Nepal Courier, Baneshwor Branch\nEstimated delivery: 3-5 business days"
                  : "You can read your book from the buy book section"}
              </Text>
            </View>
          </View>

          {/* Select Payment Method Header */}
          <View style={styles.paymentSectionHeader}>
            <Text style={styles.paymentSectionTitle}>Select Payment Method</Text>
            <TouchableOpacity onPress={() => setCurrentStep("details")}>
              <Ionicons name="close" size={20} color="#7A8D9E" />
            </TouchableOpacity>
          </View>

          {/* Payment Method 1: eSewa */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === "esewa" && styles.paymentOptionCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("esewa")}
          >
            <View style={styles.esewaIconBadge}>
              <Text style={styles.esewaIconText}>e</Text>
            </View>
            <Text style={styles.paymentOptionName}>eSewa Mobile Wallet</Text>
            <Ionicons
              name={
                paymentMethod === "esewa"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={paymentMethod === "esewa" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          {/* Payment Method 2: Khalti */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === "khalti" && styles.paymentOptionCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("khalti")}
          >
            <View style={styles.khaltiIconBadge}>
              <Ionicons name="paper-plane" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.paymentOptionName}>Khalti Mobile Wallet</Text>
            <Ionicons
              name={
                paymentMethod === "khalti"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={paymentMethod === "khalti" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          {/* Payment Method 3: QR Code */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === "qr" && styles.paymentOptionCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("qr")}
          >
            <View style={styles.qrIconBadge}>
              <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.paymentOptionName}>QR Code</Text>
            <Ionicons
              name={
                paymentMethod === "qr"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={paymentMethod === "qr" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          {/* Payment Method 4: Bank Details for Foreign Countries */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === "bank" && styles.paymentOptionCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod("bank")}
          >
            <View style={styles.bankIconBadge}>
              <MaterialCommunityIcons
                name="bank-outline"
                size={18}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.bankNameCol}>
              <Text style={styles.paymentOptionName}>
                Bank Detail For Foreign Countries
              </Text>
            </View>
            <Ionicons
              name={
                paymentMethod === "bank"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={paymentMethod === "bank" ? "#3087E5" : "#4A5D72"}
            />
          </TouchableOpacity>

          {/* Pay Now Button */}
          <TouchableOpacity
            style={[styles.primaryActionButton, { marginTop: 28 }]}
            activeOpacity={0.85}
            onPress={() => {
              if (paymentMethod === "bank") {
                setCurrentStep("bank_form");
              } else {
                handleCompletePayment();
              }
            }}
          >
            <Text style={styles.primaryActionButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Success Modal */}
        {renderSuccessModal()}
      </View>
    );
  }

  // -------------------------------------------------------------
  // SUCCESS MODAL HELPER
  // -------------------------------------------------------------
  function renderSuccessModal() {
    return (
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessBackHome}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.modalCloseTopRight}
              onPress={handleSuccessBackHome}
            >
              <Ionicons name="close" size={20} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Checkmark Badge */}
            <View style={styles.successBadge}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>Payment Successful</Text>
            <Text style={styles.successSubtitle}>
              Your money has been paid successfully
            </Text>

            <View style={styles.successAmountBox}>
              <Text style={styles.successAmountLabel}>Amount paid</Text>
              <Text style={styles.successAmountValue}>NPR 1000</Text>
            </View>

            <TouchableOpacity
              style={styles.successButton}
              activeOpacity={0.85}
              onPress={handleSuccessBackHome}
            >
              <Text style={styles.successButtonText}>Back Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // -------------------------------------------------------------
  // MAIN VIEW: BOOK DETAILS SCREEN
  // -------------------------------------------------------------
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Kalki E-Book</Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerActionIcon}
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionIcon}
            onPress={handleCartPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={21} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. "Why you will buy this Book?" Card */}
        <View style={styles.whyCard}>
          <Text style={styles.whyTitle}>Why you will buy this Book?</Text>
          <Text style={styles.whyBodyText}>
            Buy the Book. Build a Gen Z Wave.
            {"\n"}If you live out side of valley, By buying this book, you help
            create a Gen Z wave of 1 lakh students who will receive free coaching
            in Kathmandu Valley.{" "}
            {!isWhyExpanded && (
              <Text
                style={styles.readMoreLink}
                onPress={() => setIsWhyExpanded(true)}
              >
                read more
              </Text>
            )}
          </Text>

          {isWhyExpanded && (
            <View style={styles.whyExpandedSection}>
              <Text style={styles.whyExpandedItem}>
                • 100% of book profit will be donated to the coaching center
              </Text>
              <Text style={styles.whyExpandedItem}>
                • 1,000+ teachers will be employed to educate students for free
              </Text>
              <Text style={styles.whyExpandedItem}>
                • The goal is free healthcare, education, and legal services for
                life
              </Text>
              <Text style={styles.whyExpandedItem}>
                • After 10 lakh books are sold nationwide, within 30 days the
                Kalkiism Research and Training Center guarantees a central
                government that will implement economic policies to provide free
                health, education, and legal services to all 3 crore Nepalis.
              </Text>
              <Text style={styles.whyExpandedHighlight}>
                One book. One movement. One future.
              </Text>
              <TouchableOpacity
                onPress={() => setIsWhyExpanded(false)}
                style={styles.readLessButton}
              >
                <Text style={styles.readMoreLink}>read less</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 2. Book Info Card (Cover + Blurb + Rating) */}
        <TouchableOpacity
          style={styles.bookSummaryCard}
          activeOpacity={0.9}
          onPress={() => setShowCoverModal(true)}
        >
          <Image
            source={require("../../../assets/images/bookcover.png")}
            style={styles.bookCoverImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.bookSummaryDetails}>
            <Text style={styles.bookSummaryTitle}>
              Economic Revolution to make Nepal A World Leader
            </Text>
            <Text style={styles.bookSummaryBlurb} numberOfLines={3}>
              Lorem ipsum dolor sit amet consectetur. Tellus volutpat eget purus
              aliquam erat diam. Nulla sed egestas facilisis ornare quisque neque.
              Praesent vel sit id netus molestie tincidunt ut. Egestas felis.
            </Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={14}
                  color="#22C55E"
                  style={styles.starIcon}
                />
              ))}
              <Text style={styles.ratingValueText}>(4.3+)</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. Author Card */}
        <View style={styles.authorCard}>
          <Image
            source={require("../../../assets/images/avatar.png")}
            style={styles.authorAvatar}
            contentFit="cover"
          />
          <View style={styles.authorTextCol}>
            <Text style={styles.authorLabel}>Author</Text>
            <Text style={styles.authorName}>Jay Sah (MR. 666)</Text>
          </View>
        </View>

        {/* 4. Tabs Row */}
        <View style={styles.tabsRow}>
          {(["About", "Chapters", "Reviews"] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tabButton}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive && styles.tabButtonTextActive,
                  ]}
                >
                  {tab}
                </Text>
                {isActive && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Tab Content */}
        {activeTab === "About" && (
          <View style={styles.tabContentContainer}>
            <Text style={styles.sectionHeading}>About this Book</Text>
            <Text style={styles.bodyParagraph}>
              Lorem ipsum dolor sit amet consectetur. Tellus volutpat eget purus
              aliquam erat diam. Nulla sed egestas facilisis ornare quisque
              neque. Praesent vel sit id netus molestie tincidunt ut. Egestas
              felis.
            </Text>
            <Text style={styles.bodyParagraph}>
              Lorem ipsum dolor sit amet consectetur. Tellus volutpat eget purus
              aliquam erat diam. Nulla sed egestas facilisis ornare quisque
              neque. Praesent vel sit id netus molestie tincidunt ut. Egestas
              bibendum duis volutpat nulla aenean posuere felis.{" "}
              <Text style={styles.readMoreLink}>Read More</Text>
            </Text>

            <Text style={[styles.sectionHeading, { marginTop: 22 }]}>
              Book Summary
            </Text>
            <Text style={styles.bodyParagraph}>
              Lorem ipsum dolor sit amet consectetur. Tellus volutpat eget purus
              aliquam erat diam. Nulla sed egestas facilisis ornare quisque
              neque. Praesent vel sit id netus molestie tincidunt ut. Egestas
              bibendum duis volutpat nulla aenean posuere felis.{" "}
              <Text style={styles.readMoreLink}>Read More</Text>
            </Text>
          </View>
        )}

        {activeTab === "Chapters" && (
          <View style={styles.tabContentContainer}>
            {/* Chapter 1 */}
            <View style={styles.chapterItem}>
              <View style={styles.chapterHeaderRow}>
                <Text style={styles.chapterTitle}>Chapter 1 | The Hope</Text>
                <Text style={styles.chapterPageInfo}>Page No: 12 - 50</Text>
              </View>
              <Text style={styles.chapterExcerpt}>
                Lorem ipsum dolor sit amet consectetur. Tellus volutpat eget purus
                aliquam erat diam. Nulla sed egestas facilisis ornare quisque
                neque. Praesent vel sit id netus molestie tincidunt ut. Egestas
                bibendum duis volutpat nulla aenean posuere felis.{" "}
                <Text style={styles.readMoreLink}>Read More</Text>
              </Text>
            </View>

            <View style={styles.tabSeparator} />

            {/* Chapter 2 */}
            <View style={styles.chapterItem}>
              <View style={styles.chapterHeaderRow}>
                <Text style={styles.chapterTitle}>
                  Chapter 2 | The Vision & Policy
                </Text>
                <Text style={styles.chapterPageInfo}>Page No: 51 - 98</Text>
              </View>
              <Text style={styles.chapterExcerpt}>
                Lorem ipsum dolor sit amet consectetur. Tellus volutpat eget purus
                aliquam erat diam. Nulla sed egestas facilisis ornare quisque
                neque. Praesent vel sit id netus molestie tincidunt ut. Egestas
                bibendum duis volutpat nulla aenean posuere felis.{" "}
                <Text style={styles.readMoreLink}>Read More</Text>
              </Text>
            </View>

            <View style={styles.tabSeparator} />

            {/* Chapter 3 */}
            <View style={styles.chapterItem}>
              <View style={styles.chapterHeaderRow}>
                <Text style={styles.chapterTitle}>
                  Chapter 3 | Economic Revolution
                </Text>
                <Text style={styles.chapterPageInfo}>Page No: 99 - 145</Text>
              </View>
              <Text style={styles.chapterExcerpt}>
                Lorem ipsum dolor sit amet consectetur. Tellus volutpat eget purus
                aliquam erat diam. Nulla sed egestas facilisis ornare quisque
                neque. Praesent vel sit id netus molestie tincidunt ut. Egestas
                bibendum duis volutpat nulla aenean posuere felis.{" "}
                <Text style={styles.readMoreLink}>Read More</Text>
              </Text>
            </View>
          </View>
        )}

        {activeTab === "Reviews" && (
          <View style={styles.tabContentContainer}>
            {/* Review 1 */}
            <View style={styles.reviewItem}>
              <Image
                source={require("../../../assets/images/avatar.png")}
                style={styles.reviewAvatar}
                contentFit="cover"
              />
              <View style={styles.reviewTextCol}>
                <View style={styles.reviewHeaderRow}>
                  <Text style={styles.reviewHeading}>
                    Amazing and Intellectual Book
                  </Text>
                  <View style={styles.reviewRatingBadge}>
                    <Ionicons name="star" size={12} color="#22C55E" />
                    <Text style={styles.reviewRatingText}>4.3+</Text>
                  </View>
                </View>
                <Text style={styles.reviewAuthor}>by John Wattson</Text>
                <Text style={styles.reviewBody}>
                  Lorem ipsum dolor sit amet consectetur. Tellus volutpat eget
                  purus aliquam erat diam. Nulla sed egestas facilisis ornare
                  quisque neque. Praesent vel sit id netus molestie tincidunt{" "}
                  <Text style={styles.readMoreLink}>Read More</Text>
                </Text>
              </View>
            </View>

            <View style={styles.tabSeparator} />

            {/* Review 2 */}
            <View style={styles.reviewItem}>
              <Image
                source={require("../../../assets/images/avatar.png")}
                style={styles.reviewAvatar}
                contentFit="cover"
              />
              <View style={styles.reviewTextCol}>
                <View style={styles.reviewHeaderRow}>
                  <Text style={styles.reviewHeading}>
                    Amazing and Intellectual Book
                  </Text>
                  <View style={styles.reviewRatingBadge}>
                    <Ionicons name="star" size={12} color="#22C55E" />
                    <Text style={styles.reviewRatingText}>4.3+</Text>
                  </View>
                </View>
                <Text style={styles.reviewAuthor}>by John Wattson</Text>
                <Text style={styles.reviewBody}>
                  Lorem ipsum dolor sit amet consectetur. Tellus volutpat eget
                  purus aliquam erat diam. Nulla sed egestas facilisis ornare
                  quisque neque. Praesent vel sit id netus molestie tincidunt{" "}
                  <Text style={styles.readMoreLink}>Read More</Text>
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 6. Sticky Bottom Action Bar */}
      <View
        style={[
          styles.stickyBottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        {activeTab === "About" ? (
          <View style={styles.aboutActionBarRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>NPR 1,000/-</Text>
            </View>
            <TouchableOpacity
              style={styles.buyNowButton}
              activeOpacity={0.85}
              onPress={handleBuyNowPress}
            >
              <Text style={styles.buyNowButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.fullContinueButton}
            activeOpacity={0.85}
            onPress={handleBuyNowPress}
          >
            <Text style={styles.fullContinueButtonText}>
              Continue to Pay NPR 1,000/-
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CHOOSE BOOK APPEARANCE                                  */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={showAppearanceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAppearanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.appearanceCard}>
            {/* Top Close icon */}
            <TouchableOpacity
              style={styles.modalCloseTopRight}
              onPress={() => setShowAppearanceModal(false)}
            >
              <Ionicons name="close" size={22} color="#4A5D72" />
            </TouchableOpacity>

            {/* Book Mini Header */}
            <View style={styles.appearanceBookRow}>
              <Image
                source={require("../../../assets/images/bookcover.png")}
                style={styles.appearanceThumbnail}
                contentFit="cover"
              />
              <View style={styles.appearanceTextCol}>
                <Text style={styles.appearanceBookTitle}>
                  Economic Revolution to make Nepal A World Leader
                </Text>
                <Text style={styles.appearanceBookAuthor}>
                  by Dr. Uma Shankar Prasad (Economist, T.V.)
                </Text>
              </View>
            </View>

            <Text style={styles.appearanceHeading}>
              Choose book appearance ?
            </Text>

            {/* Option 1: Physical Book */}
            <TouchableOpacity
              style={styles.appearanceOptionRow}
              activeOpacity={0.8}
              onPress={() => setBookAppearance("physical")}
            >
              <Ionicons
                name={
                  bookAppearance === "physical"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={22}
                color={bookAppearance === "physical" ? "#3087E5" : "#8A9BA8"}
              />
              <Text style={styles.appearanceOptionText}>Want Physical Book</Text>
            </TouchableOpacity>

            {/* Option 2: Digital E-Book */}
            <TouchableOpacity
              style={styles.appearanceOptionRow}
              activeOpacity={0.8}
              onPress={() => setBookAppearance("digital")}
            >
              <Ionicons
                name={
                  bookAppearance === "digital"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={22}
                color={bookAppearance === "digital" ? "#3087E5" : "#8A9BA8"}
              />
              <Text style={styles.appearanceOptionText}>Want Digital E-Book</Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.appearanceContinueButton}
              activeOpacity={0.85}
              onPress={handleAppearanceContinue}
            >
              <Text style={styles.appearanceContinueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: LARGE BOOK COVER PREVIEW                                */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={showCoverModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCoverModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.coverPreviewCard}>
            <TouchableOpacity
              style={styles.modalCloseTopRight}
              onPress={() => setShowCoverModal(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <Image
              source={require("../../../assets/images/bookcover.png")}
              style={styles.largeCoverImage}
              contentFit="contain"
            />

            <Text style={styles.largeCoverTitle}>
              Economic Revolution to make Nepal A World Leader
            </Text>

            <View style={styles.coverAuthorRow}>
              <Image
                source={require("../../../assets/images/avatar.png")}
                style={styles.coverAvatar}
                contentFit="cover"
              />
              <View>
                <Text style={styles.coverAuthorLabel}>Author</Text>
                <Text style={styles.coverAuthorName}>Jay Sah (MR. 666)</Text>
              </View>
            </View>
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
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 40,
    padding: 4,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
    flex: 1,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minWidth: 50,
    justifyContent: "flex-end",
  },
  headerActionIcon: {
    padding: 2,
  },
  headerRightSpacer: {
    minWidth: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  stepContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // 1. "Why you will buy this Book?"
  whyCard: {
    backgroundColor: "#071B36",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0F2E59",
  },
  whyTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 8,
  },
  whyBodyText: {
    color: "#CADDF7",
    fontSize: 12.5,
    lineHeight: 18.5,
  },
  readMoreLink: {
    color: "#3087E5",
    fontWeight: "600",
  },
  whyExpandedSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#0F2E59",
  },
  whyExpandedItem: {
    color: "#CADDF7",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  whyExpandedHighlight: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 6,
  },
  readLessButton: {
    alignSelf: "flex-end",
    marginTop: 6,
  },

  // 2. Book Info Card
  bookSummaryCard: {
    flexDirection: "row",
    backgroundColor: "#061830",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0D2545",
  },
  bookCoverImage: {
    width: 82,
    height: 122,
    borderRadius: 6,
    backgroundColor: "#0A2242",
  },
  bookSummaryDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  bookSummaryTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    lineHeight: 19,
    marginBottom: 6,
  },
  bookSummaryBlurb: {
    color: "#8E9FA5",
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
  ratingValueText: {
    color: "#CADDF7",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  // 3. Author Card
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#051A36",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#0E2B52",
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  authorTextCol: {
    marginLeft: 12,
  },
  authorLabel: {
    color: "#7B8D9F",
    fontSize: 11,
  },
  authorName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },

  // 4. Tabs Row
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0D2545",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
    position: "relative",
  },
  tabButtonText: {
    color: "#7B8D9F",
    fontSize: 14.5,
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    width: "70%",
    height: 3,
    backgroundColor: "#3087E5",
    borderRadius: 2,
  },

  // 5. Tab Content
  tabContentContainer: {
    paddingHorizontal: 2,
  },
  sectionHeading: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  bodyParagraph: {
    color: "#CADDF7",
    fontSize: 12.8,
    lineHeight: 19,
    marginBottom: 10,
  },
  tabSeparator: {
    height: 1,
    backgroundColor: "#0F2644",
    marginVertical: 14,
  },

  // Chapters tab
  chapterItem: {
    marginBottom: 4,
  },
  chapterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  chapterTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  chapterPageInfo: {
    color: "#7A8D9E",
    fontSize: 11.5,
  },
  chapterExcerpt: {
    color: "#CADDF7",
    fontSize: 12.5,
    lineHeight: 18,
  },

  // Reviews tab
  reviewItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  reviewTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewHeading: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
    flex: 1,
  },
  reviewRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewRatingText: {
    color: "#CADDF7",
    fontSize: 11.5,
    fontWeight: "600",
  },
  reviewAuthor: {
    color: "#7A8D9E",
    fontSize: 11.5,
    marginVertical: 3,
  },
  reviewBody: {
    color: "#CADDF7",
    fontSize: 12.5,
    lineHeight: 18,
  },

  // Sticky Bottom Bar
  stickyBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#031124",
    borderTopWidth: 1,
    borderTopColor: "#0D2545",
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  aboutActionBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    justifyContent: "center",
  },
  priceLabel: {
    color: "#7B8D9F",
    fontSize: 11.5,
  },
  priceValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  buyNowButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  buyNowButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  fullContinueButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: "center",
  },
  fullContinueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Primary Action Button (used in steps)
  primaryActionButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  primaryActionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryLinkButton: {
    alignItems: "center",
    marginTop: 14,
    padding: 6,
  },
  secondaryLinkText: {
    color: "#CADDF7",
    fontSize: 13,
  },

  // -------------------------------------------------------------
  // MODAL STYLES
  // -------------------------------------------------------------
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCloseTopRight: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 4,
  },

  // Appearance Modal
  appearanceCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    position: "relative",
  },
  appearanceBookRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 24,
    marginBottom: 16,
  },
  appearanceThumbnail: {
    width: 48,
    height: 68,
    borderRadius: 4,
    backgroundColor: "#EEE",
  },
  appearanceTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  appearanceBookTitle: {
    color: "#1A202C",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  appearanceBookAuthor: {
    color: "#718096",
    fontSize: 11,
    marginTop: 4,
  },
  appearanceHeading: {
    color: "#1A202C",
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 14,
  },
  appearanceOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  appearanceOptionText: {
    color: "#2D3748",
    fontSize: 14,
    fontWeight: "500",
  },
  appearanceContinueButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 18,
  },
  appearanceContinueText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },

  // Large Cover Modal
  coverPreviewCard: {
    width: "90%",
    backgroundColor: "#061A34",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  largeCoverImage: {
    width: 170,
    height: 250,
    borderRadius: 8,
    marginVertical: 12,
  },
  largeCoverTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  coverAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  coverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  coverAuthorLabel: {
    color: "#7A8D9E",
    fontSize: 11,
  },
  coverAuthorName: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },

  // Pickup step styles
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#071B34",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#102A4C",
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
  },
  clinicSubheader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  clinicSubheaderText: {
    color: "#3087E5",
    fontSize: 13,
    fontWeight: "600",
  },
  mapCard: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#102A4C",
  },
  mapImage: {
    width: "100%",
    height: 100,
  },
  clinicOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#071B34",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#102A4C",
  },
  clinicOptionSelected: {
    borderColor: "#3087E5",
    backgroundColor: "#0B2648",
  },
  clinicInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clinicName: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },
  clinicDetails: {
    color: "#7A8D9E",
    fontSize: 11.5,
    marginTop: 2,
  },

  // Payment Option step styles
  orderSummaryCard: {
    flexDirection: "row",
    backgroundColor: "#061A34",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#102A4C",
    marginBottom: 20,
  },
  orderBookThumbnail: {
    width: 62,
    height: 90,
    borderRadius: 6,
  },
  orderSummaryTextCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  orderBookTitle: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
    lineHeight: 18,
  },
  orderBookAuthor: {
    color: "#7A8D9E",
    fontSize: 11,
    marginTop: 3,
  },
  orderDeliveryNote: {
    color: "#3087E5",
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  paymentSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentSectionTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
  paymentOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#061830",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#0F2644",
  },
  paymentOptionCardSelected: {
    borderColor: "#3087E5",
    backgroundColor: "#0A2446",
  },
  esewaIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#60BB46",
    alignItems: "center",
    justifyContent: "center",
  },
  esewaIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  khaltiIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#5C2D91",
    alignItems: "center",
    justifyContent: "center",
  },
  qrIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0A2A54",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  bankIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0A2A54",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  paymentOptionName: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  bankNameCol: {
    flex: 1,
    marginLeft: 12,
  },

  // Bank Form step styles
  bankDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#071B34",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#102A4C",
    marginBottom: 14,
  },
  bankDropdownText: {
    color: "#FFFFFF",
    fontSize: 13.5,
  },
  bankInputGroup: {
    marginBottom: 12,
  },
  bankInput: {
    backgroundColor: "#071B34",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: "#102A4C",
  },

  // Success Modal
  successCard: {
    width: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1E78E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    color: "#1A202C",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  successSubtitle: {
    color: "#718096",
    fontSize: 12.5,
    textAlign: "center",
    marginBottom: 18,
  },
  successAmountBox: {
    alignItems: "center",
    marginBottom: 22,
  },
  successAmountLabel: {
    color: "#718096",
    fontSize: 12,
  },
  successAmountValue: {
    color: "#1A202C",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  successButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 24,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
