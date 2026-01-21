import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme";

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

export default function SettingsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color="#0F172A" />
          <View style={styles.redDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>TL</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>Dr. Trafalgar Law</Text>
              <Text style={styles.role}>Senior Surgeon • Heart Pirates</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>VERIFIED</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <ProfileStat value="18" label="Served" />
            <View style={styles.vDiv} />
            <ProfileStat value="12" label="Waiting" />
            <View style={styles.vDiv} />
            <ProfileStat value="4.9" label="Rating" />
          </View>
        </View>

        {/* 2. RECENT HISTORY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT SESSION</Text>
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          <View style={styles.historyAvatar}>
            <Text style={styles.historyInitials}>AM</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.historyName}>Alice M.</Text>
            <Text style={styles.historyDetail}>General Check-up • Today</Text>
          </View>
          <TouchableOpacity style={styles.detailsBtn}>
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>
        </View>

        {/* 3. CLINIC STATUS (Dark Blue Banner) */}
        <View style={styles.clinicBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Clinic Status</Text>
            <Text style={styles.bannerSub}>
              Manage your visibility and queue settings.
            </Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="business" size={20} color="#FFF" />
          </View>
        </View>

        {/* 4. SETTINGS MENU */}
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

        {/* 5. LOGOUT */}
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
  redDot: {
    position: "absolute",
    top: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1,
    borderColor: "#F8FAFC",
  },

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
  avatarText: { fontSize: 24, fontWeight: "700", color: COLORS.primary },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  role: { fontSize: 13, color: "#64748B", marginBottom: 6 },
  badge: {
    backgroundColor: "#ECFDF5",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#059669" },
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
  linkText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },

  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailsText: { fontSize: 12, fontWeight: "600", color: "#475569" },

  // Clinic Banner
  clinicBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  bannerSub: { color: "#94A3B8", fontSize: 12 },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
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
