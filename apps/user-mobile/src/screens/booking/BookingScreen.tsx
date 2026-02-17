import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  primary: "#059669",
  bg: "#F8FAFC",
  text: "#1E293B",
  white: "#FFFFFF",
  border: "#E2E8F0",
};

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { doctorId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      fullDate: d.toISOString().split("T")[0],
    };
  });

  const slots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "05:00 PM",
    "05:30 PM",
  ];

  const handleBook = async () => {
    if (!selectedTime)
      return Alert.alert("Missing Info", "Please select a time slot.");
    setLoading(true);

    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : { name: "Guest Patient" };

      const payload = {
        doctorId,
        patientName: user.name,
        date: dates[selectedDate].fullDate,
        time: selectedTime,
      };

      console.log("📡 Booking Payload:", payload);
      const res = await api.post("/booking/create", payload);

      if (res.data.success) {
        Alert.alert("Success", "Appointment Booked!", [
          { text: "OK", onPress: () => navigation.navigate("Home") }, // 👈 FIX: Safe navigation
        ]);
      } else {
        Alert.alert("Error", res.data.error || "Booking failed");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert("Error", "Network request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Time</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Dates */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
        >
          {dates.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateBox,
                selectedDate === index && styles.dateBoxActive,
              ]}
              onPress={() => setSelectedDate(index)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDate === index && styles.textWhite,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDate === index && styles.textWhite,
                ]}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Slots */}
        <Text style={styles.sectionTitle}>Available Slots</Text>
        <View style={styles.slotGrid}>
          {slots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.slot, selectedTime === slot && styles.slotActive]}
              onPress={() => setSelectedTime(slot)}
            >
              <Text
                style={[
                  styles.slotText,
                  selectedTime === slot && styles.textWhite,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={{ fontSize: 12, color: COLORS.text }}>Total Fee</Text>
          <Text style={{ fontSize: 20, fontWeight: "800" }}>₹500</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={handleBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.bookBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  backBtn: { padding: 8, backgroundColor: COLORS.white, borderRadius: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  dateScroll: { paddingLeft: 20, marginBottom: 10 },
  dateBox: {
    width: 60,
    height: 70,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateBoxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  dateText: { fontSize: 16, fontWeight: "700" },
  textWhite: { color: "#FFF" },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  slot: {
    width: "30%",
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotText: { fontSize: 12, fontWeight: "600" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 150,
    alignItems: "center",
  },
  bookBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
