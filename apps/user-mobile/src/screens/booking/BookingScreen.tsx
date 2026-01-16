import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

// --- MOCK DATA (Ready for Backend Replacement) ---
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
  "10:45 AM",
  "11:15 AM",
];
const EVENING_SLOTS = [
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "06:15 PM",
  "07:00 PM",
];

const COLORS = {
  primary: "#047857", // Trustworthy Emerald Green
  background: "#FFFFFF",
  textMain: "#111827",
  textSub: "#6B7280",
  border: "#E5E7EB",
  surface: "#F9FAFB",
};

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // In a real app, you'd fetch doctor details using this ID
  const { doctorId } = route.params || {};

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Time Slot</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. DOCTOR CONTEXT CARD (Builds Confidence) */}
        <View style={styles.doctorCard}>
          <Image
            source={{
              uri: "https://i.pinimg.com/736x/8a/a3/95/8aa3952a550d99938c50d32f14376483.jpg",
            }}
            style={styles.avatar}
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.docName}>Dr. Trafalgar Law</Text>
            <Text style={styles.docSub}>
              Ope Ope No Mi • Heart Pirates Clinic
            </Text>
            <View style={styles.verifiedRow}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.verifiedText}>Verified Surgeon</Text>
            </View>
          </View>
        </View>

        {/* 3. DATE SELECTOR (Horizontal Strip) */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        >
          {DATES.map((item, index) => {
            const isActive = selectedDateIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateBox, isActive && styles.activeDateBox]}
                onPress={() => {
                  setSelectedDateIndex(index);
                  setSelectedSlot(null); // Clear slot to force re-selection
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayText, isActive && styles.activeText]}>
                  {item.day}
                </Text>
                <Text style={[styles.dateText, isActive && styles.activeText]}>
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. SLOT GRID - Morning */}
        <View style={styles.slotSection}>
          <View style={styles.slotHeaderRow}>
            <Ionicons name="sunny-outline" size={18} color={COLORS.textSub} />
            <Text style={styles.slotHeaderTitle}>Morning</Text>
          </View>
          <View style={styles.grid}>
            {MORNING_SLOTS.map((slot) => {
              const isActive = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotChip, isActive && styles.activeSlotChip]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.slotText, isActive && styles.activeSlotText]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. SLOT GRID - Evening */}
        <View style={styles.slotSection}>
          <View style={styles.slotHeaderRow}>
            <Ionicons name="moon-outline" size={18} color={COLORS.textSub} />
            <Text style={styles.slotHeaderTitle}>Evening</Text>
          </View>
          <View style={styles.grid}>
            {EVENING_SLOTS.map((slot) => {
              const isActive = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotChip, isActive && styles.activeSlotChip]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.slotText, isActive && styles.activeSlotText]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 6. BOTTOM ACTION BAR (Sticky) */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Consultation Fee</Text>
          <Text style={styles.price}>₹800</Text>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, !selectedSlot && styles.disabledBtn]}
          disabled={!selectedSlot}
          onPress={() => {
            // Here is where you will eventually call your Backend API
            alert(`Booking confirmed for ${selectedSlot}`);
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.payBtnText}>Confirm & Pay</Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color="#FFF"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
  },

  scrollContent: {
    paddingBottom: 120, // Space for footer
  },

  // Doctor Card
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
  },
  doctorInfo: {
    marginLeft: 16,
    flex: 1,
  },
  docName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  docSub: {
    fontSize: 12,
    color: COLORS.textSub,
    marginBottom: 6,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 4,
  },

  // Date Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginLeft: 20,
    marginBottom: 12,
  },
  dateScroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  dateBox: {
    width: 64,
    height: 76,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FFF",
  },
  activeDateBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    // Soft Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dayText: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: "500",
    marginBottom: 6,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  activeText: {
    color: "#FFF",
  },

  // Slot Grid
  slotSection: {
    marginBottom: 24,
  },
  slotHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    marginBottom: 12,
  },
  slotHeaderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSub,
    marginLeft: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
  },
  slotChip: {
    width: "31%", // 3 per row
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginRight: "2%", // Gap
  },
  activeSlotChip: {
    backgroundColor: "#ECFDF5", // Very light green
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMain,
  },
  activeSlotText: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Sticky Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // Footer Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  priceContainer: {
    justifyContent: "center",
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSub,
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  payBtn: {
    backgroundColor: COLORS.textMain, // Black button for contrast
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },
  disabledBtn: {
    backgroundColor: "#D1D5DB", // Greyed out
  },
  payBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
});
