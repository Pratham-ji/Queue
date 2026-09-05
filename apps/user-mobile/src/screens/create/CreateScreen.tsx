import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../services/api";

const COLORS = {
  primary: "#059669",
  bg: "#F8FAFC",
  text: "#0F172A",
  subText: "#64748B",
  white: "#FFFFFF",
  border: "#E2E8F0",
};

export default function CreateScreen() {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<"SELECT" | "HOST" | "JOIN">("SELECT");
  const [loading, setLoading] = useState(false);

  const [hostTitle, setHostTitle] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [guestName, setGuestName] = useState("");

  const handleHost = async () => {
    if (!hostTitle.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/custom/create", {
        hostName: "You",
        title: hostTitle,
      });
      if (res.data.success) {
        navigation.navigate("CustomSession", {
          session: res.data.data,
          role: "HOST",
        });
        setMode("SELECT");
        setHostTitle("");
      }
    } catch (e) {
      alert("Failed to create queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !guestName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/custom/join", {
        joinCode,
        name: guestName,
      });
      if (res.data.success) {
        navigation.navigate("CustomSession", {
          session: res.data.data.session,
          role: "GUEST",
        });
        setMode("SELECT");
        setJoinCode("");
      }
    } catch (e) {
      alert("Invalid Code or Queue Ended.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {mode === "SELECT" && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Queue Hub</Text>
            <Text style={styles.headerSub}>
              Professional waitlist management
            </Text>
          </View>

          <Animatable.View animation="fadeIn" style={styles.illustrationBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.heroText}>
              Smart queues, zero hardware
            </Text>
            <Text style={styles.heroSubText}>
              For independent businesses, events, and pop-ups. Create a
              professional waitlist in seconds and manage turns effortlessly.
            </Text>

            {/* Feature pills */}
            <View style={styles.featureRow}>
              <View style={styles.featurePill}>
                <Ionicons
                  name="flash-outline"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.featurePillText}>Instant Setup</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons
                  name="link-outline"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.featurePillText}>Share Code</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons
                  name="notifications-outline"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.featurePillText}>Live Updates</Text>
              </View>
            </View>
          </Animatable.View>

          <View style={styles.actionSection}>
            {/* Primary CTA — Create */}
            <TouchableOpacity
              style={styles.createBtn}
              activeOpacity={0.8}
              onPress={() => setMode("HOST")}
            >
              <View style={styles.btnContent}>
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={COLORS.white}
                />
                <Text style={styles.createBtnText}>Create a Queue</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>

            {/* Secondary CTA — Join (Ghost) */}
            <TouchableOpacity
              style={styles.joinBtn}
              activeOpacity={0.8}
              onPress={() => setMode("JOIN")}
            >
              <View style={styles.btnContent}>
                <Ionicons
                  name="log-in-outline"
                  size={24}
                  color={COLORS.text}
                />
                <Text style={styles.joinBtnText}>
                  Join a Queue
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.subText}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* HOST MODE */}
      {mode === "HOST" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setMode("SELECT")}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.formTitle}>Host a Queue</Text>
            <Text style={styles.formSub}>
              Give your queue a catchy name so guests know what they're waiting
              for.
            </Text>

            <View style={styles.inputWrap}>
              <Ionicons
                name="text"
                size={20}
                color={COLORS.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. Comic Con Meet & Greet"
                value={hostTitle}
                onChangeText={setHostTitle}
                placeholderTextColor={COLORS.subText}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleHost}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Start Hosting</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* JOIN MODE */}
      {mode === "JOIN" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setMode("SELECT")}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.formTitle}>Join a Queue</Text>
            <Text style={styles.formSub}>
              Enter the 6-digit code provided by your host.
            </Text>

            <View style={styles.inputWrap}>
              <Ionicons
                name="keypad"
                size={20}
                color={COLORS.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="6-Digit Code"
                value={joinCode}
                onChangeText={setJoinCode}
                placeholderTextColor={COLORS.subText}
                maxLength={6}
                autoCapitalize="characters"
                autoFocus
              />
            </View>

            <View style={[styles.inputWrap, { marginTop: 16 }]}>
              <Ionicons
                name="person"
                size={20}
                color={COLORS.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={guestName}
                onChangeText={setGuestName}
                placeholderTextColor={COLORS.subText}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: COLORS.text }]}
              onPress={handleJoin}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Join Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 24, paddingBottom: 120 },

  // ── Header ──────────────────────────────────────
  headerRow: { marginBottom: 32 },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 15,
    color: COLORS.subText,
    marginTop: 4,
    fontWeight: "500",
  },

  // ── Hero Card ───────────────────────────────────
  illustrationBox: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubText: {
    fontSize: 15,
    color: COLORS.subText,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },

  // ── Feature pills ──────────────────────────────
  featureRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // ── Action Buttons ─────────────────────────────
  actionSection: { gap: 16 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  createBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  joinBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // ── Form (Host / Join) ─────────────────────────
  formContainer: {
    padding: 24,
    flex: 1,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  formSub: {
    fontSize: 15,
    color: COLORS.subText,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
