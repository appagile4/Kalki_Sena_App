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
  Share,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";

type CheckoutStep = "amount" | "payment_methods" | "bank_details" | "card_details";
type PaymentMethodType =
  | "esewa"
  | "khalti"
  | "bank"
  | "card"
  | "qr"
  | "paypal";

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Screen Title & Amount
  const title = (params.title as string) || "Donate to doctors:";
  const [amount, setAmount] = useState<string>(
    (params.amount as string) || "780"
  );

  // Flow Step
  const [step, setStep] = useState<CheckoutStep>("amount");
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodType>("esewa");

  // Modals
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Bank Form State
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchName, setBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Back Navigation handler
  const handleBack = () => {
    if (step === "amount") {
      router.back();
    } else if (step === "payment_methods") {
      setStep("amount");
    } else if (step === "bank_details" || step === "card_details") {
      setStep("payment_methods");
    }
  };

  // Payment Confirmation
  const handleConfirmPaymentMethod = () => {
    if (selectedMethod === "qr") {
      setShowQrModal(true);
    } else if (selectedMethod === "bank") {
      setStep("bank_details");
    } else if (selectedMethod === "card") {
      setStep("card_details");
    } else {
      setShowSuccessModal(true);
    }
  };

  const handleCompletePayment = () => {
    setShowSuccessModal(true);
  };

  const handleShareQr = async () => {
    try {
      await Share.share({
        message: `Kalki Sena Donation QR Code for ${title} - Amount: $${amount}`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleDownloadQr = () => {
    Alert.alert("Download", "Donation QR Code saved to your photo gallery.");
  };

  const handleSaveDetails = () => {
    Alert.alert("Saved", "Payment details saved successfully.");
  };

  const handleBackHome = () => {
    setShowSuccessModal(false);
    setShowQrModal(false);
    router.replace("/Home" as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Dark Navy Background Gradient */}
      <LinearGradient
        colors={["#020b18", "#03142c", "#051f42", "#021124"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header Bar */}
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

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
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
        {/* ========================================================= */}
        {/* STEP 1: ENTER AMOUNT                                      */}
        {/* ========================================================= */}
        {step === "amount" && (
          <View style={styles.stepContainer}>
            {/* Amount Input Box */}
            <View style={styles.amountInputBox}>
              <Text style={styles.amountCurrencyPrefix}>$</Text>
              <TextInput
                style={styles.amountTextInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#7A8D9E"
                selectionColor="#3087E5"
              />
            </View>

            {/* Continue to Payment Method Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => {
                if (!amount.trim()) {
                  Alert.alert("Invalid Amount", "Please enter a valid amount.");
                  return;
                }
                setStep("payment_methods");
              }}
            >
              <Text style={styles.primaryButtonText}>
                Continue to Payment Method
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 2: SELECT PAYMENT METHOD                             */}
        {/* ========================================================= */}
        {step === "payment_methods" && (
          <View style={styles.stepContainer}>
            {/* Amount Display Box */}
            <View style={styles.amountDisplayBox}>
              <Text style={styles.amountDisplayText}>${amount}</Text>
            </View>

            {/* Edit Amount Button */}
            <TouchableOpacity
              style={styles.editAmountButton}
              activeOpacity={0.85}
              onPress={() => setStep("amount")}
            >
              <Text style={styles.editAmountButtonText}>Edit Amount</Text>
            </TouchableOpacity>

            {/* Section Heading */}
            <Text style={styles.sectionHeading}>Select Payment Method</Text>

            {/* Payment Options List */}
            <View style={styles.paymentList}>
              {/* Option 1: eSewa */}
              <TouchableOpacity
                style={[
                  styles.paymentRow,
                  selectedMethod === "esewa" && styles.paymentRowSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod("esewa")}
              >
                <View style={styles.esewaBadge}>
                  <Text style={styles.esewaBadgeText}>e</Text>
                </View>
                <Text style={styles.paymentMethodName}>eSewa Mobile Wallet</Text>
                <Ionicons
                  name={
                    selectedMethod === "esewa"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={selectedMethod === "esewa" ? "#3087E5" : "#4A5D72"}
                />
              </TouchableOpacity>

              {/* Option 2: Khalti */}
              <TouchableOpacity
                style={[
                  styles.paymentRow,
                  selectedMethod === "khalti" && styles.paymentRowSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod("khalti")}
              >
                <View style={styles.khaltiBadge}>
                  <Ionicons name="paper-plane" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.paymentMethodName}>Khalti Mobile Wallet</Text>
                <Ionicons
                  name={
                    selectedMethod === "khalti"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={selectedMethod === "khalti" ? "#3087E5" : "#4A5D72"}
                />
              </TouchableOpacity>

              {/* Option 3: Pay from Bank */}
              <TouchableOpacity
                style={[
                  styles.paymentRow,
                  selectedMethod === "bank" && styles.paymentRowSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod("bank")}
              >
                <View style={styles.bankBadge}>
                  <MaterialCommunityIcons
                    name="bank-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.paymentMethodName}>Pay from Bank</Text>
                <Ionicons
                  name={
                    selectedMethod === "bank"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={selectedMethod === "bank" ? "#3087E5" : "#4A5D72"}
                />
              </TouchableOpacity>

              {/* Option 4: Credit/Debit */}
              <TouchableOpacity
                style={[
                  styles.paymentRow,
                  selectedMethod === "card" && styles.paymentRowSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod("card")}
              >
                <View style={styles.cardBadge}>
                  <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.paymentMethodName}>Credit/Debit</Text>
                <Ionicons
                  name={
                    selectedMethod === "card"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={selectedMethod === "card" ? "#3087E5" : "#4A5D72"}
                />
              </TouchableOpacity>

              {/* Option 5: Scan QR Code */}
              <TouchableOpacity
                style={[
                  styles.paymentRow,
                  selectedMethod === "qr" && styles.paymentRowSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod("qr")}
              >
                <View style={styles.qrBadge}>
                  <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.paymentMethodName}>Scan QR Code</Text>
                <Ionicons
                  name={
                    selectedMethod === "qr"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={selectedMethod === "qr" ? "#3087E5" : "#4A5D72"}
                />
              </TouchableOpacity>

              {/* Option 6: Paypal */}
              <TouchableOpacity
                style={[
                  styles.paymentRow,
                  selectedMethod === "paypal" && styles.paymentRowSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedMethod("paypal")}
              >
                <View style={styles.paypalBadge}>
                  <Ionicons
                    name="logo-paypal"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.paymentMethodName}>Paypal</Text>
                <Ionicons
                  name={
                    selectedMethod === "paypal"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={selectedMethod === "paypal" ? "#3087E5" : "#4A5D72"}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 24 }]}
              activeOpacity={0.85}
              onPress={handleConfirmPaymentMethod}
            >
              <Text style={styles.primaryButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 3: BANK DETAILS FORM                                 */}
        {/* ========================================================= */}
        {step === "bank_details" && (
          <View style={styles.stepContainer}>
            {/* Dropdown: Pay from Bank */}
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderText}>Pay from Bank</Text>
              <Ionicons name="chevron-down" size={18} color="#7A8D9E" />
            </View>

            {/* Account Holder Name */}
            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Account Holder Name"
                placeholderTextColor="#7A8D9E"
                value={accountHolder}
                onChangeText={setAccountHolder}
                style={styles.textInput}
              />
            </View>

            {/* Account Number */}
            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Account Number"
                placeholderTextColor="#7A8D9E"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                style={styles.textInput}
              />
            </View>

            {/* Branch Name */}
            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Branch Name"
                placeholderTextColor="#7A8D9E"
                value={branchName}
                onChangeText={setBranchName}
                style={styles.textInput}
              />
            </View>

            {/* IFSC Code */}
            <View style={styles.inputGroup}>
              <TextInput
                placeholder="IFSC Code"
                placeholderTextColor="#7A8D9E"
                value={ifscCode}
                onChangeText={setIfscCode}
                autoCapitalize="characters"
                style={styles.textInput}
              />
            </View>

            {/* Complete Payment Button */}
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 20 }]}
              activeOpacity={0.85}
              onPress={handleCompletePayment}
            >
              <Text style={styles.primaryButtonText}>Complete Payment</Text>
            </TouchableOpacity>

            {/* Save Details Link */}
            <TouchableOpacity
              style={styles.saveDetailsButton}
              onPress={handleSaveDetails}
            >
              <Text style={styles.saveDetailsText}>Save Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 4: CREDIT/DEBIT FORM                                 */}
        {/* ========================================================= */}
        {step === "card_details" && (
          <View style={styles.stepContainer}>
            {/* Dropdown: Credit/Debit */}
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderText}>Credit/Debit</Text>
              <Ionicons name="chevron-down" size={18} color="#7A8D9E" />
            </View>

            {/* Card Number */}
            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Credit/Debit Card Number"
                placeholderTextColor="#7A8D9E"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                style={styles.textInput}
              />
            </View>

            {/* Exp. Date and CVV in a row */}
            <View style={styles.splitRow}>
              <View style={[styles.inputGroup, styles.splitHalf]}>
                <TextInput
                  placeholder="Exp. Date"
                  placeholderTextColor="#7A8D9E"
                  value={expDate}
                  onChangeText={setExpDate}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>

              <View style={[styles.inputGroup, styles.splitHalf]}>
                <TextInput
                  placeholder="CVV"
                  placeholderTextColor="#7A8D9E"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Complete Payment Button */}
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 20 }]}
              activeOpacity={0.85}
              onPress={handleCompletePayment}
            >
              <Text style={styles.primaryButtonText}>Complete Payment</Text>
            </TouchableOpacity>

            {/* Save Details Link */}
            <TouchableOpacity
              style={styles.saveDetailsButton}
              onPress={handleSaveDetails}
            >
              <Text style={styles.saveDetailsText}>Save Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ========================================================= */}
      {/* MODAL: QR CODE SCAN DIALOG                                */}
      {/* ========================================================= */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrCard}>
            {/* Top Close icon */}
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setShowQrModal(false)}
            >
              <Ionicons name="close" size={22} color="#4A5D72" />
            </TouchableOpacity>

            {/* QR Code Image */}
            <View style={styles.qrImageWrapper}>
              <Image
                source={require("../../../assets/images/qr_code.png")}
                style={styles.qrImage}
                contentFit="contain"
              />
            </View>

            {/* Share and Download Buttons */}
            <View style={styles.qrActionsRow}>
              <TouchableOpacity
                style={styles.qrShareButton}
                activeOpacity={0.8}
                onPress={handleShareQr}
              >
                <Ionicons name="share-social-outline" size={16} color="#1E78E5" />
                <Text style={styles.qrShareButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.qrDownloadButton}
                activeOpacity={0.8}
                onPress={handleDownloadQr}
              >
                <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                <Text style={styles.qrDownloadButtonText}>Download QR</Text>
              </TouchableOpacity>
            </View>

            {/* Back to Payment Options */}
            <TouchableOpacity
              style={styles.qrBackButton}
              activeOpacity={0.85}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.qrBackButtonText}>
                Back to Payment Options
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: PAYMENT SUCCESSFUL                                 */}
      {/* ========================================================= */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleBackHome}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={handleBackHome}
            >
              <Ionicons name="close" size={22} color="#7A8D9E" />
            </TouchableOpacity>

            {/* Checkmark Badge */}
            <View style={styles.successBadge}>
              <Ionicons name="checkmark" size={38} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>Payment Successful</Text>
            <Text style={styles.successSubtitle}>
              Your donation of ${amount} has been received successfully
            </Text>

            <View style={styles.successAmountBox}>
              <Text style={styles.successAmountLabel}>Amount paid</Text>
              <Text style={styles.successAmountValue}>${amount}</Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={handleBackHome}
            >
              <Text style={styles.primaryButtonText}>Back Home</Text>
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
    paddingTop: 16,
  },
  stepContainer: {
    width: "100%",
  },

  // Amount Input (Step 1)
  amountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#051A36",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1E78E5",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  amountCurrencyPrefix: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 4,
  },
  amountTextInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  // Primary Action Button
  primaryButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Amount Display (Step 2)
  amountDisplayBox: {
    backgroundColor: "#051A36",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1E78E5",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  amountDisplayText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  editAmountButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 26,
  },
  editAmountButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
  sectionHeading: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },

  // Payment Options List
  paymentList: {
    gap: 10,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#061830",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0F2644",
  },
  paymentRowSelected: {
    borderColor: "#1E78E5",
    backgroundColor: "#0A2446",
  },
  paymentMethodName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    marginLeft: 14,
  },

  // Badges for Payment Methods
  esewaBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#60BB46",
    alignItems: "center",
    justifyContent: "center",
  },
  esewaBadgeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  khaltiBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#5C2D91",
    alignItems: "center",
    justifyContent: "center",
  },
  bankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0A2A54",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  cardBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0A2A54",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  qrBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0A2A54",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  paypalBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#003087",
    alignItems: "center",
    justifyContent: "center",
  },

  // Dropdown Header (Bank & Card steps)
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#071B34",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#102A4C",
    marginBottom: 14,
  },
  dropdownHeaderText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: "#071B34",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: "#FFFFFF",
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: "#102A4C",
  },
  splitRow: {
    flexDirection: "row",
    gap: 12,
  },
  splitHalf: {
    flex: 1,
  },
  saveDetailsButton: {
    alignItems: "center",
    marginTop: 16,
    padding: 6,
  },
  saveDetailsText: {
    color: "#CADDF7",
    fontSize: 13.5,
    fontWeight: "500",
  },

  // QR Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  qrCard: {
    width: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    position: "relative",
  },
  modalCloseIcon: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  qrImageWrapper: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  qrActionsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
    marginBottom: 14,
  },
  qrShareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF5FD",
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#CADDF7",
  },
  qrShareButtonText: {
    color: "#1E78E5",
    fontSize: 13.5,
    fontWeight: "600",
  },
  qrDownloadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E78E5",
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  qrDownloadButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },
  qrBackButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  qrBackButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
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
    lineHeight: 18,
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
});
