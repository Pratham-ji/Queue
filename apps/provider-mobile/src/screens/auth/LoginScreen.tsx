import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

const COLORS = {
  primary: "#0F62FE", // IBM Blue - Professional & Trustworthy
  bg: "#FFFFFF",
  surface: "#F4F7FE",
  text: "#1B2559", // Deep Navy (Softer than black)
  subText: "#8F9BBA", // Cool Grey
  border: "#E0E5F2",
  inputFocus: "#0F62FE",
  error: "#FF5630",
};

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate a smooth "Network Request" delay without lagging the UI
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace("Dashboard");
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* HEADER - Static & Clean (No Lag) */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="medical" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to manage your queue</Text>
          </View>

          {/* FORM - Animates ONCE on mount */}
          <Animatable.View
            animation="fadeInUp"
            duration={600}
            style={styles.form}
          >
            {/* EMAIL INPUT */}
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "email" && styles.inputWrapperFocus,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={
                  focusedInput === "email" ? COLORS.primary : COLORS.subText
                }
              />
              <TextInput
                style={styles.input}
                placeholder="name@hospital.com"
                placeholderTextColor={COLORS.subText}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* PASSWORD INPUT */}
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "password" && styles.inputWrapperFocus,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={
                  focusedInput === "password" ? COLORS.primary : COLORS.subText
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.subText}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.subText}
                />
              </TouchableOpacity>
            </View>

            {/* FORGOT PASSWORD */}
            <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* LOGIN BUTTON - High Performance (No heavy gradients) */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                (!email || !password) && styles.loginBtnDisabled,
              ]}
              onPress={handleLogin}
              disabled={!email || !password || isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.loginText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },

  header: { alignItems: "center", marginBottom: 40 },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: COLORS.subText, marginTop: 8 },

  form: { width: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: "transparent",
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 20,
    // Smooth Transition Hack
    shadowColor: COLORS.primary,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  inputWrapperFocus: {
    borderColor: COLORS.inputFocus,
    backgroundColor: "#FFF",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
    height: "100%",
    fontWeight: "500",
  },

  forgotBtn: { alignSelf: "flex-end", marginBottom: 32 },
  forgotText: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },

  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  loginBtnDisabled: {
    backgroundColor: COLORS.subText,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
