// src/components/Section.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing, colors, typography } from "../theme";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function Section({ title, children }: Props) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
});
