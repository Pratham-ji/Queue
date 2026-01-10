import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// --- THEME ---
const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#6B7280",
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  unreadBg: "#ECFDF5",
};

// --- MOCK DATA (Anime Medical Team) ---
const MESSAGES = [
  {
    id: "1",
    name: "Dr. Franken Stein",
    avatar:
      "https://i.pinimg.com/736x/5b/c3/0f/5bc30f924df0d7c7689224422204595e.jpg",
    lastMessage: "The dissection— I mean, the surgery went perfectly.",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: "2",
    name: "Squad 4 Reception",
    avatar:
      "https://i.pinimg.com/736x/11/4a/ec/114aec4a64867c2e9c1d683783472097.jpg", // Unohana
    lastMessage: "Captain Unohana will see you now.",
    time: "Yesterday",
    unread: false,
  },
];

const NOTIFICATIONS = [
  {
    id: "1",
    title: "Queue Update",
    body: "You are now #5 in the queue for Dr. Chopper.",
    time: "2 mins ago",
    icon: "time",
    color: "#F59E0B", // Amber
  },
  {
    id: "2",
    title: "Booking Confirmed",
    body: "Your slot with Dr. Law is booked for 10:45 AM.",
    time: "1 hour ago",
    icon: "checkmark-circle",
    color: "#10B981", // Green
  },
];

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState<"Messages" | "Notifications">(
    "Messages",
  );

  // --- RENDERERS ---

  const renderMessageItem: ListRenderItem<any> = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemCard, item.unread && styles.unreadCard]}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, item.unread && styles.unreadText]}>
            {item.name}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text
          style={[styles.messageText, item.unread && styles.unreadMessage]}
          numberOfLines={2}
        >
          {item.lastMessage}
        </Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderNotificationItem: ListRenderItem<any> = ({ item }) => (
    <TouchableOpacity style={styles.itemCard} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: item.color + "20" }]}>
        {/* '20' adds transparency to the hex color */}
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // --- EMPTY STATE ---
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons
          name={
            activeTab === "Messages"
              ? "chatbubbles-outline"
              : "notifications-off-outline"
          }
          size={48}
          color="#9CA3AF"
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === "Messages" ? "No messages yet" : "All caught up"}
      </Text>
      <Text style={styles.emptySub}>
        {activeTab === "Messages"
          ? "When you contact a doctor or support, your chats will appear here."
          : "You have no new notifications at the moment."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Messages" && styles.activeTab]}
          onPress={() => setActiveTab("Messages")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Messages" && styles.activeTabText,
            ]}
          >
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "Notifications" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Notifications")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Notifications" && styles.activeTabText,
            ]}
          >
            Notifications
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST CONTENT */}
      {/* Fix: Explicitly type FlatList as <any> to accept both data shapes */}
      <FlatList<any>
        data={activeTab === "Messages" ? MESSAGES : NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={
          activeTab === "Messages" ? renderMessageItem : renderNotificationItem
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.bg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "transparent",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.subText,
  },
  activeTabText: {
    color: COLORS.text,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Cards
  itemCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: "#F0FDF4",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  unreadText: {
    color: "#065F46",
  },
  time: {
    fontSize: 11,
    color: COLORS.subText,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 18,
  },
  unreadMessage: {
    color: COLORS.text,
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.subText,
    textAlign: "center",
    lineHeight: 20,
  },
});
