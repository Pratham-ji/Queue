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
  Platform,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// 🎨 UNICORN PALETTE
const COLORS = {
  primary: "#059669", // Emerald 600
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

  useEffect(() => {
    api.get(`/hospital/clinics/${id}`).then((res) => {
      if (res.data.success) setHospital(res.data.data);
    });
  }, [id]);

  const [startingChat, setStartingChat] = useState<string | null>(null);

  const startChat = async (doctorId: string, profile: any) => {
    setStartingChat(doctorId);
    try {
      const res = await api.post("/chat/threads/start", { doctorId });
      if (res.data.success) {
        navigation.navigate("ChatScreen", {
          threadId: res.data.data.id,
          profile,
          isActive: res.data.data.isActive,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 402) {
        alert("Insufficient credits (10 required). Please recharge your wallet.");
      } else {
        alert("Failed to start chat.");
      }
    } finally {
      setStartingChat(null);
    }
  };

  if (!hospital)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 1. IMMERSIVE HERO SECTION */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: hospital.image }} style={styles.heroImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradientOverlay}
          />

          {/* Hero Text */}
          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={styles.ratingText}>{hospital.rating}</Text>
              </View>
              <Text style={styles.reviewCount}>250+ Reviews</Text>
            </View>
            <Text style={styles.heroTitle}>{hospital.name}</Text>
            <Text style={styles.heroAddress} numberOfLines={1}>
              {hospital.address}
            </Text>
          </View>
        </View>

        {/* 2. MAIN CONTENT BODY */}
        <View style={styles.body}>
          {/* About Section */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{hospital.description}</Text>

          {/* Doctors Section */}
          <View style={styles.docHeader}>
            <Text style={styles.sectionTitle}>Available Specialists</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>

          {hospital.doctors.map((doc: any) => (
            <View
              key={doc.id}
              style={styles.doctorCard}
            >
              <Image source={{ uri: doc.image }} style={styles.docImage} />

              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docSpecialty}>{doc.specialty}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.expText}>{doc.experience} Yrs Exp</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.priceText}>₹{doc.price}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.bookBtn}
                onPress={() => navigation.navigate("Queue", { clinicId: id, clinicName: hospital.name, doctorId: doc.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.bookBtnText}>Take My Spot</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  // HERO
  heroContainer: { height: 350, width: width, position: "relative" },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },
  heroContent: { position: "absolute", bottom: 30, left: 24, right: 24 },

  badgeRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  ratingText: { color: "#FFF", fontWeight: "700", fontSize: 12, marginLeft: 4 },
  reviewCount: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 6,
    lineHeight: 34,
  },
  heroAddress: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  // BODY
  body: {
    marginTop: -20,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 500,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSub,
    lineHeight: 24,
    marginBottom: 32,
  },

  // DOCTORS
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },

  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  docImage: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  docInfo: { flex: 1, marginLeft: 16 },
  docName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  docSpecialty: { fontSize: 13, color: COLORS.textSub, fontWeight: "500" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  expText: { fontSize: 12, color: COLORS.textSub },
  dot: { marginHorizontal: 6, color: "#CBD5E1" },
  priceText: { fontSize: 12, color: COLORS.primary, fontWeight: "700" },

  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  bookBtnText: { color: "#FFF", fontWeight: "700", fontSize: 12 },

  // Floating Join Queue Button
  floatingBtnContainer: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
  },
  joinQueueBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  joinQueueText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
