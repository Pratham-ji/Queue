import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🎨 UNICORN PALETTE
const COLORS = {
  primary: "#059669", // Emerald
  bg: "#F8FAFC",
  text: "#1E293B",
  subText: "#64748B",
  white: "#FFFFFF",
  border: "#E2E8F0",
  success: "#10B981",
};

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { doctorId } = route.params; // Get Doctor ID from previous screen

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);

  // 1. GENERATE DATES (Next 7 days)
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      fullDate: d.toISOString().split("T")[0], // 2023-10-25
    };
  });

  // 2. GENERATE SLOTS
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
    "06:00 PM",
    "06:30 PM",
  ];

  // 3. FETCH DOCTOR DETAILS (To show on top)
  useEffect(() => {
    // In a real app, we might fetch this again or pass it all via params
    // For now, let's just use the ID to let the backend handle the booking
    console.log("Booking for Doctor ID:", doctorId);
  }, [doctorId]);

  // 4. HANDLE BOOKING (THE FIX IS HERE)
  const handleBook = async () => {
    if (!selectedTime) {
      Alert.alert("Missing Info", "Please select a time slot.");
      return;
    }

    setLoading(true);

    try {
      // A. Get User Info from Storage (The part that was missing!)
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : { name: "Guest Patient" };

      // B. Construct the CORRECT Payload
      const payload = {
        doctorId: doctorId,
        patientName: user.name, // 👈 CRITICAL FIX
        date: dates[selectedDate].fullDate,
        time: selectedTime,
      };

      console.log("📡 Sending Payload:", payload);

      // C. Send Request
      const res = await api.post("/booking/create", payload);

      if (res.data.success) {
        Alert.alert("Success! 🎉", "Your appointment has been booked.", [
          { text: "OK", onPress: () => navigation.navigate("Home") },
        ]);
      } else {
        Alert.alert("Error", res.data.error || "Booking failed");
      }
    } catch (error: any) {
      console.error("Booking Error:", error);
      Alert.alert("Error", "Network request failed. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
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
        {/* DOCTOR SUMMARY CARD */}
        <View style={styles.docCard}>
          <View style={styles.docIcon}>
            <Ionicons name="person" size={32} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.docLabel}>Booking Appointment</Text>
            <Text style={styles.docSub}>Standard Consultation</Text>
          </View>
        </View>

        {/* DATE SELECTOR */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
        >
          {dates.map((item, index) => {
            const isSelected = selectedDate === index;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateBox, isSelected && styles.dateBoxActive]}
                onPress={() => setSelectedDate(index)}
              >
                <Text style={[styles.dayText, isSelected && styles.textWhite]}>
                  {item.day}
                </Text>
                <Text style={[styles.dateText, isSelected && styles.textWhite]}>
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TIME SELECTOR */}
        <Text style={styles.sectionTitle}>Morning Slots</Text>
        <View style={styles.slotGrid}>
          {slots.slice(0, 4).map((slot) => (
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

        <Text style={styles.sectionTitle}>Afternoon Slots</Text>
        <View style={styles.slotGrid}>
          {slots.slice(4, 8).map((slot) => (
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

        <Text style={styles.sectionTitle}>Evening Slots</Text>
        <View style={styles.slotGrid}>
          {slots.slice(8).map((slot) => (
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

      {/* FOOTER */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total Fee</Text>
          <Text style={styles.totalPrice}>₹500</Text>
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

  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  docLabel: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  docSub: { fontSize: 13, color: COLORS.subText },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
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
  dayText: { fontSize: 12, color: COLORS.subText, marginBottom: 4 },
  dateText: { fontSize: 16, fontWeight: "700", color: COLORS.text },
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
  slotText: { fontSize: 12, fontWeight: "600", color: COLORS.text },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  totalLabel: { fontSize: 12, color: COLORS.subText },
  totalPrice: { fontSize: 20, fontWeight: "800", color: COLORS.text },
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
