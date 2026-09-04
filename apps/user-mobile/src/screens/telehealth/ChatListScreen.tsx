import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { api } from "../../services/api";

const COLORS = {
  primary: "#10B981",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  subText: "#64748B",
  border: "#E2E8F0",
  warning: "#F59E0B",
};

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  const fetchThreads = async () => {
    try {
      const [threadRes, userRes] = await Promise.all([
        api.get("/chat/threads"),
        api.get("/auth/me")
      ]);
      setThreads(threadRes.data.data);
      if (userRes.data.data?.credits !== undefined) {
        setCredits(userRes.data.data.credits);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchThreads();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => {
    const isDoctor = !!item.user; // If we populate user, we are provider. Otherwise we are patient.
    const displayProfile = isDoctor ? item.user : item.doctor;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate("ChatScreen", { threadId: item.id, profile: displayProfile, isActive: item.isActive })}
      >
        <Image 
          source={{ uri: displayProfile?.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop" }} 
          style={styles.avatar} 
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.name}>{displayProfile?.name || "User"}</Text>
            {item.isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {item.isActive ? "Tap to continue conversation" : "Thread closed"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.subText} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.creditBadge}>
          <Ionicons name="wallet" size={16} color="#FFF" />
          <Text style={styles.creditText}>{credits} Credits</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchThreads} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.subText} />
              <Text style={styles.emptyText}>No messages yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: COLORS.text },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  creditText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  list: { padding: 20, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  activeBadge: { backgroundColor: "rgba(16, 185, 129, 0.1)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  activeText: { color: COLORS.primary, fontSize: 10, fontWeight: "700" },
  sub: { fontSize: 13, color: COLORS.subText },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { marginTop: 16, fontSize: 15, color: COLORS.subText },
});
