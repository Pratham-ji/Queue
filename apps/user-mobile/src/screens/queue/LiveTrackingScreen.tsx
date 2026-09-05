import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { useUserQueueStore } from "../../store/userQueueStore";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  primary: "#059669",
  white: "#FFFFFF",
  bg: "#F8FAFC",
  textMain: "#0F172A",
  subText: "#64748B",
  border: "#E2E8F0",
};


export default function LiveTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const {
    queueStatus,
    activeToken,
    activeClinicId,
    joinQueue,
    setClinic,
    leaveQueue,
    peopleAhead,
    estimatedWait,
    currentServingToken,
    isLoading,
    isEmergencyPause,
    emergencyMessage,
  } = useUserQueueStore();

  const [name, setName] = useState("");
  const [localIsLoading, setLocalIsLoading] = useState(false);

  const isMyTurn = activeToken && currentServingToken && Number(activeToken) === Number(currentServingToken);
  
  React.useEffect(() => {
    if (isMyTurn) {
      const { Vibration } = require('react-native');
      Vibration.vibrate([0, 500, 200, 500]);
    }
  }, [isMyTurn]);

  const clinicName = route?.params?.clinicName || "General Department";
  const routeClinicId = route?.params?.clinicId;

  useEffect(() => {
    if (routeClinicId && routeClinicId !== activeClinicId) {
      setClinic(routeClinicId);
    }
  }, [routeClinicId]);

  
  const handleTakeMySpot = async () => {
    if (!name.trim()) return Alert.alert("Required", "Please enter your name");
    
    setLocalIsLoading(true);
    try {
      // Direct API call as requested
      const payload = { clinicId: routeClinicId || activeClinicId, patientName: name };
      console.log('JOIN QUEUE PAYLOAD:', payload);
      
      // We hit the public add endpoint because /join requires auth
      const res = await api.post(`/queue/${payload.clinicId}/add`, { 
        name: payload.patientName, 
        phone: "0000000000" 
      });

      if (res.data.success) {
        const token = res.data.data.token;
        // Hydrate store so the UI flips instantly
        useUserQueueStore.setState({ 
          activeToken: token, 
          queueStatus: "JOINED",
          activeClinicId: payload.clinicId 
        });
        await AsyncStorage.setItem("user_token", token.toString());
        await AsyncStorage.setItem("user_clinic_id", payload.clinicId);
        
        // Initialize socket for live tracking
        useUserQueueStore.getState().initializeSocket();
        useUserQueueStore.getState().refreshData();
      }
    } catch (error: any) {
      console.error("Direct Join Failed:", error);
      Alert.alert("Error Joining", error?.response?.data?.error || error?.response?.data?.message || error.message);
    } finally {
      setLocalIsLoading(false);
    }
  };

  if (queueStatus === "IDLE") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>
        <View style={styles.formContainer}>
          <Animatable.View animation="fadeInUp" duration={500} style={styles.formCard}>
            <Text style={styles.formTitle}>Check In</Text>
            <Text style={styles.formSub}>Join the {clinicName} queue instantly.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: John Doe"
                placeholderTextColor={COLORS.subText}
                value={name}
                onChangeText={setName}
              />
            </View>

            <TouchableOpacity
              style={[styles.joinBtn, !name.trim() && styles.disabledBtn]}
              onPress={handleTakeMySpot}
              disabled={!name.trim() || localIsLoading}
            >
              {localIsLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.joinText}>Take My Spot</Text>}
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </SafeAreaView>
    );
  }

  if (queueStatus === "COMPLETED") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Animatable.View animation="bounceIn" style={{ alignItems: "center", backgroundColor: "#ECFDF5", padding: 32, borderRadius: 24 }}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            <Text style={{ fontSize: 24, fontWeight: "800", color: "#065F46", marginTop: 16, textAlign: "center" }}>Consultation Complete</Text>
            <Text style={{ fontSize: 16, color: "#047857", marginTop: 8, textAlign: "center", lineHeight: 24 }}>
              Your session has ended. Thank you for visiting {clinicName}!
            </Text>
            <TouchableOpacity 
              style={{ marginTop: 32, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, backgroundColor: "#059669" }}
              onPress={() => {
                useUserQueueStore.setState({ queueStatus: "IDLE", activeToken: null });
                navigation.navigate("Home");
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>Return to Home</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </SafeAreaView>
    );
  }

  // Live Tracker State

  if (isMyTurn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Animatable.View animation="zoomIn" duration={500} style={styles.heroStateContainer}>
            <View style={styles.heroIconCircle}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="checkmark" size={48} color="#10B981" />
              </View>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.8)', marginTop: 24 }}>
              IT'S YOUR TURN
            </Text>
            <Text style={{ fontSize: 56, fontWeight: '900', color: '#FFFFFF', marginTop: 8 }}>
              Token #{activeToken}
            </Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 16 }}>
              Please proceed to the doctor's cabin immediately.
            </Text>
          </Animatable.View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 32, width: '100%', gap: 12 }}>
          <TouchableOpacity style={[styles.ghostBtn, { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0", borderWidth: 1 }]}>
            <Ionicons name="call-outline" size={20} color={COLORS.textMain} />
            <Text style={[styles.ghostBtnText, { color: COLORS.textMain }]}>Contact Reception</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 8, alignItems: "center", paddingVertical: 12 }} onPress={() => {
            Alert.alert("Cancel Visit?", "Are you sure you want to cancel your visit?", [
              { text: "No", style: "cancel" },
              { text: "Yes, Cancel", style: "destructive", onPress: async () => {
                await leaveQueue();
                navigation.navigate("Home");
              }}
            ]);
          }}>
            <Text style={{ color: "#94A3B8", fontSize: 14, fontWeight: "600" }}>Cancel Visit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {/* HERO TRACKER */}
        <Animatable.View animation="fadeInDown" duration={600} style={styles.heroCard}>
          <Text style={styles.hospitalName}>{clinicName}</Text>
          
          {isEmergencyPause ? (
            <View style={[styles.waitPill, emergencyMessage === "EMERGENCY" ? { backgroundColor: "#FEF2F2" } : { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="warning" size={14} color={emergencyMessage === "EMERGENCY" ? "#EF4444" : "#F59E0B"} style={{ marginRight: 6 }} />
              <Text style={[styles.waitText, emergencyMessage === "EMERGENCY" ? { color: "#B91C1C" } : { color: "#92400E" }]}>
                {emergencyMessage === "EMERGENCY" ? "Paused (Emergency)" : "Paused (Doctor on Break)"}
              </Text>
            </View>
          ) : (
            <View style={styles.waitPill}>
              <Ionicons name="time" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.waitText}>Est. Wait: {estimatedWait} mins</Text>
            </View>
          )}

          <Text style={styles.tokenLabel}>YOUR TOKEN</Text>
          <Text style={styles.tokenNumber}>#{activeToken}</Text>

          <View style={styles.metricRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>#{currentServingToken || "--"}</Text>
              <Text style={styles.metricLabel}>Current Token</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{peopleAhead}</Text>
              <Text style={styles.metricLabel}>People Ahead</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={[styles.metricValue, { color: isEmergencyPause ? (emergencyMessage === "EMERGENCY" ? "#EF4444" : "#F59E0B") : COLORS.primary, fontSize: 14 }]}>
                {isEmergencyPause ? "PAUSED" : (peopleAhead === 0 ? "NEXT" : "ON TIME")}
              </Text>
              <Text style={styles.metricLabel}>Status</Text>
            </View>
          </View>
        </Animatable.View>

        {/* QUEUE PROGRESS */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.stepperContainer}>
          <Text style={styles.sectionTitle}>Queue Progress</Text>
          
          <View style={styles.stepperItem}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepDotActive}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </View>
              <View style={styles.stepLineActive} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitleActive}>Checked In</Text>
              <Text style={styles.stepSub}>Your spot is confirmed</Text>
            </View>
          </View>

          <View style={styles.stepperItem}>
            <View style={styles.stepIndicator}>
              <Animatable.View animation="pulse" iterationCount="infinite" style={styles.stepDotPulse}>
                <View style={styles.stepDotInner} />
              </Animatable.View>
              <View style={styles.stepLineInactive} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitleActive}>Waiting for Turn</Text>
              <Text style={styles.stepSub}>
                {isEmergencyPause ? emergencyMessage === "EMERGENCY" ? "Doctor stepped out for an emergency." : "Doctor is on a short break." : 
                 currentServingToken ? `Doctor is seeing Token #${currentServingToken}` : "Doctor is preparing..."}
              </Text>
            </View>
          </View>

          <View style={styles.stepperItem}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepDotInactive} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitleInactive}>Consultation</Text>
              <Text style={styles.stepSubInactive}>Head to the doctor's cabin when called</Text>
            </View>
          </View>
        </Animatable.View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.ghostBtn, { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0", borderWidth: 1 }]}>
            <Ionicons name="call-outline" size={20} color={COLORS.textMain} />
            <Text style={[styles.ghostBtnText, { color: COLORS.textMain }]}>Contact Reception</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.ghostBtn, { backgroundColor: "#FEF2F2", borderColor: "#FECACA", borderWidth: 1 }]} onPress={() => {
            Alert.alert("Leave Queue?", "Are you sure you want to abandon your spot?", [
              { text: "Cancel", style: "cancel" },
              { text: "Leave", style: "destructive", onPress: async () => {
                await leaveQueue();
                navigation.navigate("Home");
              }}
            ]);
          }}>
            <Ionicons name="exit-outline" size={20} color="#EF4444" />
            <Text style={[styles.ghostBtnText, { color: "#EF4444" }]}>Leave Queue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  heroStateContainer: {
    backgroundColor: "#10B981",
    borderRadius: 32,
    paddingVertical: 48,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  heroIconCircle: {
    marginBottom: 16,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    color: "#ECFDF5",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
  },

  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { padding: 20 },
  backBtn: { width: 40, height: 40, backgroundColor: "#FFF", borderRadius: 12, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  
  // JOIN FORM
  formContainer: { flex: 1, justifyContent: "center", padding: 24 },
  formCard: { backgroundColor: "#FFF", padding: 24, borderRadius: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  formTitle: { fontSize: 24, fontWeight: "800", color: COLORS.textMain, marginBottom: 8 },
  formSub: { fontSize: 14, color: COLORS.subText, marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textMain, marginBottom: 8 },
  input: { backgroundColor: "#F1F5F9", padding: 16, borderRadius: 12, fontSize: 16, color: COLORS.textMain },
  joinBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 16, alignItems: "center" },
  disabledBtn: { backgroundColor: "#94A3B8" },
  joinText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  // HERO TRACKER
  heroCard: { backgroundColor: "#FFF", padding: 24, borderRadius: 24, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, marginBottom: 24 },
  hospitalName: { fontSize: 15, fontWeight: "600", color: COLORS.subText, marginBottom: 16 },
  waitPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#ECFDF5", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 24 },
  waitText: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },
  tokenLabel: { fontSize: 12, fontWeight: "700", color: COLORS.subText, letterSpacing: 1, marginBottom: 4 },
  tokenNumber: { fontSize: 64, fontWeight: "900", color: COLORS.textMain, letterSpacing: -2, marginBottom: 24 },
  
  metricRow: { flexDirection: "row", alignItems: "center", width: "100%", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 20 },
  metricBox: { flex: 1, alignItems: "center" },
  metricDivider: { width: 1, height: 30, backgroundColor: "#E2E8F0" },
  metricValue: { fontSize: 20, fontWeight: "800", color: COLORS.textMain, marginBottom: 4 },
  metricLabel: { fontSize: 11, color: COLORS.subText, fontWeight: "600", textTransform: "uppercase" },

  // STEPPER
  stepperContainer: { backgroundColor: "#FFF", padding: 24, borderRadius: 24, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textMain, marginBottom: 20 },
  stepperItem: { flexDirection: "row", marginBottom: 0 },
  stepIndicator: { alignItems: "center", width: 30, marginRight: 16 },
  stepDotActive: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", zIndex: 2 },
  stepLineActive: { width: 2, height: 40, backgroundColor: COLORS.primary, marginVertical: 4 },
  
  stepDotPulse: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(5, 150, 105, 0.2)", justifyContent: "center", alignItems: "center", zIndex: 2 },
  stepDotInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  stepLineInactive: { width: 2, height: 40, backgroundColor: "#E2E8F0", marginVertical: 4 },
  
  stepDotInactive: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#E2E8F0", zIndex: 2, marginTop: 4 },
  
  stepContent: { flex: 1, paddingBottom: 30 },
  stepTitleActive: { fontSize: 16, fontWeight: "700", color: COLORS.textMain, marginBottom: 4 },
  stepTitleInactive: { fontSize: 16, fontWeight: "600", color: "#94A3B8", marginBottom: 4 },
  stepSub: { fontSize: 14, color: COLORS.subText },
  stepSubInactive: { fontSize: 14, color: "#CBD5E1" },

  // ACTIONS
  actionsContainer: { gap: 12 },
  ghostBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  ghostBtnText: { fontSize: 15, fontWeight: "600", color: COLORS.textMain },
});
