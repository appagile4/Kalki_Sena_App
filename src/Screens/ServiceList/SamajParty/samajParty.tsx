import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type SamajStep = "info" | "register";

export default function SamajPartyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Wizard Step: Info (Screen 1) -> Register (Screen 2) -> Checkout (Screens 3 & 4 via checkout.tsx)
  const [step, setStep] = useState<SamajStep>("info");

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [ward, setWard] = useState("");

  const handleBack = () => {
    if (step === "register") {
      setStep("info");
    } else {
      router.back();
    }
  };

  const handleCopyAccount = () => {
    Alert.alert(
      "Account Number Copied",
      "03801017501357 has been copied to your clipboard."
    );
  };

  const handleRegisterContinue = () => {
    if (!fullName.trim()) {
      Alert.alert("Registration Required", "Please enter your full name.");
      return;
    }

    // Hand off to unified checkout.tsx for payment options, QR scan, Bank, Card, & Success
    router.push({
      pathname: "/Home/checkout" as any,
      params: {
        title: "Satyayug Samaj Party",
        amount: "780",
        name: fullName.trim(),
        city: city.trim(),
        ward: ward.trim(),
      },
    });
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
          Satyayug Samaj Party
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
        {/* SCREEN 1: MANIFESTO & BANK DETAILS CARD                   */}
        {/* ========================================================= */}
        {step === "info" && (
          <View style={styles.stepContainer}>
            {/* Card 1: Nepali Mission Statement */}
            <View style={styles.manifestoCard}>
              <Text style={styles.manifestoBoldHeader}>
                **सत्ययुग समाज पार्टीको समर्थन टिकट किन्नुहोस् र काठमाडौंका Gen-Z युवाहरूलाई निःशुल्क**
              </Text>
              <Text style={styles.manifestoBullet}>MBBS</Text>
              <Text style={styles.manifestoBullet}>Engineering</Text>
              <Text style={styles.manifestoBullet}>Lok Sewa</Text>
              <Text style={styles.manifestoBoldSubheader}>
                तथा सबै Entrance Preparation Coaching पढ्न सहयोग गर्नुहोस्।**
              </Text>

              <Text style={styles.manifestoParagraph}>
                यी नै Gen-Z युवाहरूले नेपाली १ रूपैयाँलाई भारतीय २५ रूपैयाँ बराबर
                बनाउने अर्थतन्त्र ल्याउने पार्टी लाई सरकार मा ल्याउने छन। यही
                प्रणालीले (कल्किवाद) ले तपाईंको परिवारलाई सधैंका लागि निःशुल्क
                स्वास्थ्य, शिक्षा र कानुनी सेवा-बीमा नलिई-प्रदान गर्ने सरकार
                बनाउनेछ।
              </Text>

              <Text style={styles.manifestoParagraph}>
                ६० दिनभित्रै यो परिवर्तन सम्भव छ—
                {"\n"}किनकि यो सरकार गुन्डा-भेडातन्त्र होइन, ज्ञान-तन्त्र
                (meritocracy) मा चल्नेछ।
                {"\n"}त्यसैले सत्ययुग समाज पार्टीको समर्थन टिकट किन्नुहोस् र
                नेपालमा पुँजीवाद हटाएर कल्किवादमा लैजान सहयोग गर्नुहोस्।
              </Text>

              <Text style={styles.manifestoSectionTitle}>हाम्रो लक्ष्य:</Text>
              <Text style={styles.manifestoText}>
                काठमाडौं र नेपाल को हावा फेरी ५० वर्ष पहिले जस्तै सफा बनाउनु।
                {"\n"}दाइजो प्रथा सधैं को लागि अन्त गरौँ
              </Text>

              <View style={styles.manifestoDivider} />

              <Text style={styles.manifestoHighlight}>
                📌 समर्थन टिकट मूल्य: रु. ५०० मात्र
              </Text>
              <Text style={styles.manifestoHighlight}>📌 कसरी किन्ने?</Text>
              <Text style={styles.manifestoSmallText}>
                कल्कि सेवा ड्राइभ एप मार्फत १००% क्यासलेस
                {"\n"}(नगद स्वीकार गरिँदैन – भ्रष्टाचार अन्त्यका लागि पूर्ण क्यासलेस प्रणाली)
              </Text>
            </View>

            {/* Card 2: Organization & Bank Details */}
            <View style={styles.bankCard}>
              <View style={styles.orgHeaderRow}>
                <View style={styles.bankIconWrapper}>
                  <MaterialCommunityIcons name="bank" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.orgNameText}>
                  Kalkiism Research and Training Center
                </Text>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Receiver's Full Name</Text>
                <Text style={styles.detailColon}>:</Text>
                <Text style={styles.detailValue}>
                  Kalkiism Research and Training Center
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bank Name</Text>
                <Text style={styles.detailColon}>:</Text>
                <Text style={styles.detailValue}>Nabil Bank</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Branch</Text>
                <Text style={styles.detailColon}>:</Text>
                <Text style={styles.detailValue}>Kuleshwor</Text>
              </View>

              <TouchableOpacity
                style={styles.detailRow}
                activeOpacity={0.7}
                onPress={handleCopyAccount}
              >
                <Text style={styles.detailLabel}>Bank Account Number</Text>
                <Text style={styles.detailColon}>:</Text>
                <View style={styles.accountNumberWrapper}>
                  <Text style={styles.detailValue}>03801017501357</Text>
                  <Ionicons
                    name="copy-outline"
                    size={14}
                    color="#3087E5"
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Action Button: Donate to Satyayug Samaj Party */}
              <TouchableOpacity
                style={styles.donatePrimaryButton}
                activeOpacity={0.85}
                onPress={() => setStep("register")}
              >
                <Text style={styles.donatePrimaryButtonText}>
                  Donate to Satyayug Samaj Party
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: REGISTRATION FORM                               */}
        {/* ========================================================= */}
        {step === "register" && (
          <View style={styles.stepContainer}>
            <View style={styles.registrationCard}>
              <Text style={styles.registrationTitle}>Registration below</Text>

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

              {/* City */}
              <View style={styles.inputGroup}>
                <TextInput
                  placeholder="Enter your City"
                  placeholderTextColor="#7A8D9E"
                  value={city}
                  onChangeText={setCity}
                  style={styles.textInput}
                />
              </View>

              {/* Ward */}
              <View style={styles.inputGroup}>
                <TextInput
                  placeholder="Enter your Ward"
                  placeholderTextColor="#7A8D9E"
                  value={ward}
                  onChangeText={setWard}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>

              {/* Continue Button -> Navigates to checkout.tsx */}
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 14 }]}
                activeOpacity={0.85}
                onPress={handleRegisterContinue}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  stepContainer: {
    width: "100%",
  },

  // Manifesto Card
  manifestoCard: {
    backgroundColor: "#071B36",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#0E2B52",
    marginBottom: 20,
  },
  manifestoBoldHeader: {
    color: "#CADDF7",
    fontSize: 13.5,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 8,
  },
  manifestoBullet: {
    color: "#CADDF7",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginLeft: 4,
  },
  manifestoBoldSubheader: {
    color: "#CADDF7",
    fontSize: 13.5,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 10,
  },
  manifestoParagraph: {
    color: "#CADDF7",
    fontSize: 12.8,
    lineHeight: 19.5,
    marginBottom: 10,
  },
  manifestoSectionTitle: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 4,
  },
  manifestoText: {
    color: "#CADDF7",
    fontSize: 12.8,
    lineHeight: 19,
  },
  manifestoDivider: {
    height: 1,
    backgroundColor: "#0F2E59",
    marginVertical: 12,
  },
  manifestoHighlight: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  manifestoSmallText: {
    color: "#CADDF7",
    fontSize: 11.5,
    lineHeight: 17,
  },

  // Bank Card
  bankCard: {
    backgroundColor: "#051A36",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  orgHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bankIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#0A2648",
    alignItems: "center",
    justifyContent: "center",
  },
  orgNameText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    flex: 1,
    marginLeft: 10,
    lineHeight: 19,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#0F325E",
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  detailLabel: {
    color: "#CADDF7",
    fontSize: 13,
    fontWeight: "500",
    width: 140,
    lineHeight: 18,
  },
  detailColon: {
    color: "#CADDF7",
    fontSize: 13,
    fontWeight: "600",
    marginRight: 10,
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    lineHeight: 18,
  },
  accountNumberWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  donatePrimaryButton: {
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  donatePrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Registration Card
  registrationCard: {
    backgroundColor: "#071B36",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#1E78E5",
  },
  registrationTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
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
});
