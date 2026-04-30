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
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 16;
const BENTO_PADDING = 20;
const HALF_WIDTH = (width - BENTO_PADDING * 2 - CARD_MARGIN) / 2;

const COLORS = {
  primary: "#10B981", // Emerald 500
  primaryDark: "#047857", // Emerald 700
  bg: "#0F172A", // Slate 900 - Premium Dark Mode
  surface: "#1E293B", // Slate 800
  text: "#F8FAFC",
  subText: "#94A3B8",
  white: "#FFFFFF",
  border: "#334155",
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clinicRes = await api.get("/hospital/clinics");
        if (clinicRes.data.success) {
          // Sort by rating or default logic
          const fetched = clinicRes.data.data;
          setClinics(fetched);
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickJoin = (clinicId: string) => {
    // Pass the specific clinicId directly to the Queue Screen for instant joining
    navigation.navigate("Queue", { clinicId });
  };

  const handleClinicTap = (clinicId: string) => {
    navigation.navigate("HospitalDetails", { id: clinicId });
  };

  const renderHeroCard = (clinic: any) => {
    if (!clinic) return null;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.heroCard}
        onPress={() => handleClinicTap(clinic.id)}
      >
        <Image source={{ uri: clinic.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop" }} style={styles.heroImage} />
        <LinearGradient
          colors={["transparent", "rgba(15, 23, 42, 0.95)"]}
          style={styles.heroGradient}
        />
        
        <View style={styles.heroContent}>
          <View style={styles.heroTopRow}>
            <View style={styles.glassBadge}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.badgeText}>{clinic.rating || "4.9"}</Text>
            </View>
            <View style={[styles.glassBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="flash" size={12} color={COLORS.primary} />
              <Text style={[styles.badgeText, { color: COLORS.primary }]}>Fast Track</Text>
            </View>
          </View>
          
          <Text style={styles.heroTitle} numberOfLines={1}>{clinic.name}</Text>
          <Text style={styles.heroSub} numberOfLines={1}>
            <Ionicons name="location" size={12} /> {clinic.address}, {clinic.city}
          </Text>

          <TouchableOpacity 
            style={styles.quickJoinBtn}
            onPress={() => handleQuickJoin(clinic.id)}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{x:0, y:0}} end={{x:1, y:1}}
              style={styles.quickJoinGradient}
            >
              <Text style={styles.quickJoinText}>Join Queue Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSubCard = (clinic: any, index: number) => {
    return (
      <TouchableOpacity
        key={clinic.id}
        activeOpacity={0.9}
        style={[
          styles.subCard,
          { marginRight: index % 2 === 0 ? CARD_MARGIN : 0 }
        ]}
        onPress={() => handleClinicTap(clinic.id)}
      >
        <Image source={{ uri: clinic.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop" }} style={styles.subImage} />
        <LinearGradient
          colors={["transparent", "rgba(15, 23, 42, 0.9)"]}
          style={styles.subGradient}
        />
        <View style={styles.subContent}>
          <View style={styles.glassBadgeSmall}>
            <Ionicons name="star" size={10} color="#FBBF24" />
            <Text style={styles.badgeTextSmall}>{clinic.rating || "4.8"}</Text>
          </View>
          <Text style={styles.subTitle} numberOfLines={1}>{clinic.name}</Text>
          <Text style={styles.subSub} numberOfLines={1}>{clinic.city}</Text>
          
          <TouchableOpacity 
            style={styles.subQuickBtn}
            onPress={() => handleQuickJoin(clinic.id)}
          >
            <Text style={styles.subQuickText}>Join</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.title}>Find Care Near You</Text>
        </View>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?u=user" }}
          style={styles.userAvatar}
        />
      </View>

      {/* SEARCH BAR (Glassmorphic) */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.subText} />
        <TextInput
          placeholder="Search hospitals, doctors..."
          style={styles.searchInput}
          placeholderTextColor={COLORS.subText}
        />
        <View style={styles.filterBtn}>
          <Ionicons name="options" size={20} color="#FFF" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Marketplace</Text>
        </View>

        {/* BENTO GRID LAYOUT */}
        <View style={styles.bentoGrid}>
          {clinics.length > 0 && renderHeroCard(clinics[0])}
          
          <View style={styles.subGrid}>
            {clinics.slice(1).map((clinic, idx) => renderSubCard(clinic, idx))}
          </View>
        </View>

        {/* EMPTY STATE HANDLING */}
        {clinics.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No clinics available yet.</Text>
          </View>
        )}

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
    paddingHorizontal: BENTO_PADDING,
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: COLORS.subText, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text, letterSpacing: -0.5 },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginHorizontal: BENTO_PADDING,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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

  sectionHeader: {
    paddingHorizontal: BENTO_PADDING,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, letterSpacing: 0.5 },

  bentoGrid: {
    paddingHorizontal: BENTO_PADDING,
  },
  
  // HERO CARD (SPAN 2)
  heroCard: {
    width: "100%",
    height: 280,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: CARD_MARGIN,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroImage: { width: "100%", height: "100%", position: "absolute" },
  heroGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "80%" },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroTopRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  glassBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#FFF", marginBottom: 4 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 16 },
  
  quickJoinBtn: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
  },
  quickJoinGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickJoinText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  // SUB CARDS (SPAN 1)
  subGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  subCard: {
    width: HALF_WIDTH,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: CARD_MARGIN,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subImage: { width: "100%", height: "100%", position: "absolute" },
  subGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "70%" },
  subContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  glassBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
    marginBottom: 8,
  },
  badgeTextSmall: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  subTitle: { fontSize: 15, fontWeight: "700", color: "#FFF", marginBottom: 2 },
  subSub: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 12 },
  
  subQuickBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  subQuickText: { color: "#FFF", fontWeight: "600", fontSize: 13 },

  emptyState: {
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.subText,
    fontSize: 16,
  }
});
