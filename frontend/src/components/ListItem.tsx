import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, typography } from "../theme";

export default function ListItem({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.item}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  arrow: {
    fontSize: 20,
    color: colors.textMuted,
  },
});
