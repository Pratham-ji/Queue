import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useUserQueueStore } from "../../store/userQueueStore";

const { width } = Dimensions.get("window");

// 🎨 UNICORN THEME COLORS
const COLORS = {
  primary: "#10B981",
  dark: "#047857",
  bg: "#F8FAFC",
  text: "#0F172A",
  subText: "#64748B",
  white: "#FFFFFF",
  inputBg: "#F1F5F9",
  border: "#E2E8F0",
  error: "#EF4444",
};

export default function QueueScreen({ route }: any) {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const {
    joinQueue,
    leaveQueue,
    activeToken,
    activeClinicId,
    setClinic,
    peopleAhead,
    queueStatus,
    isLoading,
    refreshData,
    loadSession,
    estimatedWait,
    currentServingToken,
    isOffline, // NetInfo Network Offline
    isClinicOffline,
    isEmergencyPause,
    activePrescription,
  } = useUserQueueStore();

  // Accept clinicId from navigation params (from HospitalDetails)
  const routeClinicId = route?.params?.clinicId;
  const clinicName = route?.params?.clinicName || "Clinic";

  // 🔄 Set clinic from navigation params + restore session
  useFocusEffect(
    useCallback(() => {
      if (routeClinicId) {
        setClinic(routeClinicId);
      }
      loadSession();
      refreshData();
    }, [routeClinicId]),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {isOffline && (
        <View style={styles.offlineBanner}>
          <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.offlineText}>Offline - Reconnecting...</Text>
        </View>
      )}

      {/* 🟢 HEADER WITH SMART BACK BUTTON */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {/* Only show Back Button if we pushed this screen (not via Tab) */}
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Queue Dashboard</Text>
        </View>

        {queueStatus === "JOINED" && (
          <TouchableOpacity onPress={refreshData} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* CLINIC / DOCTOR CARD */}
        <View style={styles.doctorCard}>
          <View style={styles.docRow}>
            <View style={styles.docAvatar}>
              <Ionicons name="business" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.docName}>{clinicName || "Queue Dashboard"}</Text>
              <Text style={styles.docSub}>{activeClinicId ? "Live Queue Tracker" : "Select a clinic to join"}</Text>
            </View>
          </View>
          <View style={[
            styles.statusPill, 
            isClinicOffline ? { backgroundColor: "#FEE2E2" } : 
            isEmergencyPause ? { backgroundColor: "#FEF3C7" } : {}
          ]}>
            <View style={[
              styles.statusDot, 
              isClinicOffline ? { backgroundColor: "#EF4444" } : 
              isEmergencyPause ? { backgroundColor: "#F59E0B" } : {}
            ]} />
            <Text style={[
              styles.statusText,
              isClinicOffline ? { color: "#991B1B" } : 
              isEmergencyPause ? { color: "#92400E" } : {}
            ]}>
              {!activeClinicId ? "No Clinic Selected" :
               isClinicOffline ? "Doctor is Offline" :
               isEmergencyPause ? "Queue Paused (Emergency)" :
               currentServingToken ? `Serving Token #${currentServingToken}` : "Clinic is Live"}
            </Text>
          </View>
        </View>

        {isEmergencyPause && queueStatus === "JOINED" && (
          <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.emergencyBanner}>
            <Ionicons name="warning" size={20} color="#92400E" />
            <Text style={styles.emergencyText}>Doctor stepped out for an emergency. Your spot is secured.</Text>
          </Animatable.View>
        )}

        {activePrescription ? (
          // 💊 PRESCRIPTION READY (PHARMACY HANDOFF)
          <Animatable.View animation="bounceIn" duration={800} style={styles.trackerContainer}>
            <View style={[styles.ticketHeader, { backgroundColor: "#F0FDF4", borderRadius: 20, padding: 20, marginBottom: 20 }]}>
              <Ionicons name="medical" size={40} color={COLORS.primary} style={{ marginBottom: 10 }} />
              <Text style={[styles.ticketLabel, { color: COLORS.primary }]}>PRESCRIPTION READY</Text>
              <Text style={{ fontSize: 16, textAlign: "center", color: COLORS.text, marginVertical: 10 }}>
                Please proceed to the pharmacy and show this secure code to collect your medicines.
              </Text>
              <View style={{ backgroundColor: "#FFF", paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, borderWidth: 2, borderColor: COLORS.primary, borderStyle: "dashed", marginTop: 10 }}>
                <Text style={{ fontSize: 42, fontWeight: "900", letterSpacing: 8, color: COLORS.primary, textAlign: "center" }}>
                  {activePrescription.otpCode}
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: COLORS.inputBg, borderRadius: 16, padding: 20 }}>
              <Text style={{ fontWeight: "700", marginBottom: 10, color: COLORS.text }}>Prescribed Medicines:</Text>
              {activePrescription.medicines?.map((m: any, idx: number) => (
                <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                  <Text style={{ fontWeight: "600", color: COLORS.text }}>{m.name}</Text>
                  <Text style={{ color: COLORS.subText }}>{m.dosage} • {m.duration}</Text>
                </View>
              ))}
            </View>
          </Animatable.View>
        ) : queueStatus === "JOINED" ? (
          // 🎫 ZOMATO-STYLE ORDER TRACKER
          <Animatable.View animation="fadeInUp" duration={500} style={styles.trackerContainer}>
            
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketLabel}>YOUR POSITION</Text>
              <Animatable.Text 
                animation="pulse" 
                iterationCount="infinite" 
                direction="alternate" 
                style={styles.bigToken}
              >
                #{peopleAhead + 1}
              </Animatable.Text>
              <View style={styles.statsBadgeRow}>
                <View style={styles.glassBadge}>
                  <Text style={styles.badgeText}>Now Serving: #{currentServingToken}</Text>
                </View>
                <View style={[styles.glassBadge, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]}>
                  <Ionicons name="time" size={14} color={COLORS.primary} />
                  <Text style={[styles.badgeText, { color: COLORS.primary }]}>~{estimatedWait}m Wait</Text>
                </View>
              </View>
            </View>

            <View style={styles.trackerTimeline}>
              {/* STEP 1: In Queue */}
              <View style={styles.timelineStep}>
                <View style={[styles.stepCircle, { backgroundColor: COLORS.primary }]}>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Joined Queue</Text>
                  <Text style={styles.stepDesc}>You are currently waiting.</Text>
                </View>
              </View>
              <View style={[styles.timelineLine, { backgroundColor: peopleAhead <= 1 ? COLORS.primary : COLORS.border }]} />

              {/* STEP 2: Waiting Area */}
              <View style={styles.timelineStep}>
                <View style={[styles.stepCircle, { backgroundColor: peopleAhead <= 1 ? COLORS.primary : COLORS.border }]}>
                  {peopleAhead <= 1 && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: peopleAhead <= 1 ? COLORS.text : COLORS.subText }]}>In Waiting Area</Text>
                  <Text style={styles.stepDesc}>{peopleAhead <= 1 ? "Get ready, you're next!" : "Waiting for your turn..."}</Text>
                </View>
              </View>
              <View style={[styles.timelineLine, { backgroundColor: peopleAhead === 0 ? COLORS.primary : COLORS.border }]} />

              {/* STEP 3: Doctor's Desk */}
              <View style={styles.timelineStep}>
                <View 
                  style={[
                    styles.stepCircle, 
                    { backgroundColor: peopleAhead === 0 ? COLORS.primary : COLORS.border }
                  ]}
                >
                  {peopleAhead === 0 && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: peopleAhead === 0 ? COLORS.text : COLORS.subText }]}>Doctor's Desk</Text>
                  <Text style={styles.stepDesc}>{peopleAhead === 0 ? "Please head into the doctor's room." : ""}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.cancelBtn} onPress={leaveQueue}>
              <Text style={styles.cancelText}>Cancel Ticket</Text>
            </TouchableOpacity>
          </Animatable.View>
        ) : (
          // 📝 JOIN FORM
          <Animatable.View
            animation="fadeInUp"
            duration={500}
            style={styles.formCard}
          >
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
              onPress={() => joinQueue(name, "0000000000")}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.joinText}>Take My Spot</Text>
              )}
            </TouchableOpacity>
          </Animatable.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 20 },
  
  offlineBanner: {
    backgroundColor: COLORS.error,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  offlineText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  backBtn: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  refreshBtn: { padding: 8, backgroundColor: "#E2E8F0", borderRadius: 10 },

  // DOCTOR CARD
  doctorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  docAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  docName: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  docSub: { fontSize: 14, color: COLORS.subText },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  statusText: { fontSize: 12, fontWeight: "600", color: COLORS.dark },

  // TRACKER UI (Zomato-Style)
  emergencyBanner: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  emergencyText: {
    color: "#92400E",
    fontWeight: "600",
    fontSize: 13,
    flex: 1,
  },
  trackerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ticketHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  ticketLabel: {
    color: COLORS.subText,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bigToken: {
    fontSize: 64,
    fontWeight: "800",
    color: COLORS.text,
    marginVertical: 8,
  },
  statsBadgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  glassBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  
  trackerTimeline: {
    paddingLeft: 10,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    zIndex: 2,
  },
  stepContent: {
    marginLeft: 16,
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: COLORS.subText,
    lineHeight: 20,
  },
  timelineLine: {
    width: 2,
    height: 40,
    marginLeft: 13,
    marginTop: -8,
    marginBottom: -8,
    zIndex: 1,
  },

  // FORM CARD
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  formSub: { fontSize: 14, color: COLORS.subText, marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledBtn: { backgroundColor: "#CBD5E1", shadowOpacity: 0 },
  joinText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  // ALERTS
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    justifyContent: "center",
    gap: 10,
  },
  alertText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  helperText: {
    textAlign: "center",
    color: COLORS.subText,
    fontSize: 13,
    marginTop: 24,
  },
  cancelBtn: { marginTop: 20, padding: 12, alignSelf: "center" },
  cancelText: { color: COLORS.error, fontWeight: "600" },
});
