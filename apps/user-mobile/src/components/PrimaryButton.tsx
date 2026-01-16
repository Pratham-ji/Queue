import { Pressable, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../theme";

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
    borderRadius: radius.lg,
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    ...typography.body,
    fontWeight: "600",
  },
});
