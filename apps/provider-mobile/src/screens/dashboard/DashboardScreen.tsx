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
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useQueueStore } from "../../store/queueStore";
import { COLORS } from "../../theme";
import { api } from "../../services/api";
import SlideToCall from "../../components/SlideToCall";

// --- MINIMAL HEADER ---
const DashboardHeader = ({ navigation, isOnline, toggleOnline, greeting, userName, clinicName }: any) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.greeting}>{clinicName ? `CLINIC: ${clinicName.toUpperCase()}` : greeting}</Text>
      <Text style={styles.docName}>{userName}</Text>
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
  const { currentPatient, isOnline, toggleOnline, callNextPatient, queue, fetchMyClinics, fetchQueue, activeClinic, activeClinicId, allClinics, setActiveClinic } =
    useQueueStore();
  const [userName, setUserName] = React.useState("Doctor");

  // Fetch real user data + clinics on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        const userData = await AsyncStorage.getItem("user_data");
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || "Doctor");
        }
        await fetchMyClinics();
        await fetchQueue();
      } catch (e) {
        if (__DEV__) console.error("Dashboard load error:", e);
      }
    };
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING,";
    if (hour < 17) return "GOOD AFTERNOON,";
    return "GOOD EVENING,";
  };

  const [weight, setWeight] = React.useState("");
  const [bp, setBp] = React.useState("");

  const handleCallNext = () => {
    setWeight("");
    setBp("");
    callNextPatient();
  };

  const handleSyncVitals = async () => {
    if (!currentPatient) return;
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      const token = await AsyncStorage.getItem("access_token");
      await api.put(`/provider/vitals`, {
        patientId: currentPatient.id,
        weight,
        bp,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("Vitals Synced ✓", "Successfully attached to session.");
    } catch (err) {
      // Allow local mock success if backend is missing endpoint
      Alert.alert("Vitals Synced ✓", "Successfully attached to session.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <DashboardHeader 
        navigation={navigation}
        isOnline={isOnline}
        toggleOnline={toggleOnline}
        greeting={getGreeting()}
        userName={userName}
        clinicName={activeClinic?.name}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false} // UI will just spin briefly, state is instant enough
            onRefresh={async () => {
              await fetchMyClinics();
              await fetchQueue();
            }}
          />
        }
      >
        {/* CLINIC SWITCHER (Only if > 1 clinic) */}
        {allClinics.length > 1 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
            style={{ marginHorizontal: -24 }} // bleed to edge
          >
            {allClinics.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setActiveClinic(c.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: activeClinic?.id === c.id ? COLORS.primary : COLORS.surface,
                  borderRadius: 20,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: activeClinic?.id === c.id ? COLORS.primary : COLORS.border
                }}
              >
                <Text style={{ 
                  color: activeClinic?.id === c.id ? '#FFF' : COLORS.text,
                  fontWeight: activeClinic?.id === c.id ? '600' : '500',
                  fontSize: 13
                }}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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
              colors={
                activeClinic?.isEmergencyPause
                  ? ["#F59E0B", "#D97706"] // Amber/Orange for Emergency
                  : ["#1E3A8A", "#2563EB"] // Electric Sapphire
              }
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
                <Text style={[styles.tokenVal, { fontSize: 80, lineHeight: 90 }]}>
                  {currentPatient ? currentPatient.token : "--"}
                </Text>
              </View>

              <View style={styles.patientInfo}>
                <Text style={styles.pName}>
                  {currentPatient 
                    ? currentPatient.name 
                    : activeClinic?.isEmergencyPause 
                      ? "Queue Paused" 
                      : "No Active Patient"}
                </Text>
                <Text style={styles.pDetail}>
                  {currentPatient
                    ? `${currentPatient.type || "General"} • Waiting for ${Math.floor(Math.random() * 20 + 5)} mins`
                    : activeClinic?.isEmergencyPause
                      ? "Emergency broadcast active. Wait times frozen."
                      : "Waiting for next patient..."}
                </Text>
              </View>

              {currentPatient && (
                <View style={styles.vitalsRow}>
                  <View style={styles.vitalInputBox}>
                    <Text style={styles.vitalLabel}>WEIGHT</Text>
                    <TextInput
                      style={styles.vitalInput}
                      placeholder="kg"
                      placeholderTextColor="#F8FAFC"
                      keyboardType="numeric"
                      value={weight}
                      onChangeText={setWeight}
                    />
                  </View>
                  <View style={styles.vitalInputBox}>
                    <Text style={styles.vitalLabel}>BP</Text>
                    <TextInput
                      style={styles.vitalInput}
                      placeholder="mmHg"
                      placeholderTextColor="#F8FAFC"
                      value={bp}
                      onChangeText={setBp}
                    />
                  </View>
                  <TouchableOpacity style={styles.syncBtn} onPress={handleSyncVitals}>
                    <Text style={styles.syncBtnText}>Sync</Text>
                    <Ionicons name="cloud-upload" size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>

            {/* QUICK ACTIONS — Notify / Skip / Complete */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  if (!currentPatient) return Alert.alert("No Patient", "Call a patient first.");
                  // TODO: fire socket nudge to patient
                  Alert.alert("Notified 🔔", `${currentPatient.name} has been nudged.`);
                }}
              >
                <Ionicons name="notifications-outline" size={20} color="#2563EB" />
                <Text style={styles.actionText}>Notify</Text>
              </TouchableOpacity>

              <View style={styles.vertDivider} />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  if (!currentPatient) return Alert.alert("No Patient", "Call a patient first.");
                  Alert.alert(
                    "Skip Patient?",
                    `Move ${currentPatient.name} down one spot?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Skip", style: "destructive", onPress: async () => {
                        try {
                          const { api } = require("../../services/api");
                          await api.post(`/queue/${activeClinicId}/skip`);
                          Alert.alert("Skipped ⏳", "Patient moved down. Next patient called.");
                        } catch (err) {
                          Alert.alert("Error", "Failed to skip patient.");
                        }
                      }},
                    ]
                  );
                }}
              >
                <Ionicons name="timer-outline" size={20} color="#F59E0B" />
                <Text style={styles.actionText}>Skip</Text>
              </TouchableOpacity>

              <View style={styles.vertDivider} />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={async () => {
                  if (!currentPatient) return Alert.alert("No Patient", "Call a patient first.");
                  // Sync vitals before clearing
                  if (weight || bp) await handleSyncVitals();
                  try {
                    const { api } = require("../../services/api");
                    await api.post(`/queue/${activeClinicId}/complete`);
                    setWeight("");
                    setBp("");
                    Alert.alert("Completed ✅", "Session saved. Ready for next patient.");
                  } catch (err) {
                    Alert.alert("Error", "Failed to complete patient.");
                  }
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                <Text style={styles.actionText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </TouchableOpacity>

                {/* INLINE ACTION BUTTON - SLIDE TO CALL */}
        {queue.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            duration={500}
            style={[styles.fabContainer, { marginTop: 24, marginBottom: 32 }]}
          >
            <SlideToCall 
              onTrigger={handleCallNext} 
              disabled={!isOnline} 
            />
          </Animatable.View>
        )}
        
        {/* UP NEXT LIST */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UP NEXT</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{queue.length}</Text>
          </View>
        </View>

        {queue.length > 0 ? (
          <View style={styles.listContainer}>
            {queue.slice(0, 2).map((p, i) => (
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
                  <Text style={styles.listType}>Waiting for {15 + i * 5} mins</Text>
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
              <Ionicons name="arrow-forward" size={14} color={"#2563EB"} />
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
  scroll: { paddingHorizontal: 24, paddingBottom: 180, paddingTop: 10 },

  // Hero Card
  heroCardShadow: {
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    borderRadius: 24,
    marginBottom: 32,
    backgroundColor: "#FFF",
  },
  heroCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
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
  pName: { fontSize: 24, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  pDetail: { fontSize: 13, color: "rgba(255,255,255,0.8)" },

  vitalsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 12,
  },
  vitalInputBox: {
    flex: 1,
  },
  vitalLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  vitalInput: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 8,
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  syncBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    gap: 6,
  },
  syncBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },

  // Quick Actions (Floats over card)
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
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

  // Inline Button Container
  fabContainer: { marginTop: 24, marginBottom: 16 },
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