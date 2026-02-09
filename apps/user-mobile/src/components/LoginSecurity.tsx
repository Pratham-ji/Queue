import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

/* 🎨 Hospital App Colors */
const COLORS = {
  primary: "#0F766E",
  lightGreen: "#E7F5F2",
  dark: "#0F172A",
  text: "#111827",
  subText: "#6B7280",
  bg: "#F1F5F9",
  surface: "#FFFFFF",
  border: "#E5E7EB",
};

export default function LoginSecurity() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* FULL SCREEN CURVED CONTAINER */}
      <View style={styles.curvedContainer}>
        {/* PAGE TITLE */}
        <Text style={styles.pageTitle}>Login & Security</Text>

        {/* LOGIN CARD */}
        <View style={styles.card}>
          <CardHeader title="Login Details" />

          <SecurityRow
            title="Password"
            subtitle="Last changed 2 months ago"
            action="Change"
          />

          <SecurityRow
            title="Email Address"
            subtitle="satyam****@gmail.com"
            action="Update"
          />
        </View>

        {/* SECURITY CARD */}
        <View style={styles.card}>
          <CardHeader title="Security Settings" />

          <SecurityRow
            title="Two-Factor Authentication"
            subtitle="Protect your account with OTP"
            action="Enable"
            highlight
          />

          <SecurityRow
            title="Active Devices"
            subtitle="2 devices currently logged in"
            action="View"
          />

          <SecurityRow
            title="Login Alerts"
            subtitle="Get alerts for new logins"
            action="On"
            success
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

/* 🔹 Card Header */
const CardHeader = ({ title }: { title: string }) => (
  <View style={styles.cardHeader}>
    <Text style={styles.cardHeaderText}>{title}</Text>
  </View>
);

/* 🔁 Security Row */
const SecurityRow = ({
  title,
  subtitle,
  action,
  highlight,
  success,
}: any) => (
  <TouchableOpacity style={styles.row} activeOpacity={0.85}>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSub}>{subtitle}</Text>
    </View>

    <Text
      style={[
        styles.action,
        (highlight || success) && { color: COLORS.primary },
      ]}
    >
      {action}
    </Text>
  </TouchableOpacity>
);

/* 🎨 Styles */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  /* FULL SCREEN CURVED PAGE */
  curvedContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 32,
    paddingHorizontal: 16,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: 20,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
  },

  cardHeader: {
    backgroundColor: COLORS.lightGreen,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  cardHeaderText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  rowSub: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 4,
  },

  action: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.subText,
    marginLeft: 12,
  },
});
