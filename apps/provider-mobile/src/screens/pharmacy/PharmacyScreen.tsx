import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// MOCK DATA for KDS
const MOCK_ORDERS = [
  { id: "1", patientName: "Aarav Sharma", token: "A-12", status: "PENDING", medicines: ["Paracetamol 500mg", "Amoxicillin"] },
  { id: "2", patientName: "Riya Verma", token: "A-15", status: "PACKING", medicines: ["Vitamin C", "Cough Syrup"] },
  { id: "3", patientName: "Rahul Das", token: "A-08", status: "READY", medicines: ["Ibuprofen 400mg"] },
];

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pharmacy KDS</Text>
      </View>

      <View style={styles.tabContainer}>
        {["PENDING", "PACKING", "READY"].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders in {activeTab}</Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.patientName}>{order.patientName}</Text>
                  <Text style={styles.tokenText}>Token: #{order.token}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.medicineList}>
                <Text style={styles.medTitle}>Prescription:</Text>
                {order.medicines.map((m, i) => (
                  <Text key={i} style={styles.medItem}>• {m}</Text>
                ))}
              </View>

              {order.status === "PENDING" && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(order.id, "PACKING")}>
                  <Text style={styles.btnText}>Start Packing</Text>
                  <Ionicons name="cube-outline" size={18} color="#FFF" />
                </TouchableOpacity>
              )}

              {order.status === "PACKING" && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(order.id, "READY")}>
                  <Text style={styles.btnText}>Mark as Ready</Text>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                </TouchableOpacity>
              )}

              {order.status === "READY" && (
                <View style={styles.readyActions}>
                  <TextInput 
                    style={styles.otpInput} 
                    placeholder="Enter 6-digit OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpInputs[order.id] || ""}
                    onChangeText={(val) => setOtpInputs(prev => ({...prev, [order.id]: val}))}
                  />
                  <TouchableOpacity style={styles.clearBtn} onPress={() => handleClearOrder(order.id)}>
                    <Text style={styles.btnText}>Clear Order</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" }, // Dark background
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#1E293B" },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#F8FAFC" },
  tabContainer: { flexDirection: "row", padding: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8, backgroundColor: "#1E293B" },
  activeTab: { backgroundColor: "#2563EB" },
  tabText: { color: "#94A3B8", fontWeight: "600", fontSize: 13 },
  activeTabText: { color: "#FFFFFF" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#64748B", fontSize: 16 },
  orderCard: { backgroundColor: "#1E293B", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#334155" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  patientName: { fontSize: 18, fontWeight: "700", color: "#F8FAFC" },
  tokenText: { fontSize: 14, color: "#94A3B8", marginTop: 4 },
  statusBadge: { backgroundColor: "rgba(37, 99, 235, 0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#38BDF8", fontSize: 12, fontWeight: "700" },
  medicineList: { backgroundColor: "#0F172A", padding: 12, borderRadius: 8, marginBottom: 16 },
  medTitle: { color: "#94A3B8", fontSize: 12, fontWeight: "600", marginBottom: 8, textTransform: "uppercase" },
  medItem: { color: "#F8FAFC", fontSize: 14, marginBottom: 4 },
  actionBtn: { backgroundColor: "#2563EB", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 8 },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  readyActions: { flexDirection: "row", gap: 8 },
  otpInput: { flex: 1, backgroundColor: "#0F172A", borderWidth: 1, borderColor: "#334155", borderRadius: 12, paddingHorizontal: 16, color: "#FFF", fontSize: 16 },
  clearBtn: { backgroundColor: "#10B981", paddingHorizontal: 20, justifyContent: "center", borderRadius: 12 },
});
