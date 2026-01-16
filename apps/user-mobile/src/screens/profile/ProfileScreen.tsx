import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// --- THEME ---
const COLORS = {
  primary: "#047857", // Emerald Green (Trust)
  dark: "#064E3B", // Darker Green for contrast
  text: "#111827",
  subText: "#6B7280",
  bg: "#F3F4F6", // Light Grey Background
  surface: "#FFFFFF",
  border: "#E5E7EB",
  danger: "#EF4444",
  highlight: "#D1FAE5", // Very light green
};

// --- REUSABLE COMPONENTS ---

// 1. Settings Row
const SettingItem = ({ icon, label, onPress, isDestructive = false }: any) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconBox, isDestructive && styles.destructiveBox]}>
      <Ionicons
        name={icon}
        size={20}
        color={isDestructive ? COLORS.danger : "#4B5563"}
      />
    </View>
    <Text
      style={[styles.settingLabel, isDestructive && styles.destructiveText]}
    >
      {label}
    </Text>
    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
  </TouchableOpacity>
);

// 2. Section Header
const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive" },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={COLORS.text}
          />
          <View style={styles.redDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* === CONTAINER 1: THE IDENTITY & SNAPSHOT CARD === */}
        <View style={styles.heroCard}>
          {/* Top Row: Identity */}
          <View style={styles.identityRow}>
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Rahul Sharma</Text>
              <Text style={styles.userHandle}>+91 98765 43210</Text>
              <View style={styles.membershipBadge}>
                <Text style={styles.memberText}>Basic Member</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editIconBtn}>
              <Ionicons
                name="create-outline"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Bottom Row: Health Snapshot (The Mixture) */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>2</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>14</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>3</Text>
              <Text style={styles.statLabel}>Records</Text>
            </View>
          </View>
        </View>

        {/* === CONTAINER 2: PAST APPOINTMENTS (History) === */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionTop}>
            <Text style={styles.sectionHeaderTitle}>Recent History</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          {/* History Card */}
          <View style={styles.historyCard}>
            <View style={styles.historyLeft}>
              <View style={styles.docAvatarPlaceholder}>
                <Text style={styles.docInitials}>LP</Text>
              </View>
              <View>
                <Text style={styles.historyDoc}>Dr. Leorio Paradinight</Text>
                <Text style={styles.historyDate}>
                  Hunter Association • Yesterday
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.rebookBtn}>
              <Text style={styles.rebookText}>Re-book</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* === CONTAINER 3: SERVICE PROVIDER CTA === */}
        <TouchableOpacity style={styles.providerBanner} activeOpacity={0.9}>
          <View>
            <Text style={styles.providerTitle}>Are you a Doctor?</Text>
            <Text style={styles.providerSub}>
              Create a business profile and{"\n"}manage your queue.
            </Text>
          </View>
          <View style={styles.providerIconCircle}>
            <Ionicons name="briefcase" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* === SETTINGS & UTILITY === */}
        <SectionHeader title="Account & Security" />
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="person-outline"
            label="Personal Information"
            onPress={() => {}}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="card-outline"
            label="Payment Methods"
            onPress={() => {}}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="lock-closed-outline"
            label="Login & Security"
            onPress={() => {}}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="document-text-outline"
            label="Medical Records"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="Support & Legal" />
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => {}}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="gift-outline"
            label="Refer & Earn"
            onPress={() => {}}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="shield-checkmark-outline"
            label="Privacy & Terms"
            onPress={() => {}}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionInfo}>
          Queue App v1.0.0 • Made for Dehradun
        </Text>
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  bellBtn: {
    position: "relative",
    padding: 4,
  },
  redDot: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1,
    borderColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // === HERO CARD (The Mixture) ===
  heroCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    // Premium Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  userHandle: {
    fontSize: 13,
    color: COLORS.subText,
    marginBottom: 4,
  },
  membershipBadge: {
    backgroundColor: COLORS.highlight,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  memberText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  editIconBtn: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNum: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.subText,
    marginTop: 2,
  },
  verticalLine: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
  },

  // === RECENT HISTORY ===
  sectionWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  docAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE", // Light blue
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  docInitials: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 14,
  },
  historyDoc: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 2,
  },
  rebookBtn: {
    backgroundColor: COLORS.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rebookText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // === PROVIDER CTA ===
  providerBanner: {
    marginHorizontal: 20,
    backgroundColor: "#111827", // Black
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  providerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  providerSub: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  providerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // === SETTINGS ===
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.subText,
    marginLeft: 24,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  iconBox: {
    width: 32,
    alignItems: "center",
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 8,
    fontWeight: "500",
  },
  destructiveBox: {
    // optional styling
  },
  destructiveText: {
    color: COLORS.danger,
    fontWeight: "600",
  },
  settingDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 56, // indent
  },

  // === LOGOUT ===
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    marginBottom: 24,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: "700",
    marginLeft: 8,
  },
  versionInfo: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 20,
  },
});
