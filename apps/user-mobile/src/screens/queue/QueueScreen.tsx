import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserQueueStore } from "../../store/userQueueStore";

const COLORS = {
  primary: "#10B981",
  bg: "#F8FAFC",
  text: "#0F172A",
  white: "#FFFFFF",
  inputBg: "#F1F5F9",
  border: "#E2E8F0",
};

export default function QueueScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { clinicId: paramClinicId } = route.params || {};

  const [name, setName] = useState("");
  const {
    joinQueue,
    leaveQueue,
    activeToken,
    peopleAhead,
    queueStatus,
    isLoading,
    refreshData,
    currentServingToken,
    setClinicId,
    clinicId: storeClinicId,
  } = useUserQueueStore();

  // Use param ID or fallback to store ID
  const activeClinicId = paramClinicId || storeClinicId;

  useEffect(() => {
    if (activeClinicId) {
      setClinicId(activeClinicId);
      refreshData(activeClinicId);
    }
  }, [activeClinicId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Queue Dashboard</Text>
        <TouchableOpacity
          onPress={() => activeClinicId && refreshData(activeClinicId)}
          style={styles.refreshBtn}
        >
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => activeClinicId && refreshData(activeClinicId)}
          />
        }
      >
        {/* DOCTOR INFO */}
        <View style={styles.doctorCard}>
          <View style={styles.docRow}>
            <View style={styles.docAvatar}>
              <Ionicons name="medkit" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.docName}>Live Clinic Queue</Text>
              <Text style={styles.docSub}>
                {activeClinicId ? "Connected" : "Loading..."}
              </Text>
            </View>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {currentServingToken
                ? `Serving #${currentServingToken}`
                : "Clinic Live"}
            </Text>
          </View>
        </View>

        {queueStatus === "JOINED" ? (
          <Animatable.View animation="fadeInUp">
            <View style={styles.ticketCard}>
              <Text style={styles.ticketLabel}>YOUR TOKEN</Text>
              <Text style={styles.bigToken}>#{activeToken}</Text>
              <Text style={styles.statVal}>{peopleAhead} People Ahead</Text>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={leaveQueue}>
              <Text style={styles.cancelText}>Cancel Ticket</Text>
            </TouchableOpacity>
          </Animatable.View>
        ) : (
          <Animatable.View animation="fadeInUp" style={styles.formCard}>
            <Text style={styles.formTitle}>Check In</Text>
            <TextInput
              style={styles.input}
              placeholder="Patient Name"
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => joinQueue(name, "0000000000", activeClinicId)}
              disabled={isLoading || !activeClinicId}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.joinText}>Get Ticket</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  backBtn: { padding: 8, backgroundColor: COLORS.white, borderRadius: 12 },
  refreshBtn: { padding: 8, backgroundColor: "#E2E8F0", borderRadius: 10 },
  doctorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
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
  docName: { fontSize: 18, fontWeight: "700" },
  docSub: { fontSize: 14, color: "#64748B" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    alignSelf: "flex-start",
    padding: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  ticketCard: {
    backgroundColor: "#047857",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  ticketLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
  },
  bigToken: {
    fontSize: 80,
    fontWeight: "800",
    color: "#FFF",
    marginVertical: 10,
  },
  statVal: { fontSize: 18, color: "#FFF", fontWeight: "700" },
  formCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24 },
  formTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  joinText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  cancelBtn: { padding: 12, alignSelf: "center" },
  cancelText: { color: "#EF4444", fontWeight: "600" },
});
