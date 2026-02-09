import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
// We keep this for iOS, but we will add extra protection for Android
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { height } = Dimensions.get("window");

// --- THEME ---
const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#6B7280",
  border: "#D1D5DB",
  bg: "#FFFFFF",
};

// --- COMPONENTS ---
interface SocialBtnProps {
  icon: any;
  label: string;
  onPress: () => void;
  iconColor?: string;
}

const SocialButton = ({
  icon,
  label,
  onPress,
  iconColor = "#111",
}: SocialBtnProps) => (
  <TouchableOpacity
    style={styles.socialBtn}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.socialIconWrapper}>
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <Text style={styles.socialBtnText}>{label}</Text>
  </TouchableOpacity>
);

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (value.length > 0 && value.length < 10) {
      setPhoneError(`${10 - value.length} more digit${10 - value.length !== 1 ? "s" : ""} needed`);
    } else {
      setPhoneError("");
    }
  };

  const handleContinue = () => {
    if (phoneNumber.length === 10) {
      navigation.replace("Main");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      {/* 1. KEYBOARD HANDLING: 'padding' works best for most cases on both,
          but sometimes 'undefined' is better for Android depending on manifest.
          We use a flex structure to prevent jitter. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => console.log("Close")}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Log in or sign up</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.welcomeText}>Welcome to Queue</Text>

            {/* INPUT SECTION */}
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                {/* Country/Region - Small Container */}
                <View style={styles.countryContainer}>
                  <Text style={styles.inputLabel}>Country</Text>
                  <View style={styles.countryRow}>
                    <Text style={styles.countryText}>India (+91)</Text>
                    <Ionicons name="chevron-down" size={16} color={COLORS.text} />
                  </View>
                </View>

                {/* Vertical Divider */}
                <View style={styles.verticalDivider} />

                {/* Phone Number - Large Container */}
                <View style={styles.phoneContainer}>
                  <Text style={styles.inputLabel}>Phone number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="10-digit number"
                    placeholderTextColor={COLORS.subText}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    maxLength={10}
                    autoFocus={false}
                  />
                </View>
              </View>
            </View>

            {/* ERROR MESSAGE - Strong UI */}
            {phoneError && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" style={styles.errorIcon} />
                <Text style={styles.errorText}>{phoneError}</Text>
              </View>
            )}

            {!phoneError && phoneNumber.length === 10 && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" style={styles.successIcon} />
                <Text style={styles.successText}>Phone number is valid</Text>
              </View>
            )}

            <Text style={styles.helperText}>
              We'll call or text you to confirm your number. Standard message
              and data rates apply.
            </Text>

            <TouchableOpacity
              style={[styles.continueBtn, phoneNumber.length !== 10 && styles.continueBtnDisabled]}
              onPress={handleContinue}
              activeOpacity={phoneNumber.length === 10 ? 0.8 : 0.5}
              disabled={phoneNumber.length !== 10}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>

            {/* SOCIAL STACK */}
            <View style={styles.socialStack}>
              <SocialButton
                icon="mail-outline"
                label="Continue with email"
                onPress={() => {}}
                iconColor="#374151"
              />
              <SocialButton
                icon="logo-facebook"
                label="Continue with Facebook"
                onPress={() => {}}
                iconColor="#1877F2"
              />
              <SocialButton
                icon="logo-google"
                label="Continue with Google"
                onPress={() => {}}
                iconColor="#DB4437"
              />
              <SocialButton
                icon="logo-apple"
                label="Continue with Apple"
                onPress={() => {}}
                iconColor="#000000"
              />
            </View>

            {/* Bottom spacer for scrolling */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safeArea: {
    flex: 1,
    // ANDROID FIX: Add manual padding if StatusBar is translucent
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: COLORS.bg, // Ensure header is opaque
  },
  closeBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1, // Ensures content takes full space preventing jitter
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 24,
    marginTop: 10,
  },

  // Input
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: COLORS.bg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  countryContainer: {
    width: "28%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
  },
  phoneContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
  },
  verticalDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    height: "100%",
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.subText,
    marginBottom: 6,
  },
  countryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countryText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    height: 24,
    padding: 0,
  },

  // Error and Success States
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "500",
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  successIcon: {
    marginRight: 8,
  },
  successText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.subText,
    lineHeight: 18,
    marginBottom: 24,
  },

  // Button
  continueBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: COLORS.subText,
  },

  socialStack: {
    gap: 16,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#111",
    backgroundColor: "#FFF",
    position: "relative",
  },
  socialIconWrapper: {
    position: "absolute",
    left: 20,
    width: 24,
    alignItems: "center",
  },
  socialBtnText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
});
