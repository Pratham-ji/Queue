import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  name: string;
  image: string;
  rating: number;
  location: string;
  time: string;
  type: string;
  status: string;
  onPress: () => void;
}

// Export Default to match your import preference
export default function BigHospitalCard({
  name,
  image,
  rating,
  location,
  time,
  type,
  status,
  onPress,
}: Props) {
  const isAvailable = status === "available";

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Image Container with Skeleton Background */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Badges */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isAvailable ? "#10B981" : "#F59E0B" },
          ]}
        >
          <Text style={styles.statusText}>
            {isAvailable ? "Available Today" : "Limited Slots"}
          </Text>
        </View>

        <View style={styles.ratingBadge}>
          <Text style={styles.ratingNum}>{rating}</Text>
          <Ionicons
            name="star"
            size={10}
            color="#fff"
            style={{ marginLeft: 2 }}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{type}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.metaText}>{location}</Text>
          <Text style={styles.dot}>•</Text>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.metaText}>{time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    // Industry standard soft shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  imageWrapper: {
    height: 170, // Slightly taller for premium feel
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E5E7EB", // Skeleton color
  },
  image: { width: "100%", height: "100%" },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  ratingBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingNum: { color: "#fff", fontSize: 12, fontWeight: "700" },
  content: { padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },
  typeTag: {
    backgroundColor: "#F0F5FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: { fontSize: 10, color: "#0052CC", fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 13, color: "#666", marginLeft: 4 },
  dot: { marginHorizontal: 8, color: "#CCC" },
});
