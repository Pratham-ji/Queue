import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DoctorProps {
  name: string;
  specialty: string;
  experience: string;
  nextSlot: string;
  image: string;
  onBookPress: () => void;
}

export const DoctorCard: React.FC<DoctorProps> = ({
  name,
  specialty,
  experience,
  nextSlot,
  image,
  onBookPress,
}) => {
  return (
    <View style={styles.card}>
      {/* 1. Avatar & Info */}
      <View style={styles.mainRow}>
        <Image source={{ uri: image }} style={styles.avatar} />

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.specialty}>{specialty}</Text>
          <Text style={styles.exp}>{experience} exp</Text>
        </View>

        {/* Rating/Badge (Optional) */}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingText}>4.9</Text>
        </View>
      </View>

      {/* 2. Divider Line */}
      <View style={styles.divider} />

      {/* 3. Footer: Availability + Action */}
      <View style={styles.footer}>
        <View style={styles.slotInfo}>
          <Ionicons name="calendar-outline" size={14} color="#047857" />
          <Text style={styles.slotText}>Next: {nextSlot}</Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.8}
          onPress={onBookPress}
        >
          <Text style={styles.bookBtnText}>Book Visit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Industry Shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  mainRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  specialty: {
    fontSize: 13,
    color: "#047857", // Brand Green
    fontWeight: "500",
    marginBottom: 2,
  },
  exp: {
    fontSize: 12,
    color: "#6B7280",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB", // Light Yellow
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    height: 24,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B45309", // Dark Yellow
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5", // Light Green bg
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  slotText: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "600",
    marginLeft: 6,
  },
  bookButton: {
    backgroundColor: "#111827", // Black Button (High Contrast)
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
