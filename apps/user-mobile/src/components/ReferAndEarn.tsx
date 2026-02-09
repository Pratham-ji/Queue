import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#6B7280",
  bg: "#F3F4F6",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  accent: "#FBBF24",
};

export default function ReferAndEarn({ onClose }: { onClose?: () => void }) {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        {/* ICON SECTION */}
        <View style={styles.iconCircle}>
          <Ionicons name="gift" size={80} color={COLORS.accent} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Invite Friends, Get Rewards</Text>
          <Text style={styles.description}>
            Share Queue Pro with your friends and family. Earn exclusive benefits and skip the wait times!
          </Text>
        </View>

        {/* COMING SOON BADGE */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>COMING SOON</Text>
        </View>

        {/* INFO CARDS */}
        <View style={styles.infoRow}>
          <InfoCard icon="share-social" label="Invite" />
          <Ionicons name="arrow-forward" size={20} color={COLORS.border} />
          <InfoCard icon="person-add" label="Sign Up" />
          <Ionicons name="arrow-forward" size={20} color={COLORS.border} />
          <InfoCard icon="trophy" label="Reward" />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>We're bringing rewards to Dehradun very soon!</Text>
      </View>
    </View>
  );
}

const InfoCard = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.infoCard}>
    <View style={styles.smallIconCircle}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.infoLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  backBtn: { padding: 8 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    borderWidth: 2,
    borderColor: COLORS.accent,
    elevation: 4,
  },
  textContainer: { alignItems: "center", marginBottom: 30 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, textAlign: "center", marginBottom: 12 },
  description: { fontSize: 14, color: COLORS.subText, textAlign: "center", lineHeight: 22 },
  badge: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 30, marginBottom: 50 },
  badgeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", letterSpacing: 1.5 },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" },
  infoCard: { alignItems: "center", flex: 1 },
  smallIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  infoLabel: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  footer: { padding: 30 },
  footerText: { textAlign: "center", color: COLORS.subText, fontSize: 12, fontStyle: "italic" },
});