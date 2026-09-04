import { Pressable, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../theme";

export default function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  text: {
    ...typography.body,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
