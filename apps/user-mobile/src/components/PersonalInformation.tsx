import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardTypeOptions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/* 🩺 Medical / Hospital Colors */
const COLORS = {
  primary: "#0F766E",
  lightGreen: "#E7F5F2",
  text: "#0F172A",
  subText: "#6B7280",
  bg: "#F1F5F9",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  danger: "#DC2626",
};

interface PersonalInformationProps {
  onClose?: () => void;
}

export default function PersonalInformation({
  onClose,
}: PersonalInformationProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 98765 43210",
    gender: "Male",
    dob: "12 May 1998",
  });

  const handleSave = () => {
    console.log("Saving data:", formData);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* FULL SCREEN CURVED PAGE */}
      <View style={styles.curvedContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Personal Information</Text>

          <TouchableOpacity
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
            style={isEditing ? styles.saveBtn : styles.iconBtn}
          >
            {isEditing ? (
              <Text style={styles.saveText}>Save</Text>
            ) : (
              <Ionicons
                name="create-outline"
                size={22}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <EditableInfo
              label="Full Name"
              value={formData.fullName}
              isEditing={isEditing}
              onChangeText={(txt) =>
                setFormData({ ...formData, fullName: txt })
              }
            />

            <EditableInfo
              label="Email Address"
              value={formData.email}
              isEditing={isEditing}
              keyboardType="email-address"
              onChangeText={(txt) =>
                setFormData({ ...formData, email: txt })
              }
            />

            <EditableInfo
              label="Phone Number"
              value={formData.phone}
              isEditing={isEditing}
              keyboardType="phone-pad"
              onChangeText={(txt) =>
                setFormData({ ...formData, phone: txt })
              }
            />

            <EditableInfo
              label="Gender"
              value={formData.gender}
              isEditing={isEditing}
              onChangeText={(txt) =>
                setFormData({ ...formData, gender: txt })
              }
            />

            <EditableInfo
              label="Date of Birth"
              value={formData.dob}
              isEditing={isEditing}
              onChangeText={(txt) =>
                setFormData({ ...formData, dob: txt })
              }
            />
          </View>

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
    </SafeAreaView>
  );
}

/* 🔹 Editable Row */
interface EditableInfoProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
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
        selectionColor={COLORS.primary}
        underlineColorAndroid="transparent"
      />
    ) : (
      <Text style={styles.value}>{value}</Text>
    )}
  </View>
);

/* 🎨 STYLES */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  curvedContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  iconBtn: {
    padding: 6,
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },

  saveText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
    letterSpacing: 0.6,
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
    paddingVertical: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.primary,
  },

  cancelBtn: {
    marginTop: 24,
    alignSelf: "center",
    padding: 10,
  },

  cancelText: {
    color: COLORS.danger,
    fontWeight: "600",
  },
});
