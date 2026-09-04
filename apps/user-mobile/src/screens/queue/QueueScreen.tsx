import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useUserQueueStore } from "../../store/userQueueStore";
import { colors, shadows } from "../../theme";

import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QueueScreen() {
  const navigation = useNavigation<any>();
  const { queueStatus, activeClinicId, refreshData, isLoading, estimatedWait, peopleAhead } = useUserQueueStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        const res = await api.get("/queue/history", { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) {
          setPastAppointments(res.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshData();
      fetchHistory();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await fetchHistory();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Visits</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* ACTIVE QUEUE */}
        <Text style={styles.sectionTitle}>Active Queue</Text>
        {queueStatus === "JOINED" ? (
          <TouchableOpacity 
            style={styles.activeCard} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate("LiveTracking", { clinicId: activeClinicId })}
          >
            <View style={styles.activeImagePlaceholder}>
              <Ionicons name="medical" size={32} color={colors.primary} />
            </View>
            <View style={styles.activeInfo}>
              <Text style={styles.activeDate}>Today • Live Tracker</Text>
              <Text style={styles.activeName}>Clinic Queue</Text>
              <Text style={styles.activeStatus}>You are #{peopleAhead + 1} in line</Text>
            </View>
            <View style={styles.arrowIcon}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.divider} />
            <Text style={styles.emptyTitle}>No active queues... yet!</Text>
            <Text style={styles.emptyDesc}>When you join a queue, it will appear here so you can track your position.</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate("Home")}>
              <Text style={styles.exploreBtnText}>Explore Clinics</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAST APPOINTMENTS */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Past Visits</Text>
        {pastAppointments.map((apt) => (
          <View key={apt.id} style={styles.pastCard}>
            <View style={styles.pastIcon}>
              <Ionicons name="checkmark-done" size={20} color={colors.success} />
            </View>
            <View style={styles.pastInfo}>
              <Text style={styles.pastName}>{apt.clinic?.name || "Clinic"}</Text>
              <Text style={styles.pastSub}>Visited • {new Date(apt.completedTime).toLocaleDateString()}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 32, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
    marginTop: 16,
  },
  
  // ACTIVE CARD
  activeCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    ...shadows.card,
  },
  activeImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.pillBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  activeInfo: {
    flex: 1,
  },
  activeDate: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  activeName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  activeStatus: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  arrowIcon: {
    padding: 8,
  },

  // EMPTY STATE
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreBtn: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },

  // PAST CARD
  pastCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pastIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pillBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  pastInfo: { flex: 1 },
  pastName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pastSub: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
