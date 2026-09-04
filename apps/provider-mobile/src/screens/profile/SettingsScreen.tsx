import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme";
import { useQueueStore } from "../../store/queueStore";
import { api } from "../../services/api";

const ProfileStat = ({ value, label }: any) => (
  <View style={styles.statItem}>
    <Text style={styles.statVal}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuRow = ({ icon, label, onPress, showChevron = true }: any) => (
  <TouchableOpacity
    style={styles.menuRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuLeft}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color="#64748B" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    )}
  </TouchableOpacity>
);

// Skeleton Loader
const SkeletonLine = ({ width = "100%", height = 14 }: any) => (
  <View style={{ width, height, backgroundColor: "#E2E8F0", borderRadius: 6, marginBottom: 8 }} />
);

export default function SettingsScreen({ navigation }: any) {
  const { queue, activeClinic } = useQueueStore();
  const [userData, setUserData] = useState<any>(null);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        // Load authenticated user from storage
        const raw = await AsyncStorage.getItem("user_data");
        if (raw) setUserData(JSON.parse(raw));

        // Fetch session history from backend
        const token = await AsyncStorage.getItem("access_token");
        try {
          const res = await api.get("/provider/history", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.history) setRecentHistory(res.data.history.slice(0, 3));
        } catch {
          // Backend may not have this endpoint yet; degrade gracefully
        }
      } catch (e) {
        if (__DEV__) console.error("Profile load error:", e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const displayName = userData?.name || "Staff Member";
  const displayRole = activeClinic?.name
    ? `Receptionist • ${activeClinic.name}`
    : "Queue Staff";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          {loading ? (
            <View style={{ padding: 20 }}>
              <SkeletonLine width="60%" height={18} />
              <SkeletonLine width="40%" />
              <View style={{ height: 16 }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <SkeletonLine width="25%" height={24} />
                <SkeletonLine width="25%" height={24} />
                <SkeletonLine width="25%" height={24} />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{displayName}</Text>
                  <Text style={styles.role}>{displayRole}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>ACTIVE</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editIcon}
                  onPress={() => navigation.navigate("EditProfile")}
                >
                  <Ionicons name="create-outline" size={18} color="#2563EB" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                <ProfileStat value={queue.length} label="Waiting" />
                <View style={styles.vDiv} />
                <ProfileStat value={recentHistory.length || "0"} label="Served Today" />
                <View style={styles.vDiv} />
                <ProfileStat value={activeClinic ? "✓" : "—"} label="Clinic" />
              </View>
            </>
          )}
        </View>

        {/* RECENT HISTORY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT SESSIONS</Text>
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.historyCard}>
            <SkeletonLine width="50%" />
            <SkeletonLine width="70%" />
          </View>
        ) : recentHistory.length > 0 ? (
          recentHistory.map((item: any, idx: number) => (
            <View key={idx} style={styles.historyCard}>
              <View style={styles.historyAvatar}>
                <Text style={styles.historyInitials}>
                  {getInitials(item.patientName || item.name || "??")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyName}>{item.patientName || item.name}</Text>
                <Text style={styles.historyDetail}>
                  {item.type || "General"} • {item.date || "Today"}
                </Text>
              </View>
              <View style={styles.detailsBtn}>
                <Text style={styles.detailsText}>Done</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.historyCard}>
            <Ionicons name="calendar-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
            <Text style={styles.historyDetail}>No sessions recorded yet today.</Text>
          </View>
        )}

        {/* CLINIC BANNER */}
        <View style={styles.clinicBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {activeClinic?.name || "Clinic Status"}
            </Text>
            <Text style={styles.bannerSub}>
              Manage your visibility and queue settings.
            </Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="business" size={20} color="#FFF" />
          </View>
        </View>

        {/* SETTINGS MENU */}
        <Text style={styles.sectionTitle}>ACCOUNT & SECURITY</Text>
        <View style={styles.menuGroup}>
          <MenuRow
            icon="person-outline"
            label="Personal Information"
            onPress={() => navigation.navigate("EditProfile")}
          />
          <View style={styles.menuDiv} />
          <MenuRow
            icon="business-outline"
            label="Clinic Details"
            onPress={() => navigation.navigate("ClinicProfile")}
          />
          <View style={styles.menuDiv} />
          <MenuRow
            icon="shield-checkmark-outline"
            label="Login & Security"
            onPress={() => {}}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0 • Queue Pro</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 24 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  notifBtn: { position: "relative" },

  // Profile Card
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    ...SHADOWS.light,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: { fontSize: 24, fontWeight: "700", color: "#2563EB" },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  role: { fontSize: 13, color: "#64748B", marginBottom: 6 },
  badge: {
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#2563EB" },
  editIcon: { padding: 8, backgroundColor: "#F8FAFC", borderRadius: 12 },

  divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 16 },

  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { alignItems: "center", flex: 1 },
  statVal: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  statLabel: { fontSize: 12, color: "#64748B", marginTop: 2 },
  vDiv: { width: 1, height: "100%", backgroundColor: "#F1F5F9" },

  // Recent History
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  linkText: { fontSize: 13, fontWeight: "600", color: "#2563EB" },

  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  historyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyInitials: { fontWeight: "700", color: "#64748B" },
  historyName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  historyDetail: { fontSize: 12, color: "#64748B" },
  detailsBtn: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailsText: { fontSize: 12, fontWeight: "600", color: "#10B981" },

  // Clinic Banner
  clinicBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E3A8A",
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
    marginTop: 12,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  bannerSub: { color: "#93C5FD", fontSize: 12 },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Menu
  menuGroup: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 32, alignItems: "center" },
  menuLabel: { fontSize: 15, fontWeight: "500", color: "#1E293B" },
  menuDiv: { height: 1, backgroundColor: "#F8FAFC", marginLeft: 48 },

  logoutBtn: { alignItems: "center", padding: 16 },
  logoutText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#CBD5E1",
    marginTop: 8,
  },
});
