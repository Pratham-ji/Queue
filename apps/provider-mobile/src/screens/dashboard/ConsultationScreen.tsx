import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../theme";
import { useQueueStore } from "../../store/queueStore";

export default function ConsultationScreen({ navigation }: any) {
  const { currentPatient, callNextPatient, activeClinicId } = useQueueStore();
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(0);
  
  // Prescription State
  const [medicines, setMedicines] = useState<{name: string, dosage: string, duration: string}[]>([]);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", duration: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleComplete = () => {
    Alert.alert(
      "Complete Session?",
      "This will send the prescription to the pharmacy and call the next patient.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              if (medicines.length > 0) {
                const { api } = require("../../services/api");
                const AsyncStorage = require("@react-native-async-storage/async-storage").default;
                const token = await AsyncStorage.getItem("access_token");
                await api.post("/prescription/create", {
                  medicines,
                  notes,
                  patientId: currentPatient?.id,
                  clinicId: activeClinicId
                }, {
                  headers: { Authorization: `Bearer ${token}` }
                });
              }
              await callNextPatient();
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to submit prescription");
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  if (!currentPatient) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 1. WORKSPACE HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-down" size={24} color="#64748B" />
        </TouchableOpacity>

        <View style={styles.timerPill}>
          <View style={styles.recordDot} />
          <Text style={styles.timerText}>{formatTime(duration)}</Text>
        </View>

        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. PATIENT CARD */}
          <View style={styles.patientCard}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.pName}>{currentPatient.name}</Text>
                <Text style={styles.pInfo}>Male • 28 Years</Text>
              </View>
              <View style={styles.tokenBox}>
                <Text style={styles.tokenLabel}>TOKEN</Text>
                <Text style={styles.tokenVal}>{currentPatient.token}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* MOCK VITALS */}
            <View style={styles.vitalsGrid}>
              <View style={styles.vitalItem}>
                <Text style={styles.vitalLabel}>Heart Rate</Text>
                <Text style={styles.vitalVal}>
                  72 <Text style={styles.unit}>bpm</Text>
                </Text>
              </View>
              <View style={styles.vDivider} />
              <View style={styles.vitalItem}>
                <Text style={styles.vitalLabel}>Blood Pressure</Text>
                <Text style={styles.vitalVal}>120/80</Text>
              </View>
              <View style={styles.vDivider} />
              <View style={styles.vitalItem}>
                <Text style={styles.vitalLabel}>Temp</Text>
                <Text style={styles.vitalVal}>
                  98.6 <Text style={styles.unit}>°F</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* 3. SYMPTOMS */}
          <Text style={styles.sectionTitle}>VISIT REASON</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Patient reports mild fever and sore throat since yesterday.
              Requesting general checkup.
            </Text>
          </View>

          {/* 4. DOCTOR NOTES */}
          <Text style={styles.sectionTitle}>CLINICAL NOTES</Text>
          <View style={[styles.inputBox, { height: 100 }]}>
            <TextInput
              style={styles.input}
              multiline
              placeholder="General observations..."
              placeholderTextColor="#94A3B8"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* 5. PRESCRIPTION BUILDER */}
          <Text style={styles.sectionTitle}>PRESCRIPTION</Text>
          
          {medicines.map((med, index) => (
            <View key={index} style={styles.medItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDetail}>{med.dosage} • {med.duration}</Text>
              </View>
              <TouchableOpacity onPress={() => setMedicines(medicines.filter((_, i) => i !== index))}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addMedBox}>
             <TextInput 
               placeholder="Medicine Name (e.g. Paracetamol)" 
               placeholderTextColor="#94A3B8"
               value={newMed.name} 
               onChangeText={t => setNewMed({...newMed, name: t})} 
               style={styles.medInput} 
             />
             <View style={{flexDirection: 'row', gap: 8}}>
               <TextInput 
                 placeholder="Dosage (e.g. 500mg)" 
                 placeholderTextColor="#94A3B8"
                 value={newMed.dosage} 
                 onChangeText={t => setNewMed({...newMed, dosage: t})} 
                 style={[styles.medInput, {flex: 1}]} 
               />
               <TextInput 
                 placeholder="Duration (e.g. 3 Days)" 
                 placeholderTextColor="#94A3B8"
                 value={newMed.duration} 
                 onChangeText={t => setNewMed({...newMed, duration: t})} 
                 style={[styles.medInput, {flex: 1}]} 
               />
             </View>
             <TouchableOpacity 
               style={[styles.addMedBtn, !newMed.name && { opacity: 0.5 }]} 
               disabled={!newMed.name}
               onPress={() => { 
                 if(newMed.name) { 
                   setMedicines([...medicines, newMed]); 
                   setNewMed({name:'', dosage:'', duration:''}) 
                 } 
               }}
             >
                <Ionicons name="add" size={18} color="#0F62FE" />
                <Text style={styles.addMedText}>Add Medicine</Text>
             </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.historyLink}>
            <Text style={styles.linkText}>View Past Medical Records</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </ScrollView>

        {/* 6. ACTION FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.holdBtn}>
            <Text style={styles.holdText}>On Hold</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.doneBtn, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleComplete}
            disabled={isSubmitting}
          >
            <Text style={styles.doneText}>{isSubmitting ? "Sending..." : "Complete Session"}</Text>
            {!isSubmitting && <Ionicons name="checkmark-circle" size={20} color="#FFF" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: { padding: 8 },
  menuBtn: { padding: 8 },

  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 8,
  },
  timerText: {
    color: "#EF4444",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  scroll: { padding: 24, paddingBottom: 100 },

  patientCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    ...SHADOWS.light,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pName: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  pInfo: { fontSize: 13, color: "#64748B", marginTop: 4 },
  tokenBox: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 8,
    borderRadius: 12,
  },
  tokenLabel: { fontSize: 10, fontWeight: "700", color: COLORS.primary },
  tokenVal: { fontSize: 24, fontWeight: "800", color: COLORS.primary },

  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 20 },

  vitalsGrid: { flexDirection: "row", justifyContent: "space-between" },
  vitalItem: { alignItems: "center", flex: 1 },
  vitalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  vitalVal: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  unit: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  vDivider: { width: 1, height: "100%", backgroundColor: "#F1F5F9" },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoBox: {
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoText: { color: "#334155", lineHeight: 22, fontSize: 14 },

  inputBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    height: 160,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  input: { flex: 1, fontSize: 16, color: "#0F172A", textAlignVertical: "top" },

  historyLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
  },
  linkText: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    gap: 16,
  },
  holdBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  holdText: { color: "#64748B", fontWeight: "700", fontSize: 15 },
  doneBtn: {
    flex: 2,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  doneText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  
  // Prescription UI
  medItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  medName: { fontSize: 16, fontWeight: "600", color: "#0F172A", marginBottom: 4 },
  medDetail: { fontSize: 13, color: "#64748B" },
  
  addMedBox: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    marginBottom: 24,
  },
  medInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 12,
  },
  addMedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  addMedText: {
    color: "#0F62FE",
    fontWeight: "600",
    fontSize: 14,
  },
});
