import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

// 🎨 PREMIUM PALETTE
const COLORS = {
  primary: "#10B981",
  dark: "#064E3B",
  bg: "#FFFFFF",
  text: "#1E293B",
  subText: "#64748B",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  star: "#F59E0B",
};

export default function HospitalDetailsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 🖼️ HERO SECTION */}
      <View style={styles.heroContainer}>
        <Image
          source={{
            uri: "https://img.freepik.com/free-photo/blur-hospital_1203-7972.jpg",
          }}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradientOverlay}
        />

        {/* BACK BUTTON */}
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 10 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* HERO CONTENT */}
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          style={styles.heroContent}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PREMIUM CLINIC</Text>
          </View>
          <Text style={styles.heroTitle}>Dr. Trafalgar Law</Text>
          <Text style={styles.heroSub}>Heart & Surgery Specialist</Text>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={COLORS.star} />
            <Text style={styles.ratingText}>4.9 (2.4k Reviews)</Text>
            <View style={styles.dot} />
            <Text style={styles.locationText}>Ballupur, Dehradun</Text>
          </View>
        </Animatable.View>
      </View>

      {/* 📄 CONTENT BODY */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* QUICK STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="time" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.statLabel}>Open 24/7</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="location" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.statLabel}>0.8 km</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.iconBox, { backgroundColor: "#FEF2F2" }]}>
              <Ionicons name="call" size={22} color="#EF4444" />
            </View>
            <Text style={styles.statLabel}>Contact</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ABOUT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Clinic</Text>
          <Text style={styles.sectionText}>
            Led by Dr. Trafalgar Law, this clinic specializes in advanced
            cardiac surgery and emergency care. We utilize the "Ope Ope" smart
            queue technology to ensure zero waiting time for our premium
            patients.
          </Text>
        </View>

        {/* SERVICES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Services</Text>
          <View style={styles.tagsContainer}>
            {[
              "Cardiology",
              "Neurology",
              "General Surgery",
              "Pediatrics",
              "MRI Scan",
            ].map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 🟢 DUAL ACTION BOTTOM BAR */}
      <Animatable.View
        animation="slideInUp"
        duration={600}
        style={styles.bottomBar}
      >
        {/* 1. BOOK APPOINTMENT (Secondary) */}
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate("Booking", { doctorId: "123" })}
        >
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.bookBtnText}>Book Slot</Text>
        </TouchableOpacity>

        {/* 2. JOIN QUEUE (Primary) */}
        <TouchableOpacity
          style={styles.queueBtn}
          onPress={() => navigation.navigate("Queue")}
        >
          <Text style={styles.queueBtnText}>Join Queue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  heroContainer: { height: height * 0.45, width: "100%", position: "relative" },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },

  backBtn: {
    position: "absolute",
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: 10,
  },

  heroContent: { position: "absolute", bottom: 40, left: 24, right: 24 },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroTitle: { fontSize: 32, fontWeight: "800", color: "#FFF", lineHeight: 38 },
  heroSub: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontWeight: "500",
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  ratingText: { color: "#FFF", fontWeight: "700", marginLeft: 6, fontSize: 14 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF",
    marginHorizontal: 10,
  },
  locationText: { color: "rgba(255,255,255,0.9)", fontSize: 14 },

  scrollView: {
    flex: 1,
    marginTop: -24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: COLORS.bg,
  },
  scrollContent: { padding: 24, paddingTop: 32 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: { alignItems: "center", width: "30%" },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: { fontSize: 13, fontWeight: "600", color: COLORS.text },

  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 24 },

  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionText: { fontSize: 15, lineHeight: 24, color: COLORS.subText },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: { color: COLORS.subText, fontWeight: "600", fontSize: 13 },

  // BOTTOM BAR
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },

  // BOOK BUTTON (Secondary)
  bookBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#ECFDF5", // Light Green
  },
  bookBtnText: { color: COLORS.primary, fontWeight: "700", fontSize: 16 },

  // QUEUE BUTTON (Primary)
  queueBtn: {
    flex: 1.5, // 60% Width
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  queueBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
