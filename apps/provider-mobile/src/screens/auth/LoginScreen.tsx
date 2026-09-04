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
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [address, setAddress] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuth = async () => {
    if (!email || !password) return;
    if (activeTab === "signup" && (!name || !phone || !clinicName || !address)) return;
    
    setIsLoading(true);
    setErrorMsg("");

    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      const { api } = require("../../services/api");

      const endpoint = activeTab === "login" ? "/auth/login" : "/auth/signup";
      const payload = activeTab === "login" 
        ? { email, password }
        : { name, email, password, phone, role: "PROVIDER", clinicName, address };

      const res = await api.post(endpoint, payload);

      if (res.data.success) {
        const { accessToken, user } = res.data.data;

        // Verify role is PROVIDER or ADMIN
        if (user.role !== "PROVIDER" && user.role !== "ADMIN") {
          setErrorMsg("Access denied. This app is for providers only.");
          setIsLoading(false);
          return;
        }

        // Store token and user data
        await AsyncStorage.setItem("access_token", accessToken);
        await AsyncStorage.setItem("user_data", JSON.stringify(user));

        navigation.replace("Main");
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || `${activeTab === "login" ? "Login" : "Signup"} failed. Check your details.`;
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
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
            {errorMsg ? (
              <View style={{ backgroundColor: '#FEE2E2', padding: 10, borderRadius: 10, marginTop: 12, width: '100%' }}>
                <Text style={{ color: '#DC2626', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>{errorMsg}</Text>
              </View>
            ) : null}
          </View>

          {/* FORM - Animates ONCE on mount */}
          <Animatable.View
            animation="fadeInUp"
            duration={600}
            style={styles.form}
          >
            {activeTab === "signup" && (
              <>
                {/* NAME INPUT */}
                <Text style={styles.label}>Full Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === "name" && styles.inputWrapperFocus,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={focusedInput === "name" ? COLORS.primary : COLORS.subText}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Dr. John Doe"
                    placeholderTextColor={COLORS.subText}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedInput("name")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>

                {/* PHONE INPUT */}
                <Text style={styles.label}>Phone Number</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === "phone" && styles.inputWrapperFocus,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={focusedInput === "phone" ? COLORS.primary : COLORS.subText}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="10-digit number"
                    placeholderTextColor={COLORS.subText}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                    onFocus={() => setFocusedInput("phone")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>

                {/* CLINIC NAME INPUT */}
                <Text style={styles.label}>Clinic Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === "clinicName" && styles.inputWrapperFocus,
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={focusedInput === "clinicName" ? COLORS.primary : COLORS.subText}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Apollo Clinic"
                    placeholderTextColor={COLORS.subText}
                    value={clinicName}
                    onChangeText={setClinicName}
                    onFocus={() => setFocusedInput("clinicName")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>

                {/* CLINIC ADDRESS INPUT */}
                <Text style={styles.label}>Clinic Address</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === "address" && styles.inputWrapperFocus,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={focusedInput === "address" ? COLORS.primary : COLORS.subText}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 123 Health St, Dehradun"
                    placeholderTextColor={COLORS.subText}
                    value={address}
                    onChangeText={setAddress}
                    onFocus={() => setFocusedInput("address")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </>
            )}

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
            {activeTab === "login" && (
              <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* LOGIN / SIGNUP BUTTON */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                (!email || !password || (activeTab === "signup" && (!name || !phone))) && styles.loginBtnDisabled,
              ]}
              onPress={handleAuth}
              disabled={!email || !password || (activeTab === "signup" && (!name || !phone)) || isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.loginText}>
                    {activeTab === "login" ? "Sign In" : "Register"}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>

            {/* TOGGLE TAB */}
            <TouchableOpacity
              style={{ marginTop: 24, alignItems: "center" }}
              onPress={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
            >
              <Text style={{ color: COLORS.subText, fontSize: 14 }}>
                {activeTab === "login" ? "New provider? " : "Already have an account? "}
                <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                  {activeTab === "login" ? "Register here" : "Sign in"}
                </Text>
              </Text>
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
