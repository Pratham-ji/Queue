import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

// IMPORTS FROM OUR NEW ARCHITECTURE
import { COLORS, SIZES, SHADOWS } from "../../theme";
import Header from "../../components/Header";
import PrimaryButton from "../../components/PrimaryButton";
import { useQueueStore } from "../../store/queueStore";

const { width } = Dimensions.get("window");

// Reusable Stat Component (Local)
const StatBox = ({ icon, value, label, color }: any) => (
  <View style={styles.statBox}>
    <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function DashboardScreen({ navigation }: any) {
  // CONNECT TO LIVE DATA STORE
  const {
    currentPatient,
    stats,
    isOnline,
    toggleOnline,
    callNextPatient,
    queue,
  } = useQueueStore();

  const handleCallNext = () => {
    callNextPatient();
    // In a real app, trigger haptic feedback here
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* 1. REUSABLE HEADER (With Settings Link) */}
      <Header
        title="Dashboard"
        rightIcon="settings-outline"
        onRightPress={() => navigation.navigate("Settings")}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. WELCOME & STATUS SECTION */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.docName}>Dr. Trafalgar Law</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleOnline}
            style={[
              styles.statusBadge,
              {
                backgroundColor: isOnline ? "#ECFDF5" : "#FEF2F2",
                borderColor: isOnline ? "#A7F3D0" : "#FECACA",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? COLORS.success : COLORS.danger },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isOnline ? COLORS.success : COLORS.danger },
              ]}
            >
              {isOnline ? "ONLINE" : "PAUSED"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. MAIN "UNICORN" CARD (Gradient + Glass) */}
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          style={styles.mainCardShadow}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            {/* Live Indicator */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>NOW SERVING</Text>
              <View style={styles.liveTag}>
                <Animatable.View
                  animation="pulse"
                  iterationCount="infinite"
                  style={styles.liveDot}
                />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            {/* The Big Token Number */}
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenSymbol}>#</Text>
              <Animatable.Text
                key={currentPatient?.token} // Triggers animation on change
                animation="rubberBand" // Bouncy effect
                style={styles.tokenNumber}
              >
                {currentPatient ? currentPatient.token : "--"}
              </Animatable.Text>
            </View>

            {/* Patient Details */}
            <View style={styles.patientInfo}>
              <Text style={styles.patientName} numberOfLines={1}>
                {currentPatient
                  ? currentPatient.name
                  : "Waiting for patients..."}
              </Text>
              <Text style={styles.patientMeta}>
                {currentPatient
                  ? `${currentPatient.type} • Arrived ${currentPatient.arrivalTime}`
                  : "Queue is currently empty"}
              </Text>
            </View>
          </LinearGradient>

          {/* 4. OVERLAPPING ACTION PANEL */}
          <View style={styles.actionPanel}>
            <View style={styles.queueInfo}>
              <Ionicons name="people" size={20} color={COLORS.subText} />
              <Text style={styles.queueText}>
                <Text style={styles.queueBold}>{queue.length}</Text> Patients
                Waiting
              </Text>
            </View>

            <View style={styles.btnRow}>
              {/* Secondary Button (View List) */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate("PatientList")}
              >
                <Text style={styles.secondaryBtnText}>View Queue</Text>
              </TouchableOpacity>

              {/* Primary Action (Call Next) */}
              <View style={{ flex: 1.5 }}>
                <PrimaryButton
                  label="Call Next"
                  onPress={handleCallNext}
                  disabled={queue.length === 0}
                  style={{ height: 50, borderRadius: 14 }}
                />
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* 5. STATS GRID (Using Design System) */}
        <Text style={styles.sectionTitle}>Session Performance</Text>
        <View style={styles.statsGrid}>
          <StatBox
            icon="checkmark-circle"
            value={stats.completed}
            label="Done"
            color={COLORS.primary}
          />
          <StatBox
            icon="time"
            value={stats.avgTime}
            label="Avg Time"
            color={COLORS.success}
          />
          <StatBox
            icon="alert-circle"
            value="2"
            label="No Show"
            color={COLORS.danger}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SIZES.padding, paddingBottom: 40 },

  // Welcome Section
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.subText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  docName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },

  // Main Card
  mainCardShadow: { ...SHADOWS.medium, marginBottom: 32 },
  mainCard: {
    padding: 24,
    borderRadius: 32,
    paddingBottom: 60,
    position: "relative",
    overflow: "hidden",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFF",
    marginRight: 6,
  },
  liveText: { color: "#FFF", fontSize: 10, fontWeight: "800" },

  tokenContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 24,
  },
  tokenSymbol: {
    fontSize: 40,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    marginTop: 12,
  },
  tokenNumber: {
    fontSize: 80,
    color: "#FFF",
    fontWeight: "900",
    lineHeight: 85,
    marginLeft: 4,
  },

  patientInfo: { marginBottom: 16 },
  patientName: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "700",
    marginBottom: 4,
  },
  patientMeta: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },

  // Action Panel (Overlaps the card)
  actionPanel: {
    backgroundColor: COLORS.surface,
    marginTop: -40,
    marginHorizontal: 0,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.medium,
  },
  queueInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  queueText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.subText,
    fontWeight: "500",
  },
  queueBold: { color: COLORS.text, fontWeight: "700" },

  btnRow: { flexDirection: "row", gap: 12 },
  secondaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFF",
  },
  secondaryBtnText: { color: COLORS.text, fontWeight: "600", fontSize: 14 },

  // Stats Grid
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  statsGrid: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  statLabel: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 4,
    fontWeight: "500",
  },
});
