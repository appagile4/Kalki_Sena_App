import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { QuickActionItem, CommunityProgramItem } from "./types";

interface CategoryGridProps {
  quickActions?: QuickActionItem[];
  communityPrograms?: CommunityProgramItem[];
  onActionPress?: (action: QuickActionItem) => void;
  onProgramPress?: (program: CommunityProgramItem) => void;
}

// Renamed asset images for the 4 community programs
const PROGRAM_IMAGES: Record<CommunityProgramItem["type"], any> = {
  doctor: require("../../../assets/images/doctors.png"),
  driver: require("../../../assets/images/driver.png"),
  clinic: require("../../../assets/images/clinic.png"),
  coaching: require("../../../assets/images/coaching.png"),
};

export default function CategoryGrid({
  quickActions = [
    { id: "bike", label: "Bike", iconName: "motorbike" },
    { id: "car", label: "Car", iconName: "car" },
    { id: "food", label: "Food", iconName: "noodles" },
    { id: "parcel", label: "Parcel", iconName: "package-variant-closed" },
  ],
  communityPrograms = [
    { id: "doctors", title: "Donate to\nDoctors", type: "doctor" },
    { id: "driver", title: "Become A\nDriver", type: "driver" },
    { id: "clinic", title: "Join\nKalki Sena\nClinic", type: "clinic" },
    {
      id: "coaching",
      title: "Register for\nFree Coaching",
      type: "coaching",
    },
  ],
  onActionPress,
  onProgramPress,
}: CategoryGridProps) {
  // Row 1: Quick Actions Vector Icons
  const renderQuickIcon = (item: QuickActionItem) => {
    switch (item.id) {
      case "bike":
        return (
          <MaterialCommunityIcons name="motorbike" size={26} color="#FFFFFF" />
        );
      case "car":
        return <Ionicons name="car-outline" size={24} color="#FFFFFF" />;
      case "food":
        return (
          <MaterialCommunityIcons
            name="bowl-mix-outline"
            size={24}
            color="#FFFFFF"
          />
        );
      case "parcel":
        return (
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={24}
            color="#FFFFFF"
          />
        );
      default:
        return <Ionicons name="apps-outline" size={24} color="#FFFFFF" />;
    }
  };

  // Row 2: Community Program Custom Illustration Images
  const renderProgramGraphic = (program: CommunityProgramItem) => {
    const imageSource = program.imageSource || PROGRAM_IMAGES[program.type];
    if (imageSource) {
      return (
        <Image
          source={imageSource}
          style={styles.programImage}
          contentFit="contain"
          transition={150}
        />
      );
    }
    return (
      <MaterialCommunityIcons
        name="account-group"
        size={28}
        color="#64B5F6"
      />
    );
  };

  return (
    <View style={styles.cardContainer}>
      {/* Row 1: Quick Actions (Bike, Car, Food, Parcel) */}
      <View style={styles.quickActionsRow}>
        {quickActions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.actionItem}
            activeOpacity={0.75}
            onPress={() => onActionPress?.(item)}
          >
            <View style={styles.actionCircle}>{renderQuickIcon(item)}</View>
            <Text style={styles.actionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Row 2: Community & Driver Programs */}
      <View style={styles.programsRow}>
        {communityPrograms.map((program) => (
          <TouchableOpacity
            key={program.id}
            style={styles.programItem}
            activeOpacity={0.75}
            onPress={() => onProgramPress?.(program)}
          >
            <View style={styles.programCard}>
              {renderProgramGraphic(program)}
            </View>
            <Text style={styles.programLabel} numberOfLines={3}>
              {program.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "#03142B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#09244B",
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 16,
  },
  actionItem: {
    alignItems: "center",
    width: 68,
  },
  actionCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#082142",
    borderWidth: 1,
    borderColor: "#12376A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  actionLabel: {
    color: "#C5DCF4",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },
  programsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  programItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  programCard: {
    width: "92%",
    height: 58,
    borderRadius: 12,
    backgroundColor: "#061A34",
    borderWidth: 1,
    borderColor: "#0E305C",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: 4,
  },
  programImage: {
    width: "100%",
    height: "100%",
  },
  programLabel: {
    color: "#B7D2EF",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 12.5,
    marginTop: 6,
  },
});
