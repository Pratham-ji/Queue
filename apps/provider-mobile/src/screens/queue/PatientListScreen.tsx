import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

// IMPORT THE STORE (The Single Source of Truth)
import { useQueueStore } from "../../store/queueStore";

const COLORS = {
  primary: "#2563EB",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  subText: "#64748B",
  border: "#E2E8F0",
  accent: "#EEF2FF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export default function PatientListScreen({ navigation }: any) {
  const [search, setSearch] = useState("");

  // CONNECT TO LIVE DATA
  const { queue, stats } = useQueueStore();

  // Filter logic for the search bar
  const filteredQueue = queue.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.token.toString().includes(search),
  );

  const renderItem = ({ item, index }: any) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={index * 50}
      style={styles.card}
    >
      <View style={styles.cardLeft}>
        <View style={styles.tokenBox}>
          <Text style={styles.tokenText}>{item.token}</Text>
        </View>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.issue}>
            {item.type} • {item.arrivalTime}
          </Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <View style={[styles.statusBadge, styles.statusWaiting]}>
          <Text style={[styles.statusText, { color: COLORS.warning }]}>
            {item.status}
          </Text>
        </View>
        <TouchableOpacity style={styles.actionIcon}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.subText} />
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Queue</Text>
        {/* Shows real-time count */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{queue.length}</Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={COLORS.subText}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search patient or token..."
          style={styles.searchInput}
          placeholderTextColor={COLORS.subText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* LIVE STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Waiting</Text>
          <Text style={styles.statValue}>{stats.waiting}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{stats.completed}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg Wait</Text>
          <Text style={styles.statValue}>{stats.avgTime}</Text>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredQueue}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color={COLORS.border}
            />
            <Text style={styles.emptyText}>
              All caught up! No patients waiting.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, flex: 1 },
  countBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 14,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    height: "100%",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: { alignItems: "center", flex: 1 },
  statLabel: {
    fontSize: 11,
    color: COLORS.subText,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 4,
  },
  statDivider: { width: 1, height: "80%", backgroundColor: COLORS.border },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  tokenBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenText: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  issue: {
    fontSize: 12,
    color: COLORS.subText,
    marginTop: 2,
    fontWeight: "500",
  },

  cardRight: { alignItems: "flex-end", gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusWaiting: { backgroundColor: "#FEF3C7" },
  statusText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  actionIcon: { padding: 4 },

  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyText: {
    marginTop: 16,
    color: COLORS.subText,
    fontSize: 16,
    fontWeight: "500",
  },
});
