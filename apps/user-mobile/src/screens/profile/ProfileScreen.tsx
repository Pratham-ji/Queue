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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useNavigation } from "@react-navigation/native";

// --- THEME ---
const COLORS = {
  primary: "#F43F5E", // Zomato-style Coral/Red for accents
  dark: "#0F172A", // Slate-900
  text: "#111827",
  subText: "#6B7280",
  bg: "#F8FAFC", // Off-white clean bg
  surface: "#FFFFFF",
  border: "#E2E8F0",
  gold: "#F59E0B", // Gold member color
  highlight: "#FEF3C7",
};

// --- REUSABLE COMPONENTS ---
const SettingItem = ({ icon, label, onPress, subtitle }: any) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={22} color={COLORS.text} />
    </View>
    <View style={styles.settingTextContent}>
      <Text style={styles.settingLabel}>{label}</Text>
      {subtitle && <Text style={styles.settingSub}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive" },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* === ZOMATO-TIER PROFILE HEADER === */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={["#1E293B", "#0F172A"]}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            {/* Geometric faint overlay could be added via ImageBackground, using simple shapes for now */}
            <View style={styles.identityRow}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?u=pratham" }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Pratham Raj</Text>
                <Text style={styles.userPhone}>+91 98765 43210</Text>
                <TouchableOpacity style={styles.editProfileBtn}>
                  <Text style={styles.editProfileText}>Edit profile ▸</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* === THE STATUS ROW (Gold Member banner) === */}
          <View style={styles.statusRow}>
            <LinearGradient
              colors={["#FEF3C7", "#FDE68A"]} // Gold gradient
              style={styles.goldBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.goldLeft}>
                <Ionicons name="star" size={20} color={COLORS.gold} />
                <Text style={styles.goldTitle}>Queue Plus Member</Text>
              </View>
              <View style={styles.goldBadge}>
                <Text style={styles.goldBadgeText}>Saved 2 hrs of waiting</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* === QUICK-ACCESS WIDGETS === */}
        <View style={styles.widgetRow}>
          <TouchableOpacity style={styles.widgetCard} activeOpacity={0.8}>
            <View style={[styles.widgetIconWrap, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="wallet" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.widgetTitle}>Wallet Credits</Text>
            <Text style={styles.widgetValue}>₹ 450</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.widgetCard} activeOpacity={0.8}>
            <View style={[styles.widgetIconWrap, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="document-text" size={24} color="#059669" />
            </View>
            <Text style={styles.widgetTitle}>Active Prescriptions</Text>
            <Text style={styles.widgetValue}>2 New</Text>
          </TouchableOpacity>
        </View>

        {/* === UNICORN FEATURES (LIST SECTIONS) === */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>Medical & Family</Text>
          <View style={styles.sectionBlock}>
            <SettingItem 
              icon="people-circle-outline" 
              label="Family Profiles" 
              subtitle="Manage family members" 
            />
            <View style={styles.divider} />
            <SettingItem 
              icon="medkit-outline" 
              label="Medical Vault" 
              subtitle="Lab reports & saved prescriptions" 
            />
            <View style={styles.divider} />
            <SettingItem 
              icon="time-outline" 
              label="Visit History" 
              subtitle="Past appointments and clinics" 
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>App Preferences</Text>
          <View style={styles.sectionBlock}>
            <SettingItem 
              icon="contrast-outline" 
              label="Accessibility" 
              subtitle="High contrast & text size" 
            />
            <View style={styles.divider} />
            <SettingItem 
              icon="notifications-outline" 
              label="Notifications" 
              subtitle="Push & SMS alerts" 
            />
            <View style={styles.divider} />
            <SettingItem 
              icon="card-outline" 
              label="Payment Methods" 
              subtitle="Manage cards & UPI" 
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 120, // for bottom tab bar
  },
  headerWrapper: {
    backgroundColor: COLORS.bg,
    marginBottom: 24,
  },
  heroCard: {
    paddingTop: 16,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 8,
  },
  editProfileBtn: {
    alignSelf: "flex-start",
  },
  editProfileText: {
    fontSize: 13,
    color: "#38BDF8",
    fontWeight: "600",
  },
  
  statusRow: {
    marginTop: -24, // Overlap the dark card
    marginHorizontal: 16,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  goldBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  goldLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  goldTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#92400E",
    marginLeft: 8,
  },
  goldBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  goldBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B45309",
  },

  widgetRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 32,
    gap: 16,
  },
  widgetCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  widgetIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 13,
    color: COLORS.subText,
    marginBottom: 4,
    fontWeight: "500",
  },
  widgetValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
    marginLeft: 8,
  },
  sectionBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingTextContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 13,
    color: COLORS.subText,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 56, // Align with text
  },

  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FEE2E2",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  logoutText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
