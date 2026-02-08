import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator, // 1. Added Loading Spinner
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../services/api"; // 2. Import API

const { width } = Dimensions.get("window");

// 🎨 THEME COLORS
const COLORS = {
  primary: "#10B981",
  dark: "#064E3B",
  bg: "#FFFFFF",
  text: "#1E293B",
  subText: "#64748B",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  selectedBg: "#ECFDF5",
};

// 🗓️ MOCK DATA
const DATES = [
  { day: "Mon", date: "12", full: "2023-10-12" },
  { day: "Tue", date: "13", full: "2023-10-13" },
  { day: "Wed", date: "14", full: "2023-10-14" },
  { day: "Thu", date: "15", full: "2023-10-15" },
  { day: "Fri", date: "16", full: "2023-10-16" },
  { day: "Sat", date: "17", full: "2023-10-17" },
];

const MORNING_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
];
const EVENING_SLOTS = [
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
];

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false); // 3. Loading State

  // 4. THE BACKEND CONNECTION LOGIC
  const handleBooking = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      const dateObj = DATES[selectedDate];

      const payload = {
        clinicId: "c86b8cc6-d4a3-4d30-acd6-98066ba616ee", // Using our test clinic
        patientName: "Pratham Raj", // Hardcoded user for demo
        date: dateObj.full,
        time: selectedSlot,
      };

      const res = await api.post("/booking/create", payload);

      if (res.data.success) {
        Alert.alert("Success", "✅ Appointment Booked Successfully!", [
          { text: "OK", onPress: () => navigation.navigate("Main") },
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "❌ Booking Failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* DOCTOR SUMMARY CARD */}
        <Animatable.View
          animation="fadeInDown"
          duration={600}
          style={styles.docCard}
        >
          <Image
            source={{
              uri: "https://img.freepik.com/free-photo/doctor-offering-medical-teleconsultation_23-2149329007.jpg",
            }}
            style={styles.docImg}
          />
          <View style={styles.docInfo}>
            <Text style={styles.docName}>Dr. Trafalgar Law</Text>
            <Text style={styles.docSpec}>Heart Surgeon • 7 Yrs Exp</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>
        </Animatable.View>

        {/* 🗓️ CALENDAR STRIP */}
        <Text style={styles.sectionTitle}>October 2023</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calendarScroll}
        >
          {DATES.map((item, index) => {
            const isSelected = selectedDate === index;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateBox, isSelected && styles.dateBoxSelected]}
                onPress={() => setSelectedDate(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.dayText, isSelected && styles.textSelected]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[styles.dateText, isSelected && styles.textSelected]}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ☀️ MORNING SLOTS */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Text style={styles.sectionTitle}>Morning</Text>
          <View style={styles.slotGrid}>
            {MORNING_SLOTS.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.slotPill,
                  selectedSlot === time && styles.slotSelected,
                ]}
                onPress={() => setSelectedSlot(time)}
              >
                <Text
                  style={[
                    styles.slotText,
                    selectedSlot === time && styles.slotTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>

        {/* 🌙 EVENING SLOTS */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <Text style={styles.sectionTitle}>Evening</Text>
          <View style={styles.slotGrid}>
            {EVENING_SLOTS.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.slotPill,
                  selectedSlot === time && styles.slotSelected,
                ]}
                onPress={() => setSelectedSlot(time)}
              >
                <Text
                  style={[
                    styles.slotText,
                    selectedSlot === time && styles.slotTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>
      </ScrollView>

      {/* FOOTER ACTION */}
      <Animatable.View
        animation="slideInUp"
        duration={500}
        style={styles.footer}
      >
        <View>
          <Text style={styles.priceLabel}>Total Cost</Text>
          <Text style={styles.priceValue}>$50.00</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.bookBtn,
            (!selectedSlot || isBooking) && styles.disabledBtn,
          ]}
          disabled={!selectedSlot || isBooking}
          onPress={handleBooking} // 5. CONNECTED HANDLER
        >
          {isBooking ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.bookBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: COLORS.surface },

  scrollContent: { padding: 20, paddingBottom: 100 },

  // DOC CARD
  docCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docImg: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  docSpec: { fontSize: 13, color: COLORS.subText, marginVertical: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, fontWeight: "600", color: COLORS.text },

  // CALENDAR
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 12,
  },
  calendarScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateBox: {
    width: 60,
    height: 70,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateBoxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: { fontSize: 12, color: COLORS.subText, marginBottom: 4 },
  dateText: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  textSelected: { color: "#FFF" },

  // SLOTS
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  slotPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: (width - 60) / 3,
    alignItems: "center",
  },
  slotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  slotTextSelected: { color: "#FFF" },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  priceLabel: { fontSize: 12, color: COLORS.subText },
  priceValue: { fontSize: 24, fontWeight: "800", color: COLORS.text },

  bookBtn: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  disabledBtn: { backgroundColor: "#CBD5E1", shadowOpacity: 0 },
  bookBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
