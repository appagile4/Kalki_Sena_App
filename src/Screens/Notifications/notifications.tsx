import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { notificationCenterApi } from "../../services/notificationService";

export interface NotificationItem {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: string;
  data?: any;
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Just now";
  const now = Date.now();
  const date = new Date(dateString).getTime();
  if (isNaN(date)) return "Recently";
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await notificationCenterApi.fetchMyNotifications(1, 50);
      const mapped: NotificationItem[] = res.notifications.map((n: any) => ({
        id: n._id || n.id,
        sender: n.title || "Kalki Sena Drive",
        message: n.body || "",
        timestamp: formatTimeAgo(n.createdAt),
        read: Boolean(n.isRead),
        type: n.type,
        data: n.data,
      }));
      setNotifications(mapped);
    } catch (err: any) {
      console.warn("[NotificationsScreen] Failed to fetch notifications:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const hasUnread = notifications.some((n) => !n.read);

  const handleMarkAllAsRead = async () => {
    if (!hasUnread) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await notificationCenterApi.markAllAsRead();
    } catch (err: any) {
      console.warn("Failed to mark all as read:", err.message);
    }
  };

  const handleNotificationPress = async (item: NotificationItem) => {
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      try {
        await notificationCenterApi.markAsRead(item.id);
      } catch (err: any) {
        console.warn("Failed to mark notification read:", err.message);
      }
    }

    // Deep navigation based on notification payload
    if (
      item.data?.screen === "OrderDetails" ||
      item.data?.orderId ||
      item.type?.startsWith("ORDER")
    ) {
      router.push("/Home/mybook" as any);
    } else if (item.data?.screen && item.data.screen !== "Home") {
      try {
        router.push(item.data.screen as any);
      } catch {
        router.push("/Home" as any);
      }
    }
  };

  const handleOptionsPress = (item: NotificationItem) => {
    Alert.alert(item.sender, "Notification Options", [
      {
        text: item.read ? "Mark as unread" : "Mark as read",
        onPress: async () => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, read: !n.read } : n))
          );
          if (!item.read) {
            await notificationCenterApi.markAsRead(item.id);
          }
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setNotifications((prev) => prev.filter((n) => n.id !== item.id));
          try {
            await notificationCenterApi.deleteNotification(item.id);
          } catch (err: any) {
            console.warn("Failed to delete notification:", err.message);
          }
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
          {/* Avatar / Icon on Left */}
          <View style={styles.avatarWrapper}>
            <Image
              source={require("../../../assets/images/icon.png")}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          </View>

          {/* Text and Actions on Right */}
          <View style={styles.contentColumn}>
            {/* Top row: Sender Name and 3-dots */}
            <View style={styles.senderRow}>
              <View style={styles.senderTitleGroup}>
                <Text style={styles.senderText} numberOfLines={1}>
                  {item.sender}
                </Text>
                {isUnread && <View style={styles.unreadDot} />}
              </View>
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

      {/* Notifications List or Loading Spinner */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0266B3" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadNotifications(true)}
              tintColor="#0266B3"
              colors={["#0266B3"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#4B5E76"
              />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtext}>
                You have no active notifications right now. Order updates and broadcast announcements will appear here.
              </Text>
            </View>
          }
        />
      )}
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
    backgroundColor: "rgba(11, 55, 102, 0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(48, 135, 229, 0.25)",
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
    alignItems: "center",
    justifyContent: "center",
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
  senderTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  senderText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#38bdf8",
    marginLeft: 6,
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 12,
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
