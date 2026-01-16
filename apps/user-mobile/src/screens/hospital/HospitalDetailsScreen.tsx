import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { DoctorCard } from "../../components/DoctorCard";

// Mock Data for this screen
// Replace the DOCTORS constant at the top
const DOCTORS = [
  {
    id: "1",
    name: "Dr. Tony Tony Chopper",
    specialty: "Chief of Medicine",
    experience: "5 years",
    nextSlot: "Today, 4:00 PM",
    image:
      "https://i.pinimg.com/736x/25/67/6c/25676c66c7f502d93e7c84c7946892fa.jpg",
  },
  {
    id: "2",
    name: "Dr. Tsunade Senju",
    specialty: "Legendary Sannin / Surgeon",
    experience: "35 years",
    nextSlot: "Today, 5:30 PM",
    image:
      "https://wallpapers.com/images/hd/tsunade-pfp-1075-x-1065-n4h3165355604116.jpg",
  },
  {
    id: "3",
    name: "Dr. Kenzo Tenma",
    specialty: "Neurosurgeon",
    experience: "15 years",
    nextSlot: "Tomorrow, 10:00 AM",
    image:
      "https://i.pinimg.com/originals/a0/6d/21/a06d213459c77e62a40498a72e8e08d6.jpg",
  },
];

export default function HospitalDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {}; // Get ID passed from Home

  const [activeTab, setActiveTab] = useState<"Doctors" | "About">("Doctors");

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
        {/* 1. Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.overlay} />

          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { marginLeft: 12 }]}>
                <Ionicons name="heart-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. Hospital Info Card (Overlapping) */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>
              Synergy Institute of Medical Sciences
            </Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#047857" />
            </View>
          </View>

          <Text style={styles.address}>Ballupur, Dehradun • 2.5 km away</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.statText}>4.8 (1.2k+)</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color="#047857" />
              <Text style={styles.statText}>Open 24/7</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call-outline" size={20} color="#047857" />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionBtn}>
              <Ionicons name="navigate" size={20} color="#FFF" />
              <Text style={styles.dirBtnText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Tabs (Doctors vs About) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Doctors" && styles.activeTab]}
            onPress={() => setActiveTab("Doctors")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Doctors" && styles.activeTabText,
              ]}
            >
              Doctors
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "About" && styles.activeTab]}
            onPress={() => setActiveTab("About")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "About" && styles.activeTabText,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Content List */}
        <View style={styles.contentSection}>
          {activeTab === "Doctors" ? (
            <View>
              <Text style={styles.sectionHeader}>Available Specialists</Text>
              {DOCTORS.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  {...doctor}
                  onBookPress={() =>
                    navigation.navigate("Booking", { doctorId: doctor.id })
                  }
                />
              ))}
            </View>
          ) : (
            <View style={styles.aboutContainer}>
              <Text style={styles.aboutText}>
                Synergy Institute is one of Dehradun's premier multi-specialty
                hospitals. Equipped with state-of-the-art ICU, MRI labs, and
                24/7 emergency trauma care.
              </Text>
              <Text style={styles.sectionHeader}>Facilities</Text>
              <View style={styles.facilityRow}>
                {["Parking", "Pharmacy", "Cafeteria", "Wi-Fi"].map((f) => (
                  <View key={f} style={styles.facilityChip}>
                    <Text style={styles.facilityText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Button (Quick Queue) */}
      <View style={styles.bottomFloater}>
        <TouchableOpacity style={styles.queueBtn}>
          <Text style={styles.queueBtnTitle}>Join General Queue</Text>
          <Text style={styles.queueBtnSub}>Wait time: ~20 mins</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  // Hero Image
  imageContainer: {
    height: 250,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)", // Darken image slightly
  },
  headerActions: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  rightIcons: {
    flexDirection: "row",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Info Card
  infoCard: {
    marginTop: -40, // Overlap effect
    marginHorizontal: 20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },
  verifiedBadge: {
    marginTop: 4,
  },
  address: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 12,
  },

  // Action Buttons
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    paddingVertical: 12,
    borderRadius: 12,
  },
  callBtnText: {
    color: "#047857",
    fontWeight: "600",
    marginLeft: 8,
  },
  directionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827", // Black
    paddingVertical: 12,
    borderRadius: 12,
  },
  dirBtnText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 8,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#047857",
  },
  tabText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#047857",
    fontWeight: "700",
  },

  // Content
  contentSection: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111",
  },
  aboutContainer: {
    paddingTop: 4,
  },
  aboutText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 24,
  },
  facilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  facilityChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  facilityText: {
    color: "#374151",
    fontSize: 13,
  },

  // Floating Bottom
  bottomFloater: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  queueBtn: {
    backgroundColor: "#047857",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  queueBtnTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  queueBtnSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
});
