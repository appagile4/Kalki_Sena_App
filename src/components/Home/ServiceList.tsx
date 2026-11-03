import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ServiceItem } from "./types";

interface ServiceListProps {
  services?: ServiceItem[];
  onServicePress?: (service: ServiceItem) => void;
}

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "1",
    title: "Find Hostel, Room, Apartment, Rent & Safe",
    iconName: "hostel",
  },
  {
    id: "2",
    title: "सत्ययुग समाज पार्टी को भोट किन्नु होस् ।",
    iconName: "party",
  },
  {
    id: "3",
    title: "Pay 1251 to get Free treatment for life",
    iconName: "treatment",
  },
  {
    id: "4",
    title: "Refer for Corporate House",
    iconName: "corporate",
  },
  {
    id: "5",
    title: "Find Job or Employee",
    iconName: "job",
  },
  {
    id: "6",
    title: "Do Online Shopping.",
    iconName: "shopping",
  },
  {
    id: "7",
    title: "$Sewa & E-Sapati",
    iconName: "sewa",
  },
  {
    id: "8",
    title: "Rent Car, Bus, Truck, Helicopter, Driver",
    iconName: "transport",
  },
  {
    id: "9",
    title: "Buy Health, Car and Bike insurance",
    iconName: "insurance",
  },
  {
    id: "10",
    title: "Send Money to Any Country",
    iconName: "sendmoney",
  },
];

export default function ServiceList({
  services = DEFAULT_SERVICES,
  onServicePress,
}: ServiceListProps) {
  // Pure vector icons from @expo/vector-icons (no SVG)
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "hostel":
        return (
          <MaterialCommunityIcons
            name="home-search-outline"
            size={22}
            color="#FFFFFF"
          />
        );
      case "party":
        return (
          <MaterialCommunityIcons
            name="hand-heart-outline"
            size={22}
            color="#FFFFFF"
          />
        );
      case "treatment":
        return (
          <MaterialCommunityIcons
            name="heart-plus-outline"
            size={22}
            color="#FFFFFF"
          />
        );
      case "corporate":
        return (
          <MaterialCommunityIcons
            name="office-building-outline"
            size={22}
            color="#FFFFFF"
          />
        );
      case "job":
        return (
          <MaterialCommunityIcons
            name="briefcase-search-outline"
            size={22}
            color="#FFFFFF"
          />
        );
      case "shopping":
        return (
          <Ionicons name="bag-handle-outline" size={20} color="#FFFFFF" />
        );
      case "sewa":
        return (
          <Ionicons name="cash-outline" size={22} color="#FFFFFF" />
        );
      case "transport":
        return (
          <MaterialCommunityIcons
            name="helicopter"
            size={22}
            color="#FFFFFF"
          />
        );
      case "insurance":
        return (
          <MaterialCommunityIcons
            name="shield-plus-outline"
            size={22}
            color="#FFFFFF"
          />
        );
      case "sendmoney":
        return (
          <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
        );
      default:
        return <Ionicons name="apps-outline" size={20} color="#FFFFFF" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Our services :</Text>

      {/* Service Rows */}
      <View style={styles.listContainer}>
        {services.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.serviceButton}
            activeOpacity={0.8}
            onPress={() => onServicePress?.(item)}
          >
            {/* Left Vector Icon */}
            <View style={styles.iconWrapper}>{renderIcon(item.iconName)}</View>

            {/* Middle Service Label */}
            <Text style={styles.serviceText} numberOfLines={1}>
              {item.title}
            </Text>

            {/* Right Chevron */}
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  listContainer: {
    gap: 8,
  },
  serviceButton: {
    height: 48,
    borderRadius: 9,
    backgroundColor: "#0A56AA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrapper: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  serviceText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
