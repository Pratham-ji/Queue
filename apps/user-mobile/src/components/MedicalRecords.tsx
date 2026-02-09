import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
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
};

export default function MedicalRecords({
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
          <Text style={styles.headerTitle}>Medical Records</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color={COLORS.subText} />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <View style={styles.centerContent}>
          <View style={styles.card}>
            <Text style={styles.comingSoon}>Coming Soon</Text>
            <Text style={styles.subText}>
              Your medical history and reports will be available here.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

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

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: COLORS.surface,
    width: "100%",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  comingSoon: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 10,
  },

  subText: {
    fontSize: 14,
    color: COLORS.subText,
    textAlign: "center",
  },
});
