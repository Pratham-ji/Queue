import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#6B7280",
  bg: "#F9FAFB",
  surface: "#FFFFFF",
};

// Reusable Big Action Card
const ActionCard = ({ title, subtitle, icon, onPress }: any) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.content}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{subtitle}</Text>
    </View>
    <View style={styles.iconCircle}>
      <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
    </View>
  </TouchableOpacity>
);

export default function CreateScreen() {
  // Empty State / Backend Placeholder Handler
  const handlePress = (feature: string) => {
    Alert.alert(
      "Coming Soon",
      `The '${feature}' portal is being built. This will connect to the Provider Backend.`,
      [{ text: "OK" }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* OPTION 1: Custom Queue */}
        <ActionCard
          title="Create a custom queue"
          subtitle="For clinics, events, or services. Generate a QR code instantly."
          icon="people"
          onPress={() => handlePress("Custom Queue")}
        />

        {/* OPTION 2: Service Provider */}
        <ActionCard
          title="Register as service provider"
          subtitle="Doctors, clinics, and businesses. Manage your appointments professionally."
          icon="briefcase"
          onPress={() => handlePress("Service Provider Registration")}
        />
      </View>

      {/* Bottom Illustration or Note (Optional visual balance) */}
      <View style={styles.footerNote}>
        <Ionicons
          name="shield-checkmark-outline"
          size={16}
          color={COLORS.subText}
        />
        <Text style={styles.footerText}>Verified Provider Portal</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  contentContainer: {
    padding: 20,
    gap: 16, // Space between cards
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 14,
    color: COLORS.subText,
    lineHeight: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF5", // Light Green
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto", // Pushes to bottom
    marginBottom: 100, // Clear the tab bar
    opacity: 0.7,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.subText,
    marginLeft: 6,
    fontWeight: "500",
  },
});
