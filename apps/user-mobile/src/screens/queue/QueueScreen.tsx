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

export default function QueueScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const {
    joinQueue,
    leaveQueue,
    activeToken,
    peopleAhead,
    queueStatus,
    isLoading,
    refreshData,
    estimatedWait,
    currentServingToken,
  } = useUserQueueStore();

  // 🔄 AUTO-SYNC: Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

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
        {/* DOCTOR CARD */}
        <View style={styles.doctorCard}>
          <View style={styles.docRow}>
            <View style={styles.docAvatar}>
              <Ionicons name="medkit" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.docName}>Dr. Trafalgar Law</Text>
              <Text style={styles.docSub}>Heart & Surgery Clinic</Text>
            </View>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {currentServingToken
                ? `Serving Token #${currentServingToken}`
                : "Clinic is Live"}
            </Text>
          </View>
        </View>

        {queueStatus === "JOINED" ? (
          // 🎫 ACTIVE TICKET DASHBOARD
          <Animatable.View animation="fadeInUp" duration={500}>
            <View style={styles.ticketCard}>
              <View style={styles.ticketTop}>
                <Text style={styles.ticketLabel}>YOUR TOKEN</Text>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              <Text style={styles.bigToken}>#{activeToken}</Text>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{peopleAhead}</Text>
                  <Text style={styles.statLabel}>People Ahead</Text>
                </View>
                <View style={styles.vertLine} />
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>~{estimatedWait}m</Text>
                  <Text style={styles.statLabel}>Est. Wait</Text>
                </View>
              </View>
            </View>

            {/* ALERT BOX */}
            {peopleAhead === 0 ? (
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                style={styles.alertBox}
              >
                <Ionicons name="notifications" size={22} color="#FFF" />
                <Text style={styles.alertText}>
                  It's your turn! Please go inside.
                </Text>
              </Animatable.View>
            ) : (
              <Text style={styles.helperText}>
                We will notify you when your turn is near.
              </Text>
            )}

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
            <Text style={styles.formSub}>Join the queue from your phone.</Text>

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

  // TICKET CARD
  ticketCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  ticketTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  liveBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  bigToken: {
    fontSize: 80,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    marginVertical: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { alignItems: "center", flex: 1 },
  vertLine: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  statVal: { fontSize: 24, fontWeight: "700", color: "#FFF" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 },

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
