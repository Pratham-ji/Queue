import React, { useEffect, useState } from "react";
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
import { io } from "socket.io-client";
import { api } from "../../services/api";

// const BASE_URL = "http://192.168.31.69:5001"; // home ip
const SOCKET_URL = "http://172.20.10.2:5001"; // jio phone

export default function CustomSessionScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { session, role } = route.params;

  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    // 1. Connect
    const socket = io(SOCKET_URL);
    socket.emit("join_session_room", session.id);

    // 2. Listen for New Joins
    socket.on("participant_joined", (p) => {
      setQueue((prev) => [...prev, p]);
    });

    // 3. Listen for Status Updates (The Magic ✨)
    socket.on("queue_updated", (updatedPerson) => {
      setQueue((prevQueue) =>
        prevQueue.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)),
      );
    });

    // 4. Initial Sync
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

  // 1. SMART LOGIC: Check if anyone is actually waiting
  const waitingParticipants = queue.filter((p) => p.status === "WAITING");
  const isQueueEmpty = waitingParticipants.length === 0;

  const handleCallNext = async () => {
    // Safety Check: Stop execution if queue is empty
    if (isQueueEmpty) {
      Alert.alert("All Caught Up", "There is no one left in the waiting list!");
      return;
    }

    try {
      const res = await api.post("/custom/next", { sessionId: session.id });
      if (!res.data.success) {
        Alert.alert("Info", res.data.error);
      }
    } catch (e) {
      console.error("Call next failed", e);
    }
  };

  // 2. HELPER TO CHECK WAITING STATUS
  const hasWaitingParticipants = queue.some((p) => p.status === "WAITING");
  const shareCode = () => {
    Share.share({ message: `Join my Queue! Code: ${session.joinCode}` });
  };

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
        </View>

        {queue.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Queue is empty. Share the code!
            </Text>
          </View>
        ) : (
          <FlatList
            data={queue}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.row,
                  item.status === "SERVING" && styles.activeRow,
                ]}
              >
                <View
                  style={[
                    styles.tokenCircle,
                    item.status === "SERVING" && styles.activeToken,
                  ]}
                >
                  <Text
                    style={[
                      styles.tokenNum,
                      item.status === "SERVING" && { color: "#FFF" },
                    ]}
                  >
                    {item.token}
                  </Text>
                </View>
                <Text style={styles.name}>{item.name}</Text>

                {/* STATUS BADGE */}
                <View
                  style={[
                    styles.statusPill,
                    item.status === "SERVING"
                      ? { backgroundColor: "#DCFCE7" }
                      : { backgroundColor: "#F1F5F9" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === "SERVING"
                        ? { color: "#166534" }
                        : { color: "#64748B" },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* HOST FOOTER */}
      {role === "HOST" && (
        <View style={styles.footer}>
          <TouchableOpacity
            // 2. VISUAL FEEDBACK: Turn button Grey if empty
            style={[styles.callBtn, isQueueEmpty && styles.disabledBtn]}
            onPress={handleCallNext}
            activeOpacity={isQueueEmpty ? 1 : 0.7} // Disable click effect if empty
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
  activeRow: { borderColor: "#10B981", backgroundColor: "#F0FDF4" }, // Highlight Active User

  tokenCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  activeToken: { backgroundColor: "#10B981" },
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
  waitingText: {
    textAlign: "center",
    color: "#64748B",
    fontStyle: "italic",
    fontWeight: "500",
  },
  // ADD DISABLED STYLE
  disabledBtn: {
    backgroundColor: "#94A3B8", // Slate 400 (Grey)
    elevation: 0,
    shadowOpacity: 0,
  },
});
