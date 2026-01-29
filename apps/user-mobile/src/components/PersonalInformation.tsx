import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardTypeOptions, // Correct type import
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#6B7280",
  bg: "#F3F4F6",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  danger: "#EF4444",
};

interface PersonalInformationProps {
  onClose?: () => void;
}

export default function PersonalInformation({ onClose }: PersonalInformationProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Local state for profile data
  const [formData, setFormData] = useState({
    fullName: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 98765 43210",
    gender: "Male",
    dob: "12 May 1998",
  });

  const handleSave = () => {
    // Logic for saving data (API call or Zustand update)
    console.log("Saving data:", formData);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Personal Info</Text>

        <TouchableOpacity
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          style={isEditing ? styles.saveBtn : styles.iconBtn}
        >
          {isEditing ? (
            <Text style={styles.saveText}>Save</Text>
          ) : (
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.card}>
        <EditableInfo
          label="Full Name"
          value={formData.fullName}
          isEditing={isEditing}
          onChangeText={(txt: string) => setFormData({ ...formData, fullName: txt })}
        />
        <EditableInfo
          label="Email Address"
          value={formData.email}
          isEditing={isEditing}
          keyboardType="email-address"
          onChangeText={(txt: string) => setFormData({ ...formData, email: txt })}
        />
        <EditableInfo
          label="Phone Number"
          value={formData.phone}
          isEditing={isEditing}
          keyboardType="phone-pad"
          onChangeText={(txt: string) => setFormData({ ...formData, phone: txt })}
        />
        <EditableInfo
          label="Gender"
          value={formData.gender}
          isEditing={isEditing}
          onChangeText={(txt: string) => setFormData({ ...formData, gender: txt })}
        />
        <EditableInfo
          label="Date of Birth"
          value={formData.dob}
          isEditing={isEditing}
          onChangeText={(txt: string) => setFormData({ ...formData, dob: txt })}
        />

        {isEditing && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.cancelText}>Discard Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// Internal reusable row with corrected TypeScript Props
interface EditableInfoProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions; // Fixed from 'string' to 'KeyboardTypeOptions'
}

const EditableInfo = ({
  label,
  value,
  isEditing,
  onChangeText,
  keyboardType = "default",
}: EditableInfoProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    {isEditing ? (
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoFocus={label === "Full Name"}
        selectionColor={COLORS.primary}
        underlineColorAndroid="transparent"
      />
    ) : (
      <Text style={styles.value}>{value}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  iconBtn: {
    padding: 8,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    paddingBottom: 10,
  },
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 12,
    color: COLORS.subText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    marginTop: 6,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    marginTop: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },
  cancelBtn: {
    marginTop: 20,
    alignSelf: "center",
    padding: 10,
  },
  cancelText: {
    color: COLORS.danger,
    fontWeight: "600",
  },
});