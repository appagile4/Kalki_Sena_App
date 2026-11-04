import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Svg, { Path } from "react-native-svg";

interface HomeHeaderProps {
  userName?: string;
  greeting?: string;
  avatarUri?: string;
  onProfilePress?: () => void;
  onScannerPress?: () => void;
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
  onReloadPress?: () => void;
  qrValue?: string;
}

// Custom SVG Logout Icon matching the design image exactly
export const LogoutIcon = ({
  size = 20,
  color = "#FFFFFF",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Open Circle Arc with flat clean cut ends */}
    <Path
      d="M 6.6 7.2 A 8 8 0 1 1 6.6 16.8"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="butt"
    />
    {/* Left-pointing Arrow entering from inside the circle */}
    <Path
      d="M 2.6 12 L 6.6 8.5 V 10.9 H 13.5 V 13.1 H 6.6 V 15.5 Z"
      fill={color}
    />
  </Svg>
);

export default function HomeHeader({
  userName = "Subhodip",
  greeting = "Namaste",
  avatarUri,
  onProfilePress,
  onScannerPress,
  onNotificationPress,
  onLogoutPress,
  onReloadPress,
  qrValue = "https://kalkisenadrive.com/donate",
}: HomeHeaderProps) {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const handleLogoutAction = onLogoutPress || onReloadPress;
  const avatarSource = avatarUri
    ? { uri: avatarUri }
    : require("../../../assets/images/avatar.png");

  const handleScannerAction = () => {
    setQrModalVisible(true);
    if (onScannerPress) {
      onScannerPress();
    }
  };

  return (
    <View style={styles.container}>
      {/* User Info (Avatar + Greeting) */}
      <TouchableOpacity
        style={styles.userSection}
        activeOpacity={0.8}
        onPress={onProfilePress}
      >
        <View style={styles.avatarBorder}>
          <Image
            source={avatarSource}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons (QR Scanner + Notification Bell + Custom SVG Logout) */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={handleScannerAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color="#ffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={onNotificationPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="notifications" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Logout Button with custom SVG */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={handleLogoutAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <LogoutIcon size={21} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* QR Code Modal */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop click to dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setQrModalVisible(false)}
          />

          {/* Center Card */}
          <View style={styles.modalCard}>
            {/* White QR Container */}
            <View style={styles.qrContainer}>
              <QRCode
                value={qrValue}
                size={220}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.8}
              onPress={() => setQrModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#18406F",
    overflow: "hidden",
    backgroundColor: "#071C38",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 12.5,
    color: "#7E9BB8",
    fontWeight: "500",
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#061A34",
    borderWidth: 1,
    borderColor: "#12345F",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#071B36",
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "#0F2E59",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  qrContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  closeButton: {
    marginTop: 18,
    width: "100%",
    height: 48,
    backgroundColor: "#1E78E5",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
