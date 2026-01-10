import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#6B7280",
  border: "#E5E7EB",
  bg: "#FFFFFF",
  overlay: "rgba(0,0,0,0.5)",
};

export default function FilterModal({
  visible,
  onClose,
  onApply,
}: FilterModalProps) {
  // Local State for Filters
  const [sortBy, setSortBy] = useState("Recommended");
  const [distance, setDistance] = useState("5 km");
  const [availability, setAvailability] = useState("Any");

  const handleApply = () => {
    onApply({ sortBy, distance, availability });
    onClose();
  };

  const renderOption = (
    label: string,
    current: string,
    setFn: (val: string) => void,
  ) => {
    const isSelected = current === label;
    return (
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.activeChip]}
        onPress={() => setFn(label)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Overlay to close modal when tapping outside */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Main Content Sheet */}
      <View style={styles.sheetContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.content}>
          {/* Section 1: Sort By */}
          <Text style={styles.sectionLabel}>Sort By</Text>
          <View style={styles.chipRow}>
            {renderOption("Recommended", sortBy, setSortBy)}
            {renderOption("Rating", sortBy, setSortBy)}
            {renderOption("Distance", sortBy, setSortBy)}
          </View>

          {/* Section 2: Distance */}
          <Text style={styles.sectionLabel}>Distance</Text>
          <View style={styles.chipRow}>
            {renderOption("< 2 km", distance, setDistance)}
            {renderOption("5 km", distance, setDistance)}
            {renderOption("10 km +", distance, setDistance)}
          </View>

          {/* Section 3: Availability */}
          <Text style={styles.sectionLabel}>Availability</Text>
          <View style={styles.chipRow}>
            {renderOption("Any", availability, setAvailability)}
            {renderOption("Open Now", availability, setAvailability)}
            {renderOption("24/7", availability, setAvailability)}
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSortBy("Recommended");
              setDistance("5 km");
              setAvailability("Any");
            }}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>Show Results</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  sheetContainer: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "60%", // Takes up 60% of screen
    marginTop: "auto", // Pushes it to the bottom
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  content: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  activeChip: {
    borderColor: COLORS.primary,
    backgroundColor: "#ECFDF5", // Light Green
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  activeChipText: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 30, // Extra padding for home bar
  },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resetText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.subText,
    textDecorationLine: "underline",
  },
  applyBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 10,
  },
  applyText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
