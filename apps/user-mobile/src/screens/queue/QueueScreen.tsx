import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#047857", // Emerald Green
  bg: "#F3F4F6", // Light Grey Background
  surface: "#FFFFFF",
  text: "#111827",
  subText: "#6B7280",
  accent: "#10B981", // Brighter Green for "Live" elements
};

export default function QueueScreen() {
  const [refreshing, setRefreshing] = useState(false);

  // Mock Refresh Logic
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Queue</Text>
        <View style={styles.liveBadge}>
          <View style={styles.dot} />
          <Text style={styles.liveText}>LIVE UPDATES</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* 2. THE TICKET CARD (Hero) */}
        <View style={styles.ticketCard}>
          {/* Hospital Info */}
          <View style={styles.hospitalRow}>
            <Ionicons name="location" size={16} color={COLORS.subText} />
            <Text style={styles.hospitalName}>
              Synergy Hospital • Cardiology
            </Text>
          </View>

          <View style={styles.divider} />

          {/* The Big Token */}
          <View style={styles.tokenSection}>
            <Text style={styles.tokenLabel}>YOUR TOKEN</Text>
            <Text style={styles.tokenNumber}>#45</Text>
            <View style={styles.etaContainer}>
              <Ionicons name="time-outline" size={16} color="#FFF" />
              <Text style={styles.etaText}>Est. Wait: 25 mins</Text>
            </View>
          </View>

          {/* Current Status Footer */}
          <View style={styles.ticketFooter}>
            <View>
              <Text style={styles.footerLabel}>Current Token</Text>
              <Text style={styles.footerValue}>#42</Text>
            </View>
            <View style={styles.verticalLine} />
            <View>
              <Text style={styles.footerLabel}>People Ahead</Text>
              <Text style={styles.footerValue}>2</Text>
            </View>
            <View style={styles.verticalLine} />
            <View>
              <Text style={styles.footerLabel}>Status</Text>
              <Text style={[styles.footerValue, { color: COLORS.primary }]}>
                On Time
              </Text>
            </View>
          </View>
        </View>

        {/* 3. TIMELINE (Visual Progress) */}
        <Text style={styles.sectionTitle}>Queue Status</Text>
        <View style={styles.timelineCard}>
          {/* Step 1: Completed */}
          <View style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <View style={[styles.circle, styles.circleDone]}>
                <Ionicons name="checkmark" size={14} color="#FFF" />
              </View>
              <View style={[styles.line, styles.lineDone]} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Checked In</Text>
              <Text style={styles.stepTime}>10:45 AM</Text>
            </View>
          </View>

          {/* Step 2: Active (Pulse Effect Concept) */}
          <View style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <View style={[styles.circle, styles.circleActive]}>
                <View style={styles.innerDot} />
              </View>
              <View style={styles.line} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, styles.textActive]}>
                Waiting for Turn
              </Text>
              <Text style={styles.stepSub}>Doctor is seeing Token #42</Text>
            </View>
          </View>

          {/* Step 3: Future */}
          <View style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <View style={styles.circle} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, styles.textFuture]}>
                Consultation
              </Text>
              <Text style={styles.stepSub}>Approx 11:15 AM</Text>
            </View>
          </View>
        </View>

        {/* 4. HELP / ACTIONS */}
        <TouchableOpacity style={styles.secondaryBtn}>
          <Ionicons name="call-outline" size={20} color={COLORS.text} />
          <Text style={styles.btnText}>Contact Reception</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            { marginTop: 12, borderColor: "#FEE2E2" },
          ]}
        >
          <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
          <Text style={[styles.btnText, { color: "#EF4444" }]}>
            Leave Queue
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7", // Light green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // TICKET CARD
  ticketCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    // Deep Shadow for "Card" feel
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  hospitalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  hospitalName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.subText,
    marginLeft: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 20,
  },
  tokenSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  tokenLabel: {
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: "600",
    marginBottom: 8,
  },
  tokenNumber: {
    fontSize: 64, // HUGE FONT
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -2,
    lineHeight: 70,
  },
  etaContainer: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  etaText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
  },
  footerLabel: {
    fontSize: 11,
    color: COLORS.subText,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  verticalLine: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },

  // TIMELINE
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 0, // Handled by minHeight
    minHeight: 70,
  },
  stepLeft: {
    alignItems: "center",
    marginRight: 16,
    width: 24,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  circleDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  circleActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#ECFDF5",
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  lineDone: {
    backgroundColor: COLORS.primary,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  stepTime: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 2,
  },
  stepSub: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: "500",
  },
  textActive: {
    color: COLORS.primary,
  },
  textFuture: {
    color: "#9CA3AF",
  },

  // BUTTONS
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
  },
});
