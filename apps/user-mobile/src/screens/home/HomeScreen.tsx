import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  Platform, // <--- Ensure Platform is imported
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import CategoryPills from "../../components/CategoryPills";
import BigHospitalCard from "../../components/BigHospitalCard";
import SearchInput from "../../components/SearchInput";
import FilterModal from "../../components/FilterModal";
import { hospitalsNearby, Hospital } from "../../services/mockData";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);

  const categoryFiltered =
    activeCategory === "All"
      ? hospitalsNearby
      : hospitalsNearby.filter((h) => h.type === activeCategory);

  const finalData = categoryFiltered.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  });

  const clearSearch = () => {
    setSearchQuery("");
    Keyboard.dismiss();
  };

  const handleFilterApply = (filters: any) => {
    setFilterVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Set translucent to false to force content below bar on Android */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <FlatList<Hospital>
            data={finalData}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <SearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Find doctors, clinics, hospitals..."
                  onClear={clearSearch}
                  onFilter={() => setFilterVisible(true)}
                  containerStyle={styles.searchContainer}
                />

                <View style={styles.pillsSection}>
                  <CategoryPills
                    categories={["All", "Hospital", "Clinic", "Diagnostics"]}
                    activeCategory={activeCategory}
                    onCategoryPress={setActiveCategory}
                  />
                </View>

                <View style={styles.titleRow}>
                  <Text style={styles.sectionTitle}>
                    {searchQuery.length > 0
                      ? `Results for "${searchQuery}"`
                      : activeCategory === "All"
                        ? "Nearby Healthcare"
                        : `Nearby ${activeCategory}s`}
                  </Text>
                  <Text style={styles.resultCount}>
                    {finalData.length} found
                  </Text>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <BigHospitalCard
                name={item.name}
                rating={item.rating}
                time={item.time}
                location={item.location}
                type={item.type}
                status={item.status}
                image={item.image}
                onPress={() =>
                  navigation.navigate("HospitalDetails", { id: item.id })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySub}>Try adjusting your search.</Text>
              </View>
            }
          />

          <FilterModal
            visible={filterVisible}
            onClose={() => setFilterVisible(false)}
            onApply={handleFilterApply}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    // ANDROID FIX: Ensures the top bar is definitely below the notch
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingTop: 10,
    marginBottom: 10,
  },
  searchContainer: {
    marginBottom: 16,
    marginTop: 4,
  },
  pillsSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.5,
  },
  resultCount: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
