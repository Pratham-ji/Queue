import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../theme";
import Header from "../../components/Header";
import PrimaryButton from "../../components/PrimaryButton";

const SettingItem = ({ icon, label, value, isSwitch, onPress }: any) => (
  <TouchableOpacity
    style={styles.item}
    onPress={onPress}
    disabled={isSwitch}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
    {isSwitch ? (
      <Switch
        value={value}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={"#FFF"}
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color={COLORS.subText} />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Settings" showBack />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>TL</Text>
              </View>
              <View>
                <Text style={styles.name}>Dr. Trafalgar Law</Text>
                <Text style={styles.email}>law@heartpirates.com</Text>
              </View>
            </View>
            <PrimaryButton
              label="Edit Profile"
              variant="outline"
              onPress={() => {}}
              style={{ marginTop: 16, height: 44 }}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingItem
              icon="notifications-outline"
              label="Push Notifications"
              isSwitch
              value={true}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="moon-outline"
              label="Dark Mode"
              isSwitch
              value={false}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="volume-high-outline"
              label="Sound Effects"
              isSwitch
              value={true}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => {}}
            />
          </View>
        </View>

        <PrimaryButton
          label="Log Out"
          onPress={() => navigation.replace("Login")}
          style={{ backgroundColor: "#FEF2F2", marginTop: 20 }}
        />
        <Text
          style={{
            textAlign: "center",
            marginTop: 10,
            color: COLORS.danger,
            fontWeight: "600",
          }}
        >
          Log Out
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SIZES.padding, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.subText,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  profileHeader: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#FFF" },
  name: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  email: { fontSize: 14, color: COLORS.subText },

  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
});
