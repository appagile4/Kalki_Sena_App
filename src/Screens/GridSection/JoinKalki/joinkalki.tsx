import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function JoinKalkiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleDonatePress = () => {
    // Forward directly to checkout.tsx with prefilled title and membership fee (Rs. 101)
    router.push({
      pathname: "/Home/checkout" as any,
      params: {
        title: "Kalkiism Research Center",
        amount: "101",
      },
    });
  };

  const handleCopyAccount = () => {
    Alert.alert(
      "Account Number Copied",
      "03801017501357 has been copied to your clipboard."
    );
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
          Kalkiism Research Center
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
        {/* Card 1: Membership & Mission Explanation */}
        <View style={styles.missionCard}>
          <Text style={styles.missionHeader}>
            Become kalkiism research and training center member
          </Text>
          <Text style={styles.missionBody}>
            Kalkiism Research and training center is dedicated to bring kalki
            currency which can bring free health education and legal services
            for 3 crore nepali. The membership fee is Rs. 101.00 rupees. Your
            101 rupees will guarantee you free health education and legal
            services for life if we have : 50 lakh members. Join and ask 151
            peopele to become members. This is like vote. With 50 lakh members,
            you win election and government will follow your order from this app.
          </Text>
        </View>

        {/* Card 2: Organization & Bank Account Details */}
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

          {/* Action Button: Donate to kalkiism research center */}
          <TouchableOpacity
            style={styles.donatePrimaryButton}
            activeOpacity={0.85}
            onPress={handleDonatePress}
          >
            <Text style={styles.donatePrimaryButtonText}>
              Donate to kalkiism research center
            </Text>
          </TouchableOpacity>
        </View>
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

  // Mission Card
  missionCard: {
    backgroundColor: "#071B36",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#0E2B52",
    marginBottom: 20,
  },
  missionHeader: {
    color: "#CADDF7",
    fontSize: 13.5,
    fontWeight: "700",
    lineHeight: 19,
    marginBottom: 10,
  },
  missionBody: {
    color: "#CADDF7",
    fontSize: 12.8,
    lineHeight: 20,
    fontWeight: "400",
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
});
