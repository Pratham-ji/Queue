import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  // Brand Colors (The Blue Identity)
  primary: "#2563EB", // Royal Blue (Matches User App's structure but Blue)
  primaryDark: "#1E40AF",
  secondary: "#3B82F6",

  // Status Colors
  success: "#10B981", // Green (Online/Completed)
  warning: "#F59E0B", // Orange (Waiting)
  danger: "#EF4444", // Red (Delayed/Offline)

  // Neutrals (Standardized)
  bg: "#F8FAFC", // Off-white background
  surface: "#FFFFFF", // White cards
  text: "#0F172A", // Dark Navy (Readable)
  subText: "#64748B", // Cool Grey
  border: "#E2E8F0", // Light Grey
  inputBg: "#F1F5F9",
};

export const SIZES = {
  // Global Spacing
  base: 8,
  padding: 24,
  radius: 16,

  // Typography
  h1: 32,
  h2: 24,
  h3: 18,
  body: 14,
  caption: 12,

  // Device
  width,
  height,
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
  },
};
