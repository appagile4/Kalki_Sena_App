import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export interface NotificationItem {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      sender: "Mail",
      message:
        "We've just reached out 30k goal raised for charity!\nWe're so proud of the team!",
      timestamp: "34m ago",
      read: false,
    },
    {
      id: "2",
      sender: "Mail",
      message:
        "We've just reached out 30k goal raised for charity!\nWe're so proud of the team!",
      timestamp: "34m ago",
      read: true,
    },
    {
      id: "3",
      sender: "Mail",
      message:
        "We've just reached out 30k goal raised for charity!\nWe're so proud of the team!",
      timestamp: "34m ago",
      read: true,
    },
  ]);

  const hasUnread = notifications.some((n) => !n.read);

  const handleMarkAllAsRead = () => {
    if (!hasUnread) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleNotificationPress = (item: NotificationItem) => {
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
  };

  const handleOptionsPress = (item: NotificationItem) => {
    Alert.alert(item.sender, "Notification Options", [
      {
        text: item.read ? "Mark as unread" : "Mark as read",
        onPress: () => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, read: !n.read } : n))
          );
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setNotifications((prev) => prev.filter((n) => n.id !== item.id));
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const isUnread = !item.read;

    return (
      <View style={styles.itemWrapper}>
        <TouchableOpacity
          style={[
            styles.notificationCard,
            isUnread
              ? styles.notificationCardUnread
              : styles.notificationCardRead,
          ]}
          activeOpacity={0.8}
          onPress={() => handleNotificationPress(item)}
        >
          {/* Avatar on Left */}
          <View style={styles.avatarWrapper}>
            <Image
              source={require("../../../assets/images/avatar.png")}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          </View>

          {/* Text and Actions on Right */}
          <View style={styles.contentColumn}>
            {/* Top row: Sender Name and 3-dots */}
            <View style={styles.senderRow}>
              <Text style={styles.senderText}>{item.sender}</Text>
              <TouchableOpacity
                onPress={() => handleOptionsPress(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.moreButton}
              >
                <Ionicons name="ellipsis-vertical" size={16} color="#7A8D9E" />
              </TouchableOpacity>
            </View>

            {/* Message Body */}
            <Text style={styles.messageText}>{item.message}</Text>

            {/* Timestamp at bottom right */}
            <Text style={styles.timestampText}>{item.timestamp}</Text>
          </View>
        </TouchableOpacity>

        {/* Separator Line for read items */}
        {!isUnread && <View style={styles.separator} />}
      </View>
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

      {/* Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        {/* Spacer on right to ensure centered title */}
        <View style={styles.headerRightSpacer} />
      </View>

      {/* Mark All As Read Action Bar */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={handleMarkAllAsRead}
          disabled={!hasUnread}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={[
              styles.markAllText,
              !hasUnread && styles.markAllTextDisabled,
            ]}
          >
            Mark all as read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#4B5E76"
            />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtext}>
              You have no active notifications right now.
            </Text>
          </View>
        }
      />
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
    padding: 6,
    minWidth: 40,
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  headerRightSpacer: {
    minWidth: 40,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  markAllText: {
    color: "#3087E5",
    fontSize: 13.5,
    fontWeight: "500",
  },
  markAllTextDisabled: {
    color: "#7B7D7E",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  itemWrapper: {
    marginBottom: 6,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  notificationCardUnread: {
    backgroundColor: "#0B3766",
    borderRadius: 12,
  },
  notificationCardRead: {
    backgroundColor: "transparent",
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#10233D",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  contentColumn: {
    flex: 1,
    marginLeft: 12,
  },
  senderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  senderText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  moreButton: {
    padding: 2,
  },
  messageText: {
    color: "#CADDF7",
    fontSize: 13,
    lineHeight: 18.5,
    marginTop: 4,
    fontWeight: "400",
  },
  timestampText: {
    color: "#6B7F94",
    fontSize: 11.5,
    marginTop: 6,
    alignSelf: "flex-end",
    fontWeight: "400",
  },
  separator: {
    height: 1,
    backgroundColor: "#1E2B3E",
    marginTop: 6,
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 14,
  },
  emptySubtext: {
    color: "#7A8D9E",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
