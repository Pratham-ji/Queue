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

// Login & Security reusable component
export default function LoginSecurity({ onClose }: { onClose?: () => void }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
      <Row label="Password" value="Last changed 2 months ago" />
      <Row label="Active Devices" value="2 devices logged in" />
      <Row label="Two-Factor Authentication" value="Disabled" />
    </View>
  );
}

const Row = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
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
  label: {
    fontSize: 13,
    color: COLORS.subText,
  },
  value: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 4,
    fontWeight: "500",
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
