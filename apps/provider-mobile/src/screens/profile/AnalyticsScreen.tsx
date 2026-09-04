import React, { useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS } from "../../theme";
import { useQueueStore } from "../../store/queueStore";

const { width } = Dimensions.get("window");

const ChartBar = ({ height, label, active }: any) => (
  <View style={styles.barContainer}>
    <View
      style={[
        styles.bar,
        {
          height: height,
          backgroundColor: active ? "#FFF" : "rgba(255,255,255,0.3)",
        },
      ]}
    />
    <Text style={[styles.barLabel, { opacity: active ? 1 : 0.7 }]}>
      {label}
    </Text>
  </View>
);

const StatCard = ({ icon, label, value, trend, trendUp }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statIconBox}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text
        style={[styles.statTrend, { color: trendUp ? "#10B981" : "#EF4444" }]}
      >
        {trendUp ? "↑" : "↓"} {trend} vs last week
      </Text>
    </View>
  </View>
);

export default function AnalyticsScreen({ navigation }: any) {
  const { analytics, fetchAnalytics, activeClinic } = useQueueStore();

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* 1. DARK HEADER WITH CHART */}
      <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.navBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Performance</Text>
            <TouchableOpacity>
              <Ionicons name="calendar-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTAL PATIENTS SERVED</Text>
            <Text style={styles.totalVal}>
              {analytics ? analytics.totalPatients : <ActivityIndicator color="#fff" />}
            </Text>
          </View>

          <View style={styles.chartArea}>
            <ChartBar height={40} label="M" />
            <ChartBar height={60} label="T" />
            <ChartBar height={90} label="W" />
            <ChartBar height={120} label="T" active />
            <ChartBar height={80} label="F" />
            <ChartBar height={50} label="S" />
            <ChartBar height={30} label="S" />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* 2. STATS GRID */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          <StatCard
            icon="people"
            label="Total Patients"
            value={analytics?.totalPatients || 0}
            trend={analytics?.trend || "0%"}
            trendUp={analytics?.trendUp ?? true}
          />
          <StatCard
            icon="time"
            label="Avg Wait (min)"
            value={analytics?.avgWaitTime || 0}
            trend="2%"
            trendUp={false}
          />
          <StatCard
            icon="document-text"
            label="Prescriptions"
            value={analytics?.prescriptionsIssued || 0}
            trend="5%"
            trendUp={true}
          />
          <StatCard
            icon="star"
            label="Rating"
            value={activeClinic?.rating || "4.9"}
            trend="0%"
            trendUp={true}
          />
        </View>

        {/* 3. INSIGHTS */}
        <Text style={styles.sectionTitle}>INSIGHTS</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Ionicons name="trending-up" size={24} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Peak Hours</Text>
              <Text style={styles.insightText}>
                Your clinic is busiest between{" "}
                <Text style={{ fontWeight: "700" }}>10 AM - 12 PM</Text>.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Ionicons name="thumbs-up" size={24} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Positive Feedback</Text>
              <Text style={styles.insightText}>
                Patients appreciate your punctuality this week.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.downloadBtn}>
          <Text style={styles.downloadText}>Download Report (PDF)</Text>
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  screenTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },

  totalSection: { alignItems: "center", marginTop: 24 },
  totalLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  totalVal: { color: "#FFF", fontSize: 40, fontWeight: "800", marginTop: 8 },

  chartArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 40,
    marginTop: 32,
    height: 140,
  },
  barContainer: { alignItems: "center", gap: 8 },
  bar: { width: 8, borderRadius: 4 },
  barLabel: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  scroll: { padding: 24, marginTop: -20 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 32 },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    ...SHADOWS.light,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginVertical: 4,
  },
  statTrend: { fontSize: 11, fontWeight: "600" },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 16,
    letterSpacing: 1,
  },
  insightCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  insightRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  insightText: { fontSize: 13, color: "#64748B", lineHeight: 20 },

  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
    marginTop: 10,
  },
  downloadText: { color: COLORS.primary, fontWeight: "700", fontSize: 15 },
});
