import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { COLORS } from "../../theme";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HistoryScreen({ navigation }: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const res = await api.get("/provider/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.history) {
          setHistory(res.data.history);
        }
      } catch (err) {
        if (__DEV__) console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Session History" showBack />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No sessions recorded today.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="checkmark-done"
                  size={20}
                  color={COLORS.success}
                />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={styles.name}>{item.patientName || item.name}</Text>
                <Text style={styles.date}>
                  {item.date || "Today"} • {item.type || "General"}
                </Text>
              </View>
              <Text style={styles.fee}>✓</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontWeight: "700", color: COLORS.text, fontSize: 15 },
  date: { color: COLORS.subText, fontSize: 12, marginTop: 2 },
  fee: { fontWeight: "700", color: COLORS.primary, fontSize: 15 },
  empty: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 15,
  }
});
