import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#6B7280",
  bg: "#F3F4F6",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  danger: "#EF4444",
  info: "#3B82F6",
};

export default function HelpCenter({ onClose }: { onClose?: () => void }) {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close-circle" size={28} color={COLORS.subText} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. HOW TO BOOK */}
        <Section title="How to book an appointment?" icon="calendar-outline">
          <Step text="Search & Select: Find your preferred doctor or clinic by name, specialty, or location." />
          <Step text="Real-time Slots: Choose a date and an available time slot that fits your schedule." />
          <Step text="Instant Confirmation: Once you book, you’ll receive a 'Queue ID' and a real-time ETA." />
          <Step text="One-tap Booking: Re-book your previous doctors directly from your profile history." />
        </Section>

        {/* 2. HOW QUEUE WORKS */}
        <Section title="How the queue works?" icon="people-outline">
          <Step text="Virtual Check-in: Your phone is your ticket; no need to stand in physical lines." />
          <Step text="Live Tracking: See exactly how many people are ahead of you in real-time." />
          <Step text="Smart Notifications: Get an alert when you are '3rd in line' to head to the clinic." />
          <Step text="Buffer Management: The system adjusts ETA automatically based on appointment progress." />
        </Section>

        {/* 3. CANCELLATION POLICY */}
        <Section title="Cancellation Policy" icon="shield-alert-outline">
          <Step text="Slot Integrity: Once booked, the time is strictly blocked for you, preventing others from access." />
          <Step text="No-Show Policy: We encourage rescheduling rather than cancellation within 2 hours." />
          <Step text="Refund Policy: Payments for confirmed slots are non-refundable to ensure commitment." />
        </Section>

        {/* 4. CONTACT SUPPORT */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>Our team is available 24/7</Text>
          
          <TouchableOpacity 
            style={styles.contactAction} 
            onPress={() => Linking.openURL('mailto:support@queueapp.com')}
          >
            <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>support@queueapp.com</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactAction} 
            onPress={() => Linking.openURL('tel:+9196xxxxxxx89')}
          >
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>+91 96348 92889</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Queue Pro Support • Dehradun</Text>
      </ScrollView>
    </View>
  );
}

// Reusable Section Component
const Section = ({ title, icon, children }: any) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

// Reusable Step/Bullet Component
const Step = ({ text }: { text: string }) => (
  <View style={styles.stepRow}>
    <View style={styles.bullet} />
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    paddingRight: 10,
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
    backgroundColor: COLORS.text, // Dark card for contrast
    borderRadius: 16,
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
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 16,
  },
  contactAction: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    width: "100%",
    padding: 12,
    borderRadius: 12,
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
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 20,
    marginBottom: 40,
  }
});