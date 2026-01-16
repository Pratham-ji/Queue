import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { COLORS, SIZES } from "../theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "solid" | "outline";
  style?: ViewStyle;
}

export default function PrimaryButton({
  label,
  onPress,
  isLoading,
  disabled,
  variant = "solid",
  style,
}: PrimaryButtonProps) {
  const isOutline = variant === "outline";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.container,
        isOutline ? styles.outline : styles.solid,
        disabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isOutline ? COLORS.primary : "#FFF"} />
      ) : (
        <Text
          style={[
            styles.text,
            isOutline ? styles.textOutline : styles.textSolid,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: SIZES.radius,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  solid: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
  textSolid: { color: "#FFFFFF" },
  textOutline: { color: COLORS.primary },
});
