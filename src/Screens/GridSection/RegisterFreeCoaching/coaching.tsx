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

const PREPARATION_OPTIONS = [
  "MBBS (Medical Entrance)",
  "Engineering (IOE Entrance)",
  "Lok Sewa Aayog",
  "CMAT (Management)",
  "Nursing & Paramedical",
  "+2 Science / Management",
  "Chartered Accountancy (CA)",
];

export default function CoachingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedPrep, setSelectedPrep] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [showPrepModal, setShowPrepModal] = useState<boolean>(false);

  const handleRegister = () => {
    if (!selectedPrep) {
      Alert.alert(
        "Selection Required",
        "Please select which entrance preparation coaching you want."
      );
      return;
    }

    // Forward directly to unified checkout.tsx
    router.push({
      pathname: "/Home/checkout" as any,
      params: {
        title: "Register for Free Coaching",
        amount: "1000",
        preparation: selectedPrep,
        subject: subjectInput.trim(),
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
          Register for Free Coaching
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
        {/* Card 1: Overview and Policies */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewParagraph}>
            Kalkiism research and training center is working on free health
            education and legal services for life. Free clinic and free coaching
            are primitive steps to prove things can be done in Nepal too like
            sri lanka and Bhutan has already. All student who wants free coaching
            for life will pay 1000 membership free to kalkiism research and
            training center. Kalkiism research and training center will hire
            teachers and professors based on number of applicants. We will give
            one year free coaching guarantee for 1000 year. Rest funding for life
            will be done by income from kalki sena drive.
          </Text>

          <Text style={styles.overviewParagraph}>
            Registration process is free. You will pay only after we are 100%
            sure with number of applicants.
            {"\n"}You must be member of kalki sena clinic and kalkiism research
            and training center both to get free coaching . So total you will pay
            1251+1000 = 2251. You will get two year treatment free and one year
            coaching free. 1000 per subject will be charged till income from
            kalki sena drive start helping fund free clinic.
          </Text>

          <Text style={styles.overviewParagraph}>
            We will start selling votes for satyayug samaj party 100% income from
            the vote sale will be used to free coaching in each city of Nepal.
            Starting from Kathmandu.
          </Text>
        </View>

        {/* Card 2: Register Form Card */}
        <View style={styles.registerCard}>
          <Text style={styles.registerTitle}>Register</Text>

          {/* Entrance Preparation Selector */}
          <TouchableOpacity
            style={styles.dropdownInput}
            activeOpacity={0.8}
            onPress={() => setShowPrepModal(true)}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedPrep && styles.dropdownPlaceholder,
              ]}
              numberOfLines={1}
            >
              {selectedPrep || "Select Which Entrance Preparation"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#7A8D9E" />
          </TouchableOpacity>

          {/* Subject TextInput */}
          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Subject you want coachoing"
              placeholderTextColor="#7A8D9E"
              value={subjectInput}
              onChangeText={setSubjectInput}
              style={styles.textInput}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleRegister}
          >
            <Text style={styles.primaryButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Entrance Preparation Modal */}
      <Modal
        visible={showPrepModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrepModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                Select Entrance Preparation
              </Text>
              <TouchableOpacity onPress={() => setShowPrepModal(false)}>
                <Ionicons name="close" size={22} color="#7A8D9E" />
              </TouchableOpacity>
            </View>

            {PREPARATION_OPTIONS.map((prep) => (
              <TouchableOpacity
                key={prep}
                style={[
                  styles.optionRow,
                  selectedPrep === prep && styles.optionRowSelected,
                ]}
                onPress={() => {
                  setSelectedPrep(prep);
                  setShowPrepModal(false);
                }}
              >
                <Ionicons
                  name="school-outline"
                  size={18}
                  color={selectedPrep === prep ? "#1E78E5" : "#7A8D9E"}
                />
                <Text
                  style={[
                    styles.optionRowText,
                    selectedPrep === prep && styles.optionRowTextSelected,
                  ]}
                >
                  {prep}
                </Text>
                {selectedPrep === prep && (
                  <Ionicons name="checkmark" size={18} color="#1E78E5" />
                )}
              </TouchableOpacity>
            ))}
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

  // Overview Card
  overviewCard: {
    backgroundColor: "#071B36",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#0E2B52",
    marginBottom: 20,
  },
  overviewParagraph: {
    color: "#CADDF7",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400",
    marginBottom: 14,
  },

  // Register Card
  registerCard: {
    backgroundColor: "#071B36",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#1E78E5",
  },
  registerTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
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
    marginBottom: 12,
  },
  dropdownText: {
    color: "#FFFFFF",
    fontSize: 13.5,
  },
  dropdownPlaceholder: {
    color: "#7A8D9E",
  },
  inputGroup: {
    marginBottom: 16,
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
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#071B36",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E78E5",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#0F2E59",
  },
  optionRowSelected: {
    backgroundColor: "#0B2B52",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  optionRowText: {
    color: "#CADDF7",
    fontSize: 14,
    flex: 1,
  },
  optionRowTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
