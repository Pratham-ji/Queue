import React, { useState, useCallback } from "react";
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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { api } from "../../services/api";
import { useUserQueueStore } from "../../store/userQueueStore";
import { colors, shadows } from "../../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔔 MOCK DATA: NOTIFICATIONS
const NOTIFICATIONS = [
  {
    id: "alert-1",
    type: "alert",
    title: "Booking Confirmed",
    body: "Your appointment with Dr. Law is confirmed for Oct 12.",
    time: "2 mins ago",
    icon: "calendar",
    color: "#3B82F6",
  },
  {
    id: "alert-2",
    type: "alert",
    title: "It's your turn!",
    body: "Please head inside the doctor's room.",
    time: "1 hour ago",
    icon: "notifications",
    color: colors.primary,
  },
  {
    id: "alert-3",
    type: "alert",
    title: "Prescription Ready",
    body: "Your medicine is ready at the clinic pharmacy.",
    time: "2 days ago",
    icon: "medkit",
    color: "#F59E0B",
    actionLabel: "View OTP",
  },
];

export default function MessagesScreen() {
  const [filter, setFilter] = useState<"All" | "Alerts" | "Consultations">("All");
  const navigation = useNavigation<any>();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const { activePrescription } = useUserQueueStore();

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [threadRes, userRes] = await Promise.all([
        api.get("/chat/threads", { headers }),
        api.get("/auth/me", { headers })
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

  const handleItemTap = (item: any) => {
    if (item.type === "alert") {
      if (item.title === "Prescription Ready") {
        setShowOtpModal(true);
      }
    } else {
      // It's a thread
      const displayProfile = item.user ? item.user : item.doctor;
      navigation.navigate("ChatScreen", { threadId: item.id, profile: displayProfile, isActive: item.isActive });
    }
  };

  // Merge and sort
  const combinedData = [
    ...NOTIFICATIONS,
    ...threads.map(t => ({ ...t, type: "consultation" }))
  ];

  const filteredData = combinedData.filter(item => {
    if (filter === "All") return true;
    if (filter === "Alerts" && item.type === "alert") return true;
    if (filter === "Consultations" && item.type === "consultation") return true;
    return false;
  });

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isAlert = item.type === "alert";

    if (isAlert) {
      return (
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={() => handleItemTap(item)} activeOpacity={0.8}>
            <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            {item.actionLabel && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleItemTap(item)}>
                <Text style={styles.actionBtnText}>{item.actionLabel}</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      );
    } else {
      const displayProfile = item.user ? item.user : item.doctor;
      return (
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={() => handleItemTap(item)} activeOpacity={0.8}>
            <Image 
              source={{ uri: displayProfile?.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop" }} 
              style={styles.avatar} 
            />
            <View style={styles.cardInfo}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{displayProfile?.name || "User"}</Text>
                <View style={[styles.statusDot, { backgroundColor: item.isActive ? colors.success : colors.textSecondary }]} />
              </View>
              <Text style={styles.cardDesc} numberOfLines={1}>
                {item.isActive ? "Tap to continue conversation" : "Thread closed"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.creditBadge}>
          <Ionicons name="wallet" size={16} color={colors.textSecondary} />
          <Text style={styles.creditText}>{credits} Credits</Text>
        </View>
      </View>

      {/* PILL FILTERS */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {["All", "Alerts", "Consultations"].map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.pill, filter === f && styles.pillActive]}
              onPress={() => setFilter(f as any)}
            >
              <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* CONTENT LIST */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
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
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            
            <Ionicons name="medkit" size={48} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
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
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 32, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    gap: 6,
  },
  creditText: { color: colors.textPrimary, fontWeight: "700", fontSize: 13 },

  // PILL FILTERS
  filterWrapper: {
    height: 60,
  },
  filterScroll: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  pillActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: "#FFFFFF",
  },

  // LIST
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    paddingTop: 8,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    ...shadows.soft,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: colors.divider,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  cardTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  actionBtn: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
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
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  otpBox: {
    backgroundColor: colors.surface,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    marginBottom: 32,
    width: "100%",
  },
  otpText: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 8,
    color: colors.primary,
    textAlign: "center",
  },
  modalDoneBtn: {
    backgroundColor: colors.textPrimary,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  modalDoneText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  }
});
