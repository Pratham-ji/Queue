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

  const handleContinue = () => {
    if (phoneNumber.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }
    else if (phoneNumber.length >  10) {
      alert("Please enter a valid phone number");
      return;
    }
    navigation.replace("Main");
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
            <View style={styles.inputLabel}>
              <Text style={styles.inputLabelText}>Phone number</Text>
            </View>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <View style={styles.countryCodeTop}>
                  <Text style={styles.countryCodeLabel}>Code</Text>
                </View>
                <View style={styles.countryCodeDivider} />
                <View style={styles.countryCodeBottom}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
              </View>
              <View style={styles.phoneNumberContainer}>
                <View style={styles.phoneNumberTop}>
                  <Text style={styles.phoneNumberLabel}>Mobile</Text>
                </View>
                <View style={styles.phoneNumberDivider} />
                <View style={styles.phoneNumberBottom}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Your number"
                    placeholderTextColor={COLORS.subText}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    // autoFocus can cause jitter on load in Android, set false
                    autoFocus={false}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.helperText}>
              We'll call or text you to confirm your number. Standard message
              and data rates apply.
            </Text>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleContinue}
              activeOpacity={0.8}
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
  inputLabel: {
    marginBottom: 8,
  },
  inputLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  phoneInputContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  countryCodeContainer: {
    width: "22%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  countryCodeTop: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },
  countryCodeLabel: {
    fontSize: 11,
    color: COLORS.subText,
    fontWeight: "500",
  },
  countryCodeDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  countryCodeBottom: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  phoneNumberContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  phoneNumberTop: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },
  phoneNumberLabel: {
    fontSize: 11,
    color: COLORS.subText,
    fontWeight: "500",
  },
  phoneNumberDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  phoneNumberBottom: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  inputTop: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
  },
  inputLabelOld: {
    fontSize: 12,
    color: COLORS.subText,
    marginBottom: 4,
  },
  countryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countryText: {
    fontSize: 16,
    color: COLORS.text,
  },
  inputDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  inputBottom: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFF",
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    height: 24,
    padding: 0,
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
