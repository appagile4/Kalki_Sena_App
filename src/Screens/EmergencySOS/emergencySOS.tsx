import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface EmergencyServiceItem {
  id: string;
  title: string;
  number: string;
  imageSource: any;
  fallbackIcon: keyof typeof Ionicons.glyphMap;
  fallbackColor: string;
}

const EMERGENCY_SERVICES: EmergencyServiceItem[] = [
  {
    id: "traffic",
    title: "Nepal Traffic Police",
    number: "100",
    imageSource: require("../../../assets/images/sos_traffic.png"),
    fallbackIcon: "shield-checkmark",
    fallbackColor: "#3B82F6",
  },
  {
    id: "fire",
    title: "Fire Brigade",
    number: "101",
    imageSource: require("../../../assets/images/sos_fire.png"),
    fallbackIcon: "flame",
    fallbackColor: "#EF4444",
  },
  {
    id: "ambulance",
    title: "Ambulance",
    number: "102",
    imageSource: require("../../../assets/images/sos_ambulance.png"),
    fallbackIcon: "medical",
    fallbackColor: "#0284C7",
  },
  {
    id: "police",
    title: "Nepal Police",
    number: "103",
    imageSource: require("../../../assets/images/sos_police.png"),
    fallbackIcon: "shield",
    fallbackColor: "#1E40AF",
  },
];

export default function EmergencySOSScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCall = (number: string, title: string) => {
    const url = `tel:${number}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            `Calling ${title}`,
            `Dialing emergency number: ${number}\n(Calling intent simulated for device/simulator)`
          );
        }
      })
      .catch(() => {
        Alert.alert(`Calling ${title}`, `Dialing ${number}...`);
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
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* Emergency Contact List */}
      <ScrollView
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {EMERGENCY_SERVICES.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.serviceRow}
            activeOpacity={0.75}
            onPress={() => handleCall(item.number, item.title)}
          >
            {/* Left: Emblem Icon */}
            <View style={styles.iconContainer}>
              <Image
                source={item.imageSource}
                style={styles.emblemImage}
                contentFit="contain"
              />
            </View>

            {/* Center: Service Name */}
            <Text style={styles.serviceTitle}>{item.title}</Text>

            {/* Right: Emergency Number & Chevron */}
            <View style={styles.rightContainer}>
              <Text style={styles.numberText}>{item.number}</Text>
              <Ionicons name="chevron-forward" size={18} color="#7A8D9E" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b18",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#081D39",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  headerRightSpacer: {
    width: 32,
  },
  listContainer: {
    paddingTop: 8,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#0A1C36",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  emblemImage: {
    width: 26,
    height: 26,
  },
  serviceTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  numberText: {
    color: "#CADDF7",
    fontSize: 14.5,
    fontWeight: "500",
  },
});
