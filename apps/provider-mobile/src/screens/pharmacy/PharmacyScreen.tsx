import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// MOCK DATA for KDS — TODO: replace with live /api/pharmacy/orders fetch
const MOCK_ORDERS = [
  { id: "1", patientName: "Aarav Sharma", token: "A-12", status: "PENDING", medicines: ["Paracetamol 500mg", "Amoxicillin 250mg"] },
  { id: "2", patientName: "Riya Verma", token: "A-15", status: "PACKING", medicines: ["Vitamin C 1000mg", "Cough Syrup 100ml"] },
  { id: "3", patientName: "Rahul Das", token: "A-08", status: "READY", medicines: ["Ibuprofen 400mg"] },
];

const TAB_CONFIG: Record<string, { icon: string; color: string }> = {
  PENDING: { icon: "hourglass-outline", color: "#F59E0B" },
  PACKING: { icon: "cube-outline", color: "#2563EB" },
  READY: { icon: "checkmark-done-outline", color: "#10B981" },
};

export default function PharmacyScreen() {
  const [activeTab, setActiveTab] = useState<"PENDING" | "PACKING" | "READY">("PENDING");
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});

  const filteredOrders = orders.filter(o => o.status === activeTab);

  const updateStatus = (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (newStatus === "READY") {
      // TODO: Fire WebSocket event to patient
      console.log("Fired WS to patient: Medicine is ready!");
    }
  };

  const handleClearOrder = (id: string) => {
    if (otpInputs[id]?.length === 6) {
      setOrders(prev => prev.filter(o => o.id !== id));
    } else {
      alert("Invalid OTP. Please enter the 6-digit code from the patient.");
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    if (status === "PENDING") return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" };
    if (status === "PACKING") return { bg: "rgba(37, 99, 235, 0.15)", text: "#60A5FA" };
    return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" };
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Pharmacy KDS</Text>
          <Text style={styles.headerSub}>{orders.length} total orders</Text>
        </View>
        <View style={styles.headerRight}>
          {Object.entries(TAB_CONFIG).map(([key, cfg]) => (
            <View key={key} style={styles.headerCount}>
              <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
              <Text style={[styles.headerCountText, { color: cfg.color }]}>
                {orders.filter(o => o.status === key).length}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* SEGMENTED TABS */}
      <View style={styles.tabContainer}>
        {(["PENDING", "PACKING", "READY"] as const).map(tab => {
          const isActive = activeTab === tab;
          const count = orders.filter(o => o.status === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
              {count > 0 && (
                <View style={[styles.tabBadge, isActive && styles.activeTabBadge]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.activeTabBadgeText]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ORDER LIST */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name={activeTab === "PENDING" ? "hourglass-outline" : activeTab === "PACKING" ? "cube-outline" : "checkmark-done-outline"}
                size={40}
                color="#334155"
              />
            </View>
            <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} orders</Text>
            <Text style={styles.emptySub}>
              {activeTab === "PENDING"
                ? "New prescriptions from doctors will appear here."
                : activeTab === "PACKING"
                ? "Move orders from Pending to start packing."
                : "Pack and mark orders as ready to see them here."}
            </Text>
          </View>
        ) : (
          filteredOrders.map(order => {
            const badge = getStatusBadgeStyle(order.status);
            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{order.patientName}</Text>
                    <Text style={styles.tokenText}>Token #{order.token}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>{order.status}</Text>
                  </View>
                </View>

                {/* Medicine List */}
                <View style={styles.medicineList}>
                  <Text style={styles.medTitle}>PRESCRIPTION</Text>
                  {order.medicines.map((m, i) => (
                    <View key={i} style={styles.medRow}>
                      <View style={styles.medDot} />
                      <Text style={styles.medItem}>{m}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                {order.status === "PENDING" && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(order.id, "PACKING")}>
                    <Ionicons name="cube-outline" size={18} color="#FFF" />
                    <Text style={styles.btnText}>Start Packing</Text>
                  </TouchableOpacity>
                )}

                {order.status === "PACKING" && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(order.id, "READY")}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                    <Text style={styles.btnText}>Mark as Ready</Text>
                  </TouchableOpacity>
                )}

                {order.status === "READY" && (
                  <View style={styles.readyActions}>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="6-digit OTP"
                      placeholderTextColor="#475569"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otpInputs[order.id] || ""}
                      onChangeText={(val) => setOtpInputs(prev => ({ ...prev, [order.id]: val }))}
                    />
                    <TouchableOpacity style={styles.clearBtn} onPress={() => handleClearOrder(order.id)}>
                      <Ionicons name="shield-checkmark" size={16} color="#FFF" />
                      <Text style={styles.clearBtnText}>Verify</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#F8FAFC" },
  headerSub: { fontSize: 13, color: "#64748B", marginTop: 2 },
  headerRight: { flexDirection: "row", gap: 12 },
  headerCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerCountText: { fontSize: 14, fontWeight: "800" },

  // Tabs
  tabContainer: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#1E293B",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  activeTab: { backgroundColor: "#2563EB" },
  tabText: { color: "#64748B", fontWeight: "700", fontSize: 13 },
  activeTabText: { color: "#FFFFFF" },
  tabBadge: {
    backgroundColor: "#334155",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabBadge: { backgroundColor: "rgba(255,255,255,0.25)" },
  tabBadgeText: { color: "#94A3B8", fontSize: 11, fontWeight: "800" },
  activeTabBadgeText: { color: "#FFF" },

  // Content
  scrollContent: { padding: 16, paddingBottom: 120 },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  emptyTitle: {
    color: "#94A3B8",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySub: {
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // Order Card
  orderCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  patientName: { fontSize: 18, fontWeight: "700", color: "#F8FAFC" },
  tokenText: { fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: "600" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },

  // Medicine List
  medicineList: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  medTitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 1,
  },
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  medDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#60A5FA",
    marginRight: 10,
  },
  medItem: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "600",
  },

  // Action Buttons
  actionBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  // Ready Actions
  readyActions: { flexDirection: "row", gap: 10 },
  otpInput: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 4,
  },
  clearBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
  },
  clearBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});
