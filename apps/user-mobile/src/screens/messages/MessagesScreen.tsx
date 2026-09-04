import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { api } from "../../services/api";
import { useUserQueueStore } from "../../store/userQueueStore";

// 🎨 THEME
const COLORS = {
  primary: "#059669",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  subText: "#64748B",
  border: "#E2E8F0",
  read: "#F1F5F9",
  unread: "#ECFDF5",
  warning: "#F59E0B",
};

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
    title: "It's your turn!",
    body: "Please head inside the doctor's room.",
    time: "1 hour ago",
    icon: "notifications",
    color: "#10B981", // Green
  },
  {
    id: "3",
    title: "Prescription Ready",
    body: "Your medicine is ready at the clinic pharmacy.",
    time: "2 days ago",
    icon: "medkit",
    color: "#F59E0B", // Orange
  },
];

export default function MessagesScreen() {
  const [activeTab, setActiveTab] = useState<"chats" | "alerts">("chats");
  
  const navigation = useNavigation<any>();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const { activePrescription } = useUserQueueStore();

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const [threadRes, userRes] = await Promise.all([
        api.get("/chat/threads"),
        api.get("/auth/me")
      ]);
      setThreads(threadRes.data.data);
      if (userRes.data.data?.credits !== undefined) {
        setCredits(userRes.data.data.credits);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchThreads();
    }, [])
  );

  const handleNotificationTap = (item: typeof NOTIFICATIONS[0]) => {
    if (item.title === "Prescription Ready") {
      setShowOtpModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <View style={styles.creditBadge}>
          <Ionicons name="wallet" size={16} color="#F8FAFC" />
          <Text style={styles.creditText}>{credits} Credits</Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "chats" && styles.activeTab]}
          onPress={() => setActiveTab("chats")}
        >
          <Text style={[styles.tabText, activeTab === "chats" && styles.activeTabText]}>
            Chats
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{threads.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "alerts" && styles.activeTab]}
          onPress={() => setActiveTab("alerts")}
        >
          <Text style={[styles.tabText, activeTab === "alerts" && styles.activeTabText]}>
            Alerts
          </Text>
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
        loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
        ) : (
          <FlatList
            data={threads}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const isDoctor = !!item.user;
              const displayProfile = isDoctor ? item.user : item.doctor;
              return (
                <Animatable.View animation="fadeInUp" delay={index * 100}>
                  <TouchableOpacity
                    style={[styles.chatCard, styles.readCard]}
                    onPress={() => navigation.navigate("ChatScreen", { threadId: item.id, profile: displayProfile, isActive: item.isActive })}
                  >
                    <Image source={{ uri: displayProfile?.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop" }} style={styles.avatar} />
                    <View style={styles.chatInfo}>
                      <View style={styles.chatTop}>
                        <Text style={styles.chatName}>{displayProfile?.name || "User"}</Text>
                        <Text style={styles.chatTime}>{item.isActive ? "Active" : "Closed"}</Text>
                      </View>
                      <View style={styles.chatBottom}>
                        <Text style={styles.chatMsg} numberOfLines={1}>
                          {item.isActive ? "Tap to continue conversation" : "Thread closed"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animatable.View>
              );
            }}
          />
        )
      ) : (
        <FlatList
          data={NOTIFICATIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Animatable.View animation="fadeInUp" delay={index * 100}>
              <TouchableOpacity style={styles.notifCard} onPress={() => handleNotificationTap(item)} activeOpacity={item.title === "Prescription Ready" ? 0.7 : 1}>
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
              </TouchableOpacity>
            </Animatable.View>
          )}
        />
      )}

      {/* OTP MODAL */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => setShowOtpModal(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <Ionicons name="medkit" size={48} color={COLORS.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Pharmacy Verification</Text>
            <Text style={styles.modalDesc}>
              Show this code to the pharmacist at the counter to collect your medicines.
            </Text>

            <View style={styles.otpBox}>
              <Text style={styles.otpText}>
                {activePrescription ? activePrescription.otpCode.split('').join(' ') : "4 8 2 9 0 1"}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setShowOtpModal(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.subText,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  creditText: { color: "#F8FAFC", fontWeight: "700", fontSize: 13 },

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

  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 40,
    alignItems: "center",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 24,
    right: 24,
    padding: 8,
    backgroundColor: COLORS.read,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 15,
    color: COLORS.subText,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  otpBox: {
    backgroundColor: COLORS.read,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    marginBottom: 32,
    width: "100%",
  },
  otpText: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 8,
    color: COLORS.primary,
    textAlign: "center",
  },
  modalDoneBtn: {
    backgroundColor: COLORS.text,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  modalDoneText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  }
});
