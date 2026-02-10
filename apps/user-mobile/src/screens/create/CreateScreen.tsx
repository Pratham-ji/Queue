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
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../services/api";

const COLORS = {
  primary: "#047857", // Emerald
  bg: "#F8FAFC",
  text: "#1E293B",
  subText: "#64748B",
  white: "#FFFFFF",
  border: "#E2E8F0",
};

export default function CreateScreen() {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<"SELECT" | "HOST" | "JOIN">("SELECT");
  const [loading, setLoading] = useState(false);

  // Inputs
  const [hostTitle, setHostTitle] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [guestName, setGuestName] = useState("");

  // 1. HOST LOGIC
  const handleHost = async () => {
    if (!hostTitle.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/custom/create", {
        hostName: "You", // In future, fetch from Profile
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
      alert("Failed to start queue.");
    } finally {
      setLoading(false);
    }
  };

  // 2. JOIN LOGIC
  const handleJoin = async () => {
    if (!joinCode.trim() || !guestName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/custom/join", { joinCode, name: guestName });
      if (res.data.success) {
        navigation.navigate("CustomSession", {
          session: res.data.session,
          participant: res.data.data,
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

  // --- UI SECTIONS ---
  const renderSelect = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heroTitle}>Instant Queue</Text>
      <Text style={styles.heroSub}>
        Eliminate waiting times for anything.{"\n"}Events • Salons • Banks •
        Office Hours
      </Text>

      {/* HOST CARD */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => setMode("HOST")}>
        <LinearGradient colors={["#047857", "#065F46"]} style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="add" size={32} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Start a Queue</Text>
            <Text style={styles.cardDesc}>For Business Owners & Hosts</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#A7F3D0" />
        </LinearGradient>
      </TouchableOpacity>

      {/* JOIN CARD */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setMode("JOIN")}
        style={styles.joinCard}
      >
        <View style={[styles.cardIcon, { backgroundColor: "#EFF6FF" }]}>
          <Ionicons name="scan" size={28} color="#3B82F6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: COLORS.text }]}>
            Join with Code
          </Text>
          <Text style={styles.cardDesc}>For Customers & Students</Text>
        </View>
        <Ionicons name="arrow-forward" size={24} color="#CBD5E1" />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderForm = (isHost: boolean) => (
    <Animatable.View animation="fadeInUp" style={styles.formContainer}>
      <TouchableOpacity
        onPress={() => setMode("SELECT")}
        style={styles.backRow}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.formHeader}>
        {isHost ? "Create New Queue" : "Join a Queue"}
      </Text>

      {isHost ? (
        <>
          <Text style={styles.label}>Queue Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. PBL Review, Table Service..."
            value={hostTitle}
            onChangeText={setHostTitle}
            autoFocus
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>6-Digit Code</Text>
          <TextInput
            style={[
              styles.input,
              { textAlign: "center", letterSpacing: 4, fontSize: 24 },
            ]}
            placeholder="000000"
            maxLength={6}
            keyboardType="number-pad"
            value={joinCode}
            onChangeText={setJoinCode}
          />
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. John Doe"
            value={guestName}
            onChangeText={setGuestName}
          />
        </>
      )}

      <TouchableOpacity
        style={styles.mainBtn}
        onPress={isHost ? handleHost : handleJoin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.btnText}>
            {isHost ? "Launch Queue 🚀" : "Get in Line"}
          </Text>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {mode === "SELECT" ? renderSelect() : renderForm(mode === "HOST")}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 40 },

  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 16,
    color: COLORS.subText,
    lineHeight: 24,
    marginBottom: 40,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  joinCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  cardDesc: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },

  formContainer: { flex: 1, padding: 24 },
  backRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  backText: { fontSize: 16, fontWeight: "600", marginLeft: 8 },
  formHeader: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.subText,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    marginBottom: 24,
  },
  mainBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  btnText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
});
