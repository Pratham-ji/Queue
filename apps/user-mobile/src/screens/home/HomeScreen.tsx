import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl, // 👈 Added
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../services/api";

const COLORS = {
  primary: "#047857", // Emerald Green
  bg: "#F8FAFC",
  text: "#1E293B",
  subText: "#64748B",
  white: "#FFFFFF",
  border: "#E2E8F0",
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. FETCH DATA (With Cache Busting)
  const fetchData = async () => {
    try {
      console.log("📡 Fetching Home Data...");

      // 🦄 FIX: Add timestamp to force fresh data (prevents 304 caching issues)
      const time = new Date().getTime();

      const [clinicRes, doctorRes] = await Promise.all([
        api.get(`/hospital/clinics?t=${time}`),
        api.get(`/hospital/doctors?t=${time}`),
      ]);

      if (clinicRes.data.success) {
        setClinics(clinicRes.data.data);
      }

      if (doctorRes.data.success) {
        setDoctors(doctorRes.data.data);
      }
    } catch (error) {
      console.error("❌ Failed to load home data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. INITIAL LOAD
  useEffect(() => {
    fetchData();
  }, []);

  // 3. PULL TO REFRESH HANDLER
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // RENDER HELPERS
  const renderClinic = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.clinicCard}
      onPress={() => navigation.navigate("HospitalDetails", { id: item.id })}
    >
      <Image
        source={{
          uri:
            item.image ||
            "https://images.unsplash.com/photo-1538108149393-fbbd81897560?w=500&auto=format&fit=crop&q=60",
        }}
        style={styles.clinicImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.cardGradient}
      />
      <View style={styles.clinicOverlay}>
        <Text style={styles.clinicName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.clinicAddr} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.ratingTag}>
          <Ionicons name="star" size={10} color="#FFF" />
          <Text style={styles.ratingNum}>{item.rating || "4.8"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDoctor = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.docCard}
      onPress={() => navigation.navigate("Booking", { doctorId: item.id })}
    >
      <View style={styles.docImgWrap}>
        <Image
          source={{
            uri: item.image || `https://i.pravatar.cc/150?u=${item.id}`,
          }}
          style={styles.docImage}
        />
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark" size={10} color="#FFF" />
        </View>
      </View>
      <Text style={styles.docName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.docSpec}>{item.specialty || "Specialist"}</Text>
      <View style={styles.priceTag}>
        <Text style={styles.priceText}>₹{item.price || "500"}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Patient 👋</Text>
          <Text style={styles.title}>Find your doctor</Text>
        </View>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?u=user" }}
          style={styles.userAvatar}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* BANNER */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Skip the Queue!</Text>
            <Text style={styles.bannerSub}>Book online & save time.</Text>
            <TouchableOpacity style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Check Queue Status</Text>
            </TouchableOpacity>
          </View>
          <Ionicons
            name="time"
            size={80}
            color="rgba(255,255,255,0.2)"
            style={{ position: "absolute", right: -10, bottom: -10 }}
          />
        </View>

        {/* HOSPITALS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={clinics}
          renderItem={renderClinic}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          // 🦄 FIX: Show something if list is empty
          ListEmptyComponent={
            <Text
              style={{
                marginLeft: 20,
                color: COLORS.subText,
                fontStyle: "italic",
              }}
            >
              No clinics found nearby.
            </Text>
          }
        />

        {/* TOP DOCTORS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Doctors</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={doctors}
          renderItem={renderDoctor}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          ListEmptyComponent={
            <Text
              style={{
                color: COLORS.subText,
                fontStyle: "italic",
              }}
            >
              No doctors available.
            </Text>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: COLORS.subText },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#E2E8F0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.text },
  filterBtn: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    flexDirection: "row",
    overflow: "hidden",
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  bannerSub: { fontSize: 14, color: "#D1FAE5", marginBottom: 16 },
  bannerBtn: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  bannerBtnText: { color: COLORS.primary, fontWeight: "700", fontSize: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  seeAll: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },
  clinicCard: {
    width: 260,
    height: 180,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    marginRight: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 10,
  },
  clinicImage: { width: "100%", height: "100%" },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  clinicOverlay: { position: "absolute", bottom: 12, left: 12, right: 12 },
  clinicName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 2,
  },
  clinicAddr: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 6 },
  ratingTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingNum: { color: "#FFF", fontSize: 10, fontWeight: "700", marginLeft: 4 },
  docCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  docImgWrap: { position: "relative", marginBottom: 10 },
  docImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F1F5F9",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  docName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 2,
  },
  docSpec: {
    fontSize: 11,
    color: COLORS.subText,
    textAlign: "center",
    marginBottom: 8,
  },
  priceTag: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: { fontSize: 10, fontWeight: "700", color: COLORS.primary },
});
