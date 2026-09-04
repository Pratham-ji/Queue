import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#059669",
  dark: "#064E3B",
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  textMain: "#0F172A",
  textSub: "#64748B",
  accent: "#F59E0B",
};

export default function HospitalDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const [hospital, setHospital] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"doctors" | "about">("doctors");

  useEffect(() => {
    api.get(`/hospital/clinics/${id}`).then((res) => {
      if (res.data.success) setHospital(res.data.data);
    }).catch((err) => console.log(err));
  }, [id]);

  if (!hospital) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const estWaitTime = hospital._count?.patients ? hospital._count.patients * 5 : 15;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* HERO IMAGE */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: hospital.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop" }} style={styles.heroImage} />
          
          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="share-outline" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="heart-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CLINIC INFO CARD (Overlapping) */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.clinicName}>{hospital.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={styles.ratingText}>{hospital.rating || "4.8"}</Text>
            </View>
          </View>
          
          <Text style={styles.clinicAddress} numberOfLines={1}>{hospital.address}, {hospital.city}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>2.5 km away</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>Open 24/7</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.outlineBtn}>
              <Ionicons name="call-outline" size={18} color={COLORS.textMain} />
              <Text style={styles.outlineBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn}>
              <Ionicons name="navigate-outline" size={18} color={COLORS.textMain} />
              <Text style={styles.outlineBtnText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TABBED ROSTER */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === "doctors" && styles.activeTab]} onPress={() => setActiveTab("doctors")}>
            <Text style={[styles.tabText, activeTab === "doctors" && styles.activeTabText]}>Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === "about" && styles.activeTab]} onPress={() => setActiveTab("about")}>
            <Text style={[styles.tabText, activeTab === "about" && styles.activeTabText]}>About</Text>
          </TouchableOpacity>
        </View>

        {/* TAB CONTENT */}
        <View style={styles.tabContent}>
          {activeTab === "doctors" ? (
            hospital.doctors?.length > 0 ? (
              hospital.doctors.map((doc: any) => (
                <View key={doc.id} style={styles.doctorCard}>
                  <Image source={{ uri: doc.image || "https://i.pravatar.cc/150?u="+doc.id }} style={styles.docAvatar} />
                  <View style={styles.docInfo}>
                    <Text style={styles.docName}>{doc.name}</Text>
                    <Text style={styles.docSpecialty}>{doc.specialty}</Text>
                    <Text style={styles.docExp}>{doc.experience || 10} Yrs Experience</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.bookBtn}
                    onPress={() => navigation.navigate("Booking", { doctorId: doc.id })}
                  >
                    <Text style={styles.bookBtnText}>Book Visit</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No doctors available at this time.</Text>
            )
          ) : (
            <Text style={styles.aboutText}>{hospital.description || "Premium healthcare facility providing 24/7 services."}</Text>
          )}
        </View>
      </ScrollView>

      {/* STICKY FOOTER */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity 
          style={styles.footerBtn}
          onPress={() => navigation.navigate("LiveTracking", { clinicId: id, clinicName: hospital.name })}
        >
          <Text style={styles.footerBtnText}>Join General Queue</Text>
          <Text style={styles.footerBtnSubText}>Est. Wait: {estWaitTime} mins</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  heroContainer: { height: 300, width: "100%", position: "relative" },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  headerControls: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: { flexDirection: "row", gap: 12 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    marginTop: -40,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  infoCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  clinicName: { fontSize: 22, fontWeight: "800", color: COLORS.textMain, flex: 1 },
  ratingBadge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { color: "#FFF", fontWeight: "700", marginLeft: 4, fontSize: 14 },
  clinicAddress: { fontSize: 14, color: COLORS.textSub, marginBottom: 16 },
  
  metaRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13, color: COLORS.textMain, fontWeight: "600" },

  actionRow: { flexDirection: "row", gap: 12 },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  outlineBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.textMain },

  tabsContainer: { flexDirection: "row", paddingHorizontal: 24, marginTop: 24, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  tab: { paddingVertical: 12, marginRight: 24, borderBottomWidth: 2, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 16, fontWeight: "600", color: COLORS.textSub },
  activeTabText: { color: COLORS.primary },

  tabContent: { padding: 24 },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  docAvatar: { width: 60, height: 60, borderRadius: 12, backgroundColor: "#E2E8F0" },
  docInfo: { flex: 1, marginLeft: 12 },
  docName: { fontSize: 16, fontWeight: "700", color: COLORS.textMain, marginBottom: 2 },
  docSpecialty: { fontSize: 13, color: COLORS.primary, fontWeight: "600", marginBottom: 4 },
  docExp: { fontSize: 12, color: COLORS.textSub },
  
  bookBtn: { backgroundColor: "#0F172A", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  bookBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  
  aboutText: { fontSize: 15, lineHeight: 24, color: COLORS.textSub },
  emptyText: { fontSize: 15, color: COLORS.textSub, textAlign: "center", marginTop: 20 },

  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  footerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  footerBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  footerBtnSubText: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "500" },
});
