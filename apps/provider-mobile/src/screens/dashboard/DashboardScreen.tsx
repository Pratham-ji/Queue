import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useQueueStore } from "../../store/queueStore";
import { COLORS } from "../../theme";

// --- MINIMAL HEADER ---
const DashboardHeader = ({ navigation, isOnline, toggleOnline }: any) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.greeting}>GOOD MORNING,</Text>
      <Text style={styles.docName}>Dr. Trafalgar Law</Text>
    </View>

    <View style={styles.headerRight}>
      <View
        style={[
          styles.statusPill,
          isOnline ? styles.pillOnline : styles.pillOffline,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isOnline ? "#10B981" : "#64748B" },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: isOnline ? "#065F46" : "#475569" },
          ]}
        >
          {isOnline ? "Online" : "Offline"}
        </Text>
        <Switch
          value={isOnline}
          onValueChange={toggleOnline}
          trackColor={{ false: "transparent", true: "transparent" }}
          thumbColor={isOnline ? "#10B981" : "#64748B"}
          style={{ transform: [{ scale: 0.6 }], marginRight: -6 }}
        />
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("Settings")}
        style={styles.profileBtn}
      >
        <Ionicons name="person" size={18} color="#1E293B" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function DashboardScreen({ navigation }: any) {
  const { currentPatient, isOnline, toggleOnline, callNextPatient, queue } =
    useQueueStore();

  const handleBroadcast = () => {
    Alert.alert(
      "Broadcast Announcement",
      "Send a notification to waiting patients?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Running Late (10m)",
          onPress: () => Alert.alert("Sent", "Notified: 10m Delay"),
        },
        {
          text: "Emergency",
          onPress: () => Alert.alert("Sent", "Notified: Emergency"),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <DashboardHeader
        navigation={navigation}
        isOnline={isOnline}
        toggleOnline={toggleOnline}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => {
            if (currentPatient) navigation.navigate("Consultation");
            else Alert.alert("Queue Empty", "Call a patient to start.");
          }}
        >
          <Animatable.View
            animation="fadeInUp"
            duration={600}
            style={styles.heroCardShadow}
          >
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>NOW SERVING</Text>
                {isOnline && (
                  <View style={styles.liveTag}>
                    <Animatable.View
                      animation="pulse"
                      iterationCount="infinite"
                      style={styles.liveDot}
                    />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
              </View>

              <View style={styles.tokenContainer}>
                <Text style={styles.hash}>#</Text>
                <Text style={styles.tokenVal}>
                  {currentPatient ? currentPatient.token : "--"}
                </Text>
              </View>

              <View style={styles.patientInfo}>
                <Text style={styles.pName}>
                  {currentPatient ? currentPatient.name : "No Active Patient"}
                </Text>
                <Text style={styles.pDetail}>
                  {currentPatient
                    ? `${currentPatient.type || "General Visit"} • ${currentPatient.arrivalTime || "Checked In"}`
                    : "Waiting for next patient..."}
                </Text>
              </View>
            </LinearGradient>

            {/* QUICK ACTIONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate("PatientList")}
              >
                <Ionicons name="list" size={20} color={COLORS.primary} />
                <Text style={styles.actionText}>Queue</Text>
              </TouchableOpacity>

              <View style={styles.vertDivider} />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleBroadcast}
              >
                <Ionicons
                  name="megaphone-outline"
                  size={20}
                  color={COLORS.warning}
                />
                <Text style={styles.actionText}>Notify</Text>
              </TouchableOpacity>

              <View style={styles.vertDivider} />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate("Scan")}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.actionText}>Scan</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </TouchableOpacity>

        {/* UP NEXT LIST */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UP NEXT</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{queue.length}</Text>
          </View>
        </View>

        {queue.length > 0 ? (
          <View style={styles.listContainer}>
            {queue.slice(0, 3).map((p, i) => (
              <View
                key={p.id}
                style={[
                  styles.listItem,
                  i === queue.length - 1 && styles.lastItem,
                ]}
              >
                <View style={styles.circleToken}>
                  <Text style={styles.circleText}>{p.token}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listName}>{p.name}</Text>
                  <Text style={styles.listType}>{p.type || "General"}</Text>
                </View>
                <View style={styles.waitBadge}>
                  <Text style={styles.waitText}>WAITING</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate("PatientList")}
            >
              <Text style={styles.viewAllText}>View All Waiting Patients</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cafe-outline" size={32} color="#CBD5E1" />
            <Text style={styles.emptyText}>Queue is clear.</Text>
            <Text style={styles.emptySub}>Enjoy your break, Doctor.</Text>
          </View>
        )}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <Animatable.View
        animation="slideInUp"
        duration={500}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!isOnline || queue.length === 0) && styles.disabledBtn,
          ]}
          onPress={callNextPatient}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>
            {queue.length === 0 ? "NO PATIENTS WAITING" : "CALL NEXT PATIENT"}
          </Text>
          {queue.length > 0 && (
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#F8FAFC",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  greeting: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
  },
  docName: { fontSize: 20, fontWeight: "800", color: "#0F172A" },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillOnline: { backgroundColor: "#ECFDF5", borderColor: "#D1FAE5" },
  pillOffline: { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "700", marginRight: 4 },

  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  // Scroll Content
  scroll: { paddingHorizontal: 24, paddingBottom: 140, paddingTop: 10 },

  // Hero Card
  heroCardShadow: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    borderRadius: 24,
    marginBottom: 32,
    backgroundColor: "#FFF",
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    paddingBottom: 80, // Extra space for overlapping actions
    position: "relative",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  cardLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    marginTop: 12,
  },
  hash: {
    fontSize: 32,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
    marginTop: 8,
  },
  tokenVal: { fontSize: 72, color: "#FFF", fontWeight: "900" },

  patientInfo: { marginTop: 4 },
  pName: { fontSize: 20, color: "#FFF", fontWeight: "700" },
  pDetail: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },

  // Quick Actions (Floats over card)
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  actionBtn: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 4 },
  actionText: { fontSize: 12, fontWeight: "600", color: "#334155" },
  vertDivider: { width: 1, height: 24, backgroundColor: "#F1F5F9" },

  // List Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countText: { fontSize: 11, fontWeight: "700", color: "#64748B" },

  listContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  lastItem: { borderBottomWidth: 0 },
  circleToken: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  circleText: { fontWeight: "700", color: "#0F172A" },
  listName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  listType: { fontSize: 12, color: "#64748B" },
  waitBadge: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  waitText: { fontSize: 10, fontWeight: "700", color: "#C2410C" },

  viewAllBtn: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#F8FAFC",
  },
  viewAllText: { fontSize: 13, fontWeight: "700", color: COLORS.primary },

  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySub: { color: "#94A3B8", fontSize: 13, marginTop: 4 },

  // Floating Button
  fabContainer: { position: "absolute", bottom: 32, left: 24, right: 24 },
  primaryBtn: {
    height: 56,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  disabledBtn: { backgroundColor: "#94A3B8", shadowOpacity: 0 },
});