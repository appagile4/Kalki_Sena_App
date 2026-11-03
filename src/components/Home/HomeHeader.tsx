import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface HomeHeaderProps {
  userName?: string;
  greeting?: string;
  avatarUri?: string;
  onScannerPress?: () => void;
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
  onReloadPress?: () => void;
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
  onScannerPress,
  onNotificationPress,
  onLogoutPress,
  onReloadPress,
}: HomeHeaderProps) {
  const handleLogoutAction = onLogoutPress || onReloadPress;
  const avatarSource = avatarUri
    ? { uri: avatarUri }
    : require("../../../assets/images/avatar.png");

  return (
    <View style={styles.container}>
      {/* User Info (Avatar + Greeting) */}
      <View style={styles.userSection}>
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
      </View>

      {/* Action Buttons (QR Scanner + Notification Bell + Custom SVG Logout) */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={onScannerPress}
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
});
