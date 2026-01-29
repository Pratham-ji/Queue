import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onFilter?: () => void; // <--- ADD THIS
  containerStyle?: ViewStyle;
}

const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#9CA3AF",
  surface: "#FFFFFF",
  border: "#F3F4F6",
};

export default function SearchInput({
  value,
  onChangeText,
  onClear,
  onFilter, // <--- Destructure this
  containerStyle,
  ...props
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
        containerStyle,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? COLORS.primary : "#111"}
        style={styles.icon}
      />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={COLORS.subText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        {...props}  
      />

      {value.length > 0 && onClear ? (
        <TouchableOpacity onPress={onClear} style={styles.iconButton}>
          <Ionicons name="close-circle" size={18} color={COLORS.subText} />
        </TouchableOpacity>
      ) : (
        // ATTACH THE ONPRESS HERE
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilter}
          activeOpacity={0.6}
        >
          <Ionicons name="options-outline" size={18} color="#111" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  containerFocused: {
    borderColor: COLORS.primary,
    shadowOpacity: 0.15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
    height: "100%",
  },
  iconButton: {
    padding: 4,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
