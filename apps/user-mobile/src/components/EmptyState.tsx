// src/components/EmptyState.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing, colors } from "../theme";

export default function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  sub: { color: colors.textSecondary },
});
