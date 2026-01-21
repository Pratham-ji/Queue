import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useQueueStore } from "../../store/queueStore";
import { COLORS, SHADOWS } from "../../theme";

export default function PatientListScreen({ navigation }: any) {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");

  // CONNECT TO STORE
  const { queue } = useQueueStore(); // You might need to add an 'addPatient' action to your store later

  const filteredQueue = queue.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.token.toString().includes(search),
  );

  const renderItem = ({ item, index }: any) => (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      delay={index * 50}
      style={styles.card}
    >
      <View style={styles.cardLeft}>
        <View style={styles.tokenBox}>
          <Text style={styles.tokenText}>{item.token}</Text>
        </View>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.issue}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Queue ({queue.length})</Text>

        {/* ADD WALK-IN BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#94A3B8"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search by name or token..."
          style={styles.searchInput}
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* LIST */}
      <FlatList
        data={filteredQueue}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyText}>No patients in queue</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyLink}>+ Add Walk-in Patient</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* MOCK MODAL FOR ADDING PATIENT */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Walk-in Patient</Text>
            <TextInput
              placeholder="Patient Name"
              style={styles.modalInput}
              value={newPatientName}
              onChangeText={setNewPatientName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={() => {
                  setModalVisible(false);
                  alert(`Added ${newPatientName} to queue!`); // Mock action
                  setNewPatientName("");
                }}
              >
                <Text style={styles.confirmText}>Add to Queue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#0F172A", height: "100%" },

  listContent: { paddingHorizontal: 24, paddingBottom: 100 },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  tokenBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  tokenText: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  name: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  issue: { fontSize: 12, color: "#64748B", marginTop: 2 },
  statusBadge: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: "700", color: "#C2410C" },

  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyText: {
    marginTop: 16,
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyLink: { marginTop: 8, color: COLORS.primary, fontWeight: "700" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#F1F5F9" },
  confirmBtn: { backgroundColor: COLORS.primary },
  cancelText: { fontWeight: "700", color: "#64748B" },
  confirmText: { fontWeight: "700", color: "#FFF" },
});
