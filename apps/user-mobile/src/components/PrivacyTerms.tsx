import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#6B7280",
  bg: "#F3F4F6",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  danger: "#EF4444",
};

// Privacy & Terms reusable component
export default function PrivacyTerms({ onClose }: { onClose?: () => void }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
      <Policy
        title="Privacy Policy"
        text="Your personal and medical data is encrypted and never shared."
      />
      <Policy
        title="Terms & Conditions"
        text="Once an appointment is booked, it cannot be cancelled."
      />
      <Policy
        title="Permissions"
        text="Only required permissions are requested for core features."
      />
    </View>
  );
}

const Policy = ({ title, text }: any) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 16,
  },
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  text: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 4,
  },
  closeBtn: {
    alignSelf: "flex-end",
    padding: 12,
  },
  closeText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
