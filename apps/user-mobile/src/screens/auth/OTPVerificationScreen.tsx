import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// --- THEME (matching LoginScreen) ---
const COLORS = {
  primary: "#047857",
  text: "#111827",
  subText: "#6B7280",
  border: "#D1D5DB",
  bg: "#FFFFFF",
};

export default function OTPVerificationScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const phoneNumber = route?.params?.phoneNumber || "1234567890";
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Handle OTP input change
  const handleOTPChange = (value: string, index: number) => {
    setError(""); // Clear error on new input
    
    // Only allow numeric input
    if (!/^\d*$/.test(value)) {
      return;
    }

    // If value is pasted and has multiple digits
    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      const newOtp = [...otp];
      
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newOtp[index + i] = digits[i];
      }
      
      setOtp(newOtp);
      
      // Focus the next empty field or last field
      const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    // Normal single digit input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current field is empty, focus previous
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else {
        // Clear current field
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const last4 = phone.slice(-4);
    return `****${last4}`;
  };

  // Check if all OTP fields are filled
  const isOTPComplete = otp.every((digit) => digit !== "");

  // Handle verification
  const handleVerify = async () => {
    if (!isOTPComplete) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // On success, navigate to Main
      navigation.replace("Main");
    } catch (err) {
      setError("Invalid OTP. Please try again.");
      setIsVerifying(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
    // Here you would typically call an API to resend OTP
    console.log("Resend OTP to", phoneNumber);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verify phone number</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            {/* WELCOME TEXT */}
            <Text style={styles.welcomeText}>Enter verification code</Text>

            {/* PHONE NUMBER DISPLAY */}
            <View style={styles.phoneDisplayContainer}>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.phoneDisplayText}>
                Code sent to {formatPhoneNumber(phoneNumber)}
              </Text>
            </View>

            {/* OTP INPUT CONTAINERS */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpInputWrapper}>
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      error && styles.otpInputError,
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(value) => handleOTPChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    placeholder="-"
                    placeholderTextColor="#D1D5DB"
                    editable={!isVerifying}
                  />
                </View>
              ))}
            </View>

            {/* ERROR MESSAGE */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color="#EF4444"
                  style={styles.errorIcon}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* HELPER TEXT */}
            <Text style={styles.helperText}>
              Didn't receive a code? Check your phone or{" "}
              <Text
                style={[styles.helperText, styles.helperLink]}
                onPress={handleResendOTP}
              >
                request a new one
              </Text>
            </Text>

            {/* VERIFY BUTTON */}
            <TouchableOpacity
              style={[
                styles.verifyBtn,
                (!isOTPComplete || isVerifying) && styles.verifyBtnDisabled,
              ]}
              onPress={handleVerify}
              disabled={!isOTPComplete || isVerifying}
              activeOpacity={isOTPComplete && !isVerifying ? 0.8 : 0.5}
            >
              {isVerifying ? (
                <View style={styles.verifyBtnContent}>
                  <View style={styles.spinner} />
                  <Text style={styles.verifyText}>Verifying...</Text>
                </View>
              ) : (
                <Text style={styles.verifyText}>Verify</Text>
              )}
            </TouchableOpacity>

            {/* BACK TO LOGIN */}
            <TouchableOpacity
              style={styles.changePhoneBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.changePhoneText}>Use a different number</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: COLORS.bg,
  },
  backBtn: {
    padding: 4,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
  },

  // Phone Display
  phoneDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  phoneDisplayText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },

  // OTP Container
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  otpInputWrapper: {
    flex: 1,
    aspectRatio: 1,
  },
  otpInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    backgroundColor: "#FAFAFA",
  },
  otpInputFilled: {
    backgroundColor: "#F0FDF4",
    borderColor: COLORS.primary,
    color: COLORS.primary,
  },
  otpInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2",
  },

  // Error Container
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

  // Helper Text
  helperText: {
    fontSize: 12,
    color: COLORS.subText,
    lineHeight: 18,
    marginBottom: 24,
    textAlign: "center",
  },
  helperLink: {
    color: COLORS.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Verify Button
  verifyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56,
  },
  verifyBtnDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  verifyText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },

  // Change Phone Button
  changePhoneBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  changePhoneText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
