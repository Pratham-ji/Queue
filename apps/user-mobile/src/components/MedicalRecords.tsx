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

// Medical Records reusable component
export default function MedicalRecords({ onClose }: { onClose?: () => void }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
      <Text style={styles.text}>
          Coming Soon.......
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  text: {
    fontSize: 14,
    color: COLORS.subText,
    textAlign: "center",
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
