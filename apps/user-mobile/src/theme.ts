// src/theme.ts
import { StyleProp, ViewStyle, TextStyle } from "react-native";

export const spacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 48,
};

export const colors = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#9AA0A6",
  textMuted: "#B9BEC4",
  divider: "#EDEDED",
  success: "#16A34A",
  warning: "#D97706",
  primary: "#111827",
  pillBg: "#F3F4F6",
};

export const shadows: { card: ViewStyle; soft: ViewStyle } = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  soft: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

export const typography = {
  heading: { fontSize: 28, fontWeight: "700" as TextStyle["fontWeight"] },
  subheading: { fontSize: 20, fontWeight: "600" as TextStyle["fontWeight"] },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: colors.textSecondary },
};
