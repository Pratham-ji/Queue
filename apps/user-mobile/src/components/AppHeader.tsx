import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../theme";

export default function AppHeader({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
