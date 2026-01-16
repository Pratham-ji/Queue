import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../theme";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
}

export default function Header({
  title,
  showBack,
  rightIcon,
  onRightPress,
}: HeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} /> // Spacer to keep title centered if needed
      )}

      <Text style={styles.title}>{title}</Text>

      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={styles.iconBtn}>
          <Ionicons name={rightIcon as any} size={24} color={COLORS.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
