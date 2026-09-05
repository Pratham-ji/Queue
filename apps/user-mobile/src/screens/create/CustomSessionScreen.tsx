import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Share,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { io } from "socket.io-client";
import { api } from "../../services/api";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://13.201.230.245:5001";

export default function CustomSessionScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { session, role } = route.params;

  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.emit("join_session_room", session.id);

    // Listen for individual joins
    socket.on("participant_joined", (p) => {
      setQueue((prev) => [...prev, p]);
    });

    // Listen for full list broadcasts (the reliable event)
    socket.on("custom_queue_updated", (fullQueue) => {
      setQueue(fullQueue);
    });

    // Legacy single-update listener (backwards compat)
    socket.on("queue_updated", (updatedPerson) => {
      setQueue((prevQueue) =>
        prevQueue.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)),
      );
    });

    // Initial sync
    fetchDetails();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/custom/${session.id}`);
      if (res.data.success) setQueue(res.data.data.participants);
    } catch (e) {}
  };

  // Derived state — case-insensitive to prevent stale match bugs
  const waitingCount = queue.filter(
    (p) => p.status?.toUpperCase() === "WAITING"
  ).length;
  const isQueueEmpty = waitingCount === 0;

  const handleCallNext = useCallback(async () => {
    // Snapshot the queue BEFORE any mutation to allow revert
    const snapshot = [...queue];

    // Optimistic update using functional setter for guaranteed fresh data
    let foundNext = false;
    setQueue((prev) => {
      const nextIdx = prev.findIndex(
        (p) => p.status?.toUpperCase() === "WAITING"
      );

      if (nextIdx === -1) {
        // No one waiting — will alert after setState
        return prev;
      }

      foundNext = true;

      return prev.map((p, i) => {
        // Complete whoever is currently serving
        if (p.status?.toUpperCase() === "SERVING") {
          return { ...p, status: "COMPLETED" };
        }
        // Promote the next waiting person
        if (i === nextIdx) {
          return { ...p, status: "SERVING" };
        }
        return p;
      });
    });

    // If nobody was waiting, alert and bail
    if (!foundNext) {
      // Re-check from snapshot since functional setter ran sync
      const hasWaiting = snapshot.some(
        (p) => p.status?.toUpperCase() === "WAITING"
      );
      if (!hasWaiting) {
        Alert.alert(
          "All Caught Up",
          "There is no one left in the waiting list!"
        );
        return;
      }
    }

    // Fire API in background — revert on failure
    try {
      const res = await api.post("/custom/next", { sessionId: session.id });
      if (!res.data.success) {
        Alert.alert("Info", res.data.error);
        setQueue(snapshot); // revert
      }
    } catch (e: any) {
      console.error("Call next failed", e);
      Alert.alert(
        "Error",
        e?.response?.data?.error || e.message || "Failed to advance queue"
      );
      setQueue(snapshot); // revert
    }
  }, [queue, session.id]);

  const shareCode = () => {
    Share.share({ message: `Join my Queue! Code: ${session.joinCode}` });
  };

  // ── Render ──────────────────────────────────────────
  const renderParticipant = useCallback(({ item }: { item: any }) => {
    const status = item.status?.toUpperCase();
    const isServing = status === "SERVING";
    const isCompleted = status === "COMPLETED";

    const Wrapper = isServing ? Animatable.View : View;

    return (
      <Wrapper
        animation={isServing ? "pulse" : undefined}
        iterationCount={isServing ? "infinite" : undefined}
        duration={2000}
        style={[
          styles.row,
          isServing && styles.servingRow,
          isCompleted && styles.completedRow,
        ]}
      >
        <View
          style={[
            styles.tokenCircle,
            isServing && styles.servingToken,
            isCompleted && styles.completedToken,
          ]}
        >
          <Text
            style={[styles.tokenNum, isServing && { color: "#FFF" }]}
          >
            {item.token}
          </Text>
        </View>

        <Text
          style={[
            styles.name,
            isCompleted && {
              textDecorationLine: "line-through" as const,
              color: "#94A3B8",
            },
          ]}
        >
          {item.name}
        </Text>

        {/* STATUS BADGE */}
        <View
          style={[
            styles.statusPill,
            isServing && { backgroundColor: "#10B981" },
            isCompleted && { backgroundColor: "#E2E8F0" },
            !isServing && !isCompleted && { backgroundColor: "#F1F5F9" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isServing && { color: "#FFFFFF" },
              isCompleted && { color: "#94A3B8" },
              !isServing && !isCompleted && { color: "#64748B" },
            ]}
          >
            {isServing ? "NOW SERVING" : isCompleted ? "DONE" : "WAITING"}
          </Text>
        </View>
      </Wrapper>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#047857" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>{session.title}</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>JOIN CODE:</Text>
            <Text style={styles.codeText}>{session.joinCode}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={shareCode} style={styles.iconBtn}>
          <Ionicons name="share-social" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* QUEUE LIST */}
      <View style={styles.listArea}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeader}>Participants</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{queue.length}</Text>
          </View>
          {waitingCount > 0 && (
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingBadgeText}>
                {waitingCount} waiting
              </Text>
            </View>
          )}
        </View>

        {queue.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="people-outline"
              size={48}
              color="#CBD5E1"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.emptyText}>
              Queue is empty. Share the code!
            </Text>
          </View>
        ) : (
          <FlatList
            data={queue}
            keyExtractor={(i) => i.id}
            renderItem={renderParticipant}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* HOST FOOTER */}
      {role === "HOST" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.callBtn, isQueueEmpty && styles.disabledBtn]}
            onPress={handleCallNext}
            activeOpacity={isQueueEmpty ? 1 : 0.7}
          >
            <Text style={styles.callText}>
              {isQueueEmpty ? "Queue Empty" : "Call Next Person"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#047857",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 40,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
  },
  codeBox: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  codeLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 6,
  },
  codeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },

  listArea: {
    flex: 1,
    backgroundColor: "#FFF",
    marginTop: -24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  listHeader: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  countBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: { fontWeight: "700", color: "#64748B", fontSize: 12 },
  waitingBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  waitingBadgeText: {
    fontWeight: "700",
    color: "#059669",
    fontSize: 12,
  },

  // ── Participant Rows ───────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  servingRow: {
    borderWidth: 2,
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  completedRow: {
    opacity: 0.5,
  },

  tokenCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  servingToken: { backgroundColor: "#10B981" },
  completedToken: { backgroundColor: "#E2E8F0" },
  tokenNum: { color: "#64748B", fontWeight: "800", fontSize: 16 },

  name: { fontSize: 16, fontWeight: "700", color: "#1E293B", flex: 1 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },

  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#94A3B8", fontSize: 14, fontWeight: "500" },

  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFF",
  },
  callBtn: {
    backgroundColor: "#047857",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#047857",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  callText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  disabledBtn: {
    backgroundColor: "#94A3B8",
    elevation: 0,
    shadowOpacity: 0,
  },
});
