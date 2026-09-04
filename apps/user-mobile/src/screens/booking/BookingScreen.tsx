import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/api";
import * as Animatable from "react-native-animatable";

const COLORS = {
  primary: "#059669",
  white: "#FFFFFF",
  bg: "#F8FAFC",
  text: "#0F172A",
  subText: "#64748B",
  border: "#E2E8F0",
};

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const doctorId = route.params?.doctorId;

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [doctor, setDoctor] = useState<any>(null);
  const [dates, setDates] = useState<any[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (doctorId) {
      api.get(`/hospital/doctors/${doctorId}`)
        .then(res => {
          if (res.data.success) {
            setDoctor(res.data.data);
            setDates(res.data.dates);
            setSlots(res.data.slots);
          }
        })
        .catch(err => console.log(err))
        .finally(() => setDataLoading(false));
    }
  }, [doctorId]);

  const handleBook = async () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please select a time slot first.");
      return;
    }

    setLoading(true);

    try {
      const userStr = await AsyncStorage.getItem("user_data");
      const user = userStr ? JSON.parse(userStr) : { name: "Guest Patient" };
      
      const payload = {
        name: user.name,
        phone: user.phone || "0000000000",
        clinicId: doctor.clinicId,
      };
      console.log('JOIN QUEUE PAYLOAD:', payload);

      const res = await api.post(`/queue/${doctor.clinicId}/add`, payload);

      if (res.data.success) {
        // Save to storage
        await AsyncStorage.setItem("user_token", res.data.data.token.toString());
        await AsyncStorage.setItem("user_clinic_id", doctor.clinicId);
        
        Alert.alert("Success! 🎉", "Your appointment has been booked.", [
          { text: "OK", onPress: () => navigation.replace("LiveTracking", { clinicId: doctor.clinicId, doctorId: doctor.id }) },
        ]);
      } else {
        Alert.alert("Error", res.data.error || "Booking failed");
      }
    } catch (error: any) {
      console.error("Booking Error:", error);
      Alert.alert("Booking Failed", error?.response?.data?.error || error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Time</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* DOCTOR SUMMARY CARD */}
        <Animatable.View animation="fadeInUp" duration={500} style={styles.docCard}>
          <View style={styles.docIcon}>
            <Ionicons name="medical" size={24} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.docLabel}>{doctor?.name}</Text>
            <Text style={styles.docSub}>{doctor?.specialty} • Verified Surgeon</Text>
          </View>
        </Animatable.View>

        {/* DATE SELECTOR */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {dates.map((item, index) => {
            const isSelected = selectedDate === index;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateBox, isSelected && styles.dateBoxActive]}
                onPress={() => { setSelectedDate(index); setSelectedTime(null); }}
              >
                <Text style={[styles.dayText, isSelected && styles.textWhite]}>{item.day}</Text>
                <Text style={[styles.dateText, isSelected && styles.textWhite]}>{item.date}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TIME SELECTOR */}
        <Text style={styles.sectionTitle}>Morning Slots</Text>
        <View style={styles.slotGrid}>
          {slots.slice(0, 4).map((slot, index) => (
            <Animatable.View key={slot} animation="fadeIn" duration={400}>
              <TouchableOpacity
                style={[styles.slot, selectedTime === slot && styles.slotActive]}
                onPress={() => setSelectedTime(slot)}
              >
                <Text style={[styles.slotText, selectedTime === slot && styles.textWhite]}>{slot}</Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Afternoon Slots</Text>
        <View style={styles.slotGrid}>
          {slots.slice(4, 8).map((slot, index) => (
            <Animatable.View key={slot} animation="fadeIn" duration={400}>
              <TouchableOpacity
                style={[styles.slot, selectedTime === slot && styles.slotActive]}
                onPress={() => setSelectedTime(slot)}
              >
                <Text style={[styles.slotText, selectedTime === slot && styles.textWhite]}>{slot}</Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Evening Slots</Text>
        <View style={styles.slotGrid}>
          {slots.slice(8).map((slot, index) => (
            <Animatable.View key={slot} animation="fadeIn" duration={400}>
              <TouchableOpacity
                style={[styles.slot, selectedTime === slot && styles.slotActive]}
                onPress={() => setSelectedTime(slot)}
              >
                <Text style={[styles.slotText, selectedTime === slot && styles.textWhite]}>{slot}</Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Consultation Fee</Text>
          <Text style={styles.totalPrice}>₹{doctor?.price || 800}</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBook} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.bookBtnText}>Confirm & Pay ➔</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  backBtn: { padding: 8, backgroundColor: COLORS.white, borderRadius: 12 },

  docCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, margin: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  docIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center", marginRight: 16 },
  docLabel: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  docSub: { fontSize: 13, color: COLORS.subText, marginTop: 4 },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginLeft: 20, marginTop: 20, marginBottom: 12 },

  dateScroll: { paddingLeft: 20, marginBottom: 10 },
  dateBox: { width: 65, height: 75, borderRadius: 16, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  dateBoxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayText: { fontSize: 12, color: COLORS.subText, marginBottom: 4 },
  dateText: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  textWhite: { color: "#FFF" },

  slotGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 10 },
  slot: { width: 100, paddingVertical: 12, backgroundColor: COLORS.white, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  slotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotText: { fontSize: 13, fontWeight: "600", color: COLORS.text },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 24,
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
  totalLabel: { fontSize: 13, color: COLORS.subText },
  totalPrice: { fontSize: 24, fontWeight: "800", color: COLORS.text, marginTop: 4 },
  bookBtn: { backgroundColor: "#0F172A", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, minWidth: 160, alignItems: "center" },
  bookBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
