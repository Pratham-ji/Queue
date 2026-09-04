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
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  divider: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  primary: "#059669",
  pillBg: "#F1F5F9",
};

export const shadows: { card: ViewStyle; soft: ViewStyle } = {
  card: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  soft: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

export const typography = {
  heading: { fontSize: 28, fontWeight: "800" as TextStyle["fontWeight"], color: colors.textPrimary },
  subheading: { fontSize: 20, fontWeight: "700" as TextStyle["fontWeight"], color: colors.textPrimary },
  body: { fontSize: 16, color: colors.textPrimary },
  caption: { fontSize: 14, color: colors.textSecondary },
};
