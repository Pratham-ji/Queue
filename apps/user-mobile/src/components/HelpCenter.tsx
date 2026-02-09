import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* 🩺 Medical / Hospital Colors */
const COLORS = {
  primary: "#0F766E",        // medical green
  lightGreen: "#E7F5F2",
  text: "#0F172A",
  subText: "#6B7280",
  bg: "#F1F5F9",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  info: "#2563EB",
};

export default function HelpCenter({ onClose }: { onClose?: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      {/* FULL SCREEN CURVED PAGE */}
      <View style={styles.curvedContainer}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color={COLORS.subText} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. HOW TO BOOK */}
          <Section title="How to book an appointment?" icon="calendar-outline">
            <Step text="Search & Select: Find your preferred doctor or clinic by name, specialty, or location." />
            <Step text="Real-time Slots: Choose a date and an available time slot that fits your schedule." />
            <Step text="Instant Confirmation: Once you book, you’ll receive a Queue ID and live ETA." />
            <Step text="One-tap Booking: Re-book doctors directly from your history." />
          </Section>

          {/* 2. QUEUE */}
          <Section title="How the queue works?" icon="people-outline">
            <Step text="Virtual Check-in: Your phone acts as your queue token." />
            <Step text="Live Tracking: See how many patients are ahead of you." />
            <Step text="Smart Alerts: Get notified when it’s almost your turn." />
            <Step text="Auto ETA: Queue time adjusts automatically." />
          </Section>

          {/* 3. CANCELLATION */}
          <Section title="Cancellation Policy" icon="shield-checkmark-outline">
            <Step text="Slots are reserved exclusively once booked." />
            <Step text="Reschedule instead of cancelling within 2 hours." />
            <Step text="Confirmed bookings are non-refundable." />
          </Section>

          {/* CONTACT */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactSub}>Our medical support team is available 24/7</Text>

            <TouchableOpacity
              style={styles.contactAction}
              onPress={() => Linking.openURL("mailto:support@queueapp.com")}
            >
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>support@queueapp.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactAction}
              onPress={() => Linking.openURL("tel:+919634892889")}
            >
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>+91 96348 92889</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>Queue Pro Medical Support • Dehradun</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* SECTION */
const Section = ({ title, icon, children }: any) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

/* STEP */
const Step = ({ text }: { text: string }) => (
  <View style={styles.stepRow}>
    <View style={styles.bullet} />
    <Text style={styles.stepText}>{text}</Text>
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

  section: {
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

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 10,
  },

  stepRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
    marginRight: 10,
  },

  stepText: {
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 18,
    flex: 1,
  },

  contactCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },

  contactTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  contactSub: {
    color: "#D1FAE5",
    fontSize: 12,
    marginBottom: 16,
    textAlign: "center",
  },

  contactAction: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    width: "100%",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actionText: {
    marginLeft: 10,
    fontWeight: "600",
    color: COLORS.text,
  },

  footerText: {
    textAlign: "center",
    color: COLORS.subText,
    fontSize: 11,
    marginTop: 24,
  },
});
