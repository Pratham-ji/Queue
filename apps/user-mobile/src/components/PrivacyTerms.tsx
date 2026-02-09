import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* 🩺 Medical / Hospital Colors */
const COLORS = {
  primary: "#0F766E",
  lightGreen: "#E7F5F2",
  text: "#0F172A",
  subText: "#6B7280",
  bg: "#F1F5F9",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  danger: "#DC2626",
};

export default function PrivacyTerms({
  onClose,
}: {
  onClose?: () => void;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      {/* FULL SCREEN CURVED PAGE */}
      <View style={styles.curvedContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Privacy & Terms</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color={COLORS.subText} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* PRIVACY */}
          <PolicyCard
            icon="lock-closed-outline"
            title="Privacy Policy"
            text="Your personal and medical data is securely encrypted and never shared with third parties without consent."
          />

          {/* TERMS */}
          <PolicyCard
            icon="document-text-outline"
            title="Terms & Conditions"
            text="Once an appointment is booked, it cannot be cancelled. Please review all details before confirming."
          />

          {/* PERMISSIONS */}
          <PolicyCard
            icon="shield-checkmark-outline"
            title="Permissions"
            text="Only essential permissions are requested to ensure core medical and appointment features work smoothly."
          />

          <Text style={styles.footerText}>
            Queue Pro • Medical Privacy & Compliance
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* 🔹 POLICY CARD */
const PolicyCard = ({
  icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={styles.cardText}>{text}</Text>
  </View>
);

/* 🎨 STYLES */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  curvedContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  closeBtn: {
    padding: 6,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 10,
  },

  cardText: {
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 18,
  },

  footerText: {
    textAlign: "center",
    fontSize: 11,
    color: COLORS.subText,
    marginTop: 30,
  },
});
