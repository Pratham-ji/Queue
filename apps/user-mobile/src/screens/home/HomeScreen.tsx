import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../services/api";
import NetInfo from "@react-native-community/netinfo";
import { useUserQueueStore } from "../../store/userQueueStore";
import { colors, shadows } from "../../theme";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOffline, setOfflineStatus } = useUserQueueStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOfflineStatus(!state.isConnected);
    });

    const fetchData = async () => {
      try {
        const clinicRes = await api.get("/hospital/clinics");
        if (clinicRes.data.success) {
          setClinics(clinicRes.data.data);
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => unsubscribe();
  }, []);

  const handleClinicTap = (clinicId: string, clinicName: string) => {
    if (isOffline) {
      alert("You are offline. Reconnecting...");
      return;
    }
    navigation.navigate("HospitalDetails", { id: clinicId, clinicName });
  };

  const renderClinicCard = (clinic: any) => {
    // Generate fake metrics for UI
    const queueCount = clinic._count?.patients || Math.floor(Math.random() * 10);
    const estWait = queueCount * 5;
    const doctorsCount = clinic.doctors?.length || 2;

    return (
      <TouchableOpacity
        key={clinic.id}
        activeOpacity={0.9}
        style={styles.clinicCard}
        onPress={() => handleClinicTap(clinic.id, clinic.name)}
      >
        <Image 
          source={{ uri: clinic.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop" }} 
          style={styles.clinicImage} 
        />
        
        <View style={styles.clinicInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.clinicName} numberOfLines={1}>{clinic.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{clinic.rating || "4.9"}</Text>
              <Ionicons name="star" size={10} color="#FFF" />
            </View>
          </View>
          
          <Text style={styles.clinicAddress} numberOfLines={1}>
            {clinic.address}, {clinic.city}
          </Text>

          <View style={styles.badgeRow}>
            {clinic.isEmergencyPause ? (
              <View style={[styles.badge, clinic.emergencyMessage === 'EMERGENCY' ? { backgroundColor: "#FEF2F2", borderColor: "#FECACA" } : { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
                <View style={[styles.dot, clinic.emergencyMessage === 'EMERGENCY' ? { backgroundColor: "#EF4444" } : { backgroundColor: "#F59E0B" }]} />
                <Text style={[styles.badgeText, clinic.emergencyMessage === 'EMERGENCY' ? { color: "#B91C1C" } : { color: "#92400E" }]}>
                  {clinic.emergencyMessage === 'EMERGENCY' ? "Paused (Emergency)" : "Paused (Doctor on Break)"}
                </Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>Live ({queueCount} in queue)</Text>
              </View>
            )}
            
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⏱️ ~{estWait} mins</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.doctorCount}>👨‍⚕️ {doctorsCount} Doctors Available</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // SKELETON LOADER
  const renderSkeletonCard = () => (
    <View style={[styles.clinicCard, { opacity: 0.7 }]} key={Math.random()}>
      <View style={[styles.clinicImage, { backgroundColor: colors.divider }]} />
      <View style={styles.clinicInfo}>
        <View style={{ width: "60%", height: 24, backgroundColor: colors.divider, borderRadius: 4, marginBottom: 8 }} />
        <View style={{ width: "80%", height: 16, backgroundColor: colors.divider, borderRadius: 4, marginBottom: 16 }} />
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <View style={{ width: 80, height: 24, backgroundColor: colors.divider, borderRadius: 8 }} />
          <View style={{ width: 60, height: 24, backgroundColor: colors.divider, borderRadius: 8 }} />
        </View>
        <View style={{ width: "100%", height: 20, backgroundColor: colors.divider, borderRadius: 4 }} />
      </View>
    </View>
  );

  const currentHour = new Date().getHours();
  let greeting = "Good Morning 🌅";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good Afternoon ☀️";
  } else if (currentHour >= 17) {
    greeting = "Good Evening 🌙";
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.title}>Find Care Near You</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/150?u=user" }}
            style={styles.userAvatar}
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          placeholder="Search hospitals, doctors..."
          style={styles.searchInput}
          placeholderTextColor={colors.textMuted}
        />
        <View style={styles.filterBtn}>
          <Ionicons name="options" size={20} color="#FFF" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
      >
        <Text style={styles.sectionTitle}>Recommended Clinics</Text>

        <View style={styles.listContainer}>
          {loading ? (
            <>
              {renderSkeletonCard()}
              {renderSkeletonCard()}
              {renderSkeletonCard()}
            </>
          ) : clinics.length > 0 ? (
            clinics.map((clinic) => renderClinicCard(clinic))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={48} color={colors.divider} />
              <Text style={styles.emptyText}>No clinics available yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 24,
    ...shadows.soft,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: colors.textPrimary },
  filterBtn: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: colors.textPrimary, 
    marginBottom: 16 
  },
  listContainer: {
    gap: 16,
  },
  
  // ZOMATO STYLE HORIZONTAL CARDS
  clinicCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.card,
  },
  clinicImage: {
    width: "100%",
    height: 140,
    backgroundColor: colors.divider,
  },
  clinicInfo: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  clinicName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  clinicAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  doctorCount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  emptyState: {
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 16,
  }
});
