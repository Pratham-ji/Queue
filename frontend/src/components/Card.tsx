import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import { colors, spacing, shadows } from "../theme";

type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function Card({ children, onPress, style }: CardProps) {
  return (
    <Pressable
      style={[styles.card, style]}
      onPress={onPress}
      disabled={!onPress}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
});
