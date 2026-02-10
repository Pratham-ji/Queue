import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

// 🎨 THEME
const COLORS = {
  primary: "#10B981",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  text: "#1E293B",
  subText: "#64748B",
  border: "#E2E8F0",
  read: "#F1F5F9",
  unread: "#ECFDF5",
};

// 📨 MOCK DATA: CHATS
const CHATS = [
  {
    id: "1",
    doctor: "Dr. Trafalgar Law",
    avatar:
      "https://img.freepik.com/free-photo/doctor-offering-medical-teleconsultation_23-2149329007.jpg",
    lastMsg: "Please bring your previous MRI reports.",
    time: "10:30 AM",
    unread: 2,
  },
  {
    id: "2",
    doctor: "Dr. Chopper",
    avatar: "https://i.pravatar.cc/150?u=chopper",
    lastMsg: "The medicine is ready for pickup.",
    time: "Yesterday",
    unread: 0,
  },
];

// 🔔 MOCK DATA: NOTIFICATIONS
const NOTIFICATIONS = [
  {
    id: "1",
    title: "Booking Confirmed",
    body: "Your appointment with Dr. Law is confirmed for Oct 12.",
    time: "2 mins ago",
    icon: "calendar",
    color: "#3B82F6", // Blue
  },
  {
    id: "2",
    title: "Queue Alert",
    body: "You are now #3 in line. Please head to the clinic.",
    time: "1 hour ago",
    icon: "ticket",
    color: "#10B981", // Green
  },
  {
    id: "3",
    title: "Payment Successful",
    body: "Transaction ID #88329 for $50.00 was successful.",
    time: "Yesterday",
    icon: "card",
    color: "#8B5CF6", // Purple
  },
];

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState<"chats" | "alerts">("chats");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* SEGMENTED CONTROL (TABS) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "chats" && styles.activeTab]}
          onPress={() => setActiveTab("chats")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "chats" && styles.activeTabText,
            ]}
          >
            Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "alerts" && styles.activeTab]}
          onPress={() => setActiveTab("alerts")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "alerts" && styles.activeTabText,
            ]}
          >
            Notifications
          </Text>
          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.subText} />
        <TextInput
          placeholder={
            activeTab === "chats"
              ? "Search conversations..."
              : "Search alerts..."
          }
          placeholderTextColor={COLORS.subText}
          style={styles.searchInput}
        />
      </View>

      {/* CONTENT LIST */}
      {activeTab === "chats" ? (
        <FlatList
          data={CHATS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Animatable.View animation="fadeInUp" delay={index * 100}>
              <TouchableOpacity
                style={[
                  styles.chatCard,
                  item.unread > 0 ? styles.unreadCard : styles.readCard,
                ]}
              >
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                  <View style={styles.chatTop}>
                    <Text style={styles.chatName}>{item.doctor}</Text>
                    <Text style={styles.chatTime}>{item.time}</Text>
                  </View>
                  <View style={styles.chatBottom}>
                    <Text style={styles.chatMsg} numberOfLines={1}>
                      {item.lastMsg}
                    </Text>
                    {item.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animatable.View>
          )}
        />
      ) : (
        <FlatList
          data={NOTIFICATIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Animatable.View animation="fadeInUp" delay={index * 100}>
              <View style={styles.notifCard}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${item.color}20` },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.color}
                  />
                </View>
                <View style={styles.notifInfo}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.body}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
              </View>
            </Animatable.View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: COLORS.text },
  iconBtn: { padding: 8, backgroundColor: COLORS.bg, borderRadius: 12 },

  // TABS
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontWeight: "600", color: COLORS.subText },
  activeTabText: { color: COLORS.text, fontWeight: "700" },
  badge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "700" },

  // SEARCH
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: COLORS.text },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  // CHAT CARD
  chatCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  unreadCard: { backgroundColor: COLORS.unread },
  readCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 16 },
  chatInfo: { flex: 1, justifyContent: "center" },
  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chatName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  chatTime: { fontSize: 12, color: COLORS.subText },
  chatBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMsg: { fontSize: 14, color: COLORS.subText, flex: 1, marginRight: 10 },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { color: "#FFF", fontSize: 10, fontWeight: "700" },

  // NOTIF CARD
  notifCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  notifInfo: { flex: 1 },
  notifTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  notifBody: {
    fontSize: 14,
    color: COLORS.subText,
    marginBottom: 6,
    lineHeight: 20,
  },
  notifTime: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
});
