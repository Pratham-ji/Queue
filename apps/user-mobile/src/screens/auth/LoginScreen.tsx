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

// --- PASSWORD VALIDATION HELPER ---
interface PasswordStrength {
  isValid: boolean;
  hasMinLength: boolean;
  hasMaxLength: boolean;
  hasSpecialChar: boolean;
  hasNumber: boolean;
  hasUppercase: boolean;
}

const validatePassword = (password: string): PasswordStrength => {
  return {
    isValid: password.length >= 8 && password.length <= 16,
    hasMinLength: password.length >= 8,
    hasMaxLength: password.length <= 16,
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  };
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

// Password Strength Indicator Component
interface PasswordCheckerProps {
  password: string;
}

const PasswordChecker = ({ password }: PasswordCheckerProps) => {
  const strength = validatePassword(password);

  if (!password) return null;

  const requirements = [
    { label: "8-16 characters", isValid: strength.isValid },
    { label: "One number", isValid: strength.hasNumber },
    { label: "One uppercase", isValid: strength.hasUppercase },
    { label: "One special char", isValid: strength.hasSpecialChar },
  ];

  const allMet = requirements.every((req) => req.isValid);

  return (
    <View style={styles.passwordCheckerContainer}>
      <View style={styles.passwordStrengthRow}>
        <Text style={styles.passwordCheckerTitle}>Password strength:</Text>
        <View
          style={[
            styles.strengthBadge,
            {
              backgroundColor: allMet
                ? COLORS.primary + "20"
                : "#FEE2E2",
            },
          ]}
        >
          <Text
            style={[
              styles.strengthBadgeText,
              {
                color: allMet ? COLORS.primary : "#EF4444",
              },
            ]}
          >
            {allMet ? "Strong" : "Weak"}
          </Text>
        </View>
      </View>

      <View style={styles.requirementsContainer}>
        {requirements.map((req, index) => (
          <View key={index} style={styles.requirementRow}>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: req.isValid ? COLORS.primary : "#FEE2E2",
                  borderColor: req.isValid ? COLORS.primary : "#EF4444",
                },
              ]}
            >
              <Ionicons
                name={req.isValid ? "checkmark" : "close"}
                size={12}
                color={req.isValid ? "#FFF" : "#EF4444"}
              />
            </View>
            <Text
              style={[
                styles.requirementText,
                {
                  color: req.isValid ? COLORS.text : "#EF4444",
                },
              ]}
            >
              {req.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Phone Number Length Checker Component
interface PhoneNumberCheckerProps {
  phoneNumber: string;
}

const PhoneNumberChecker = ({ phoneNumber }: PhoneNumberCheckerProps) => {
  if (!phoneNumber) return null;

  const isComplete = phoneNumber.length === 10;

  return (
    <View style={styles.phoneCheckerContainer}>
      <Text style={styles.phoneCheckerTitle}>Phone number status:</Text>
      <View style={styles.phoneStatusRow}>
        <View
          style={[
            styles.phoneStatusDot,
            { backgroundColor: isComplete ? COLORS.primary : "#D1D5DB" },
          ]}
        />
        <Text
          style={[
            styles.phoneStatusText,
            { color: isComplete ? COLORS.text : COLORS.subText },
          ]}
        >
          {phoneNumber.length}/10 digits
        </Text>
        {isComplete && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={COLORS.primary}
            style={{ marginLeft: "auto" }}
          />
        )}
      </View>
    </View>
  );
};

// Tab Selector Component
interface TabSelectorProps {
  activeTab: "login" | "signup";
  onTabChange: (tab: "login" | "signup") => void;
}

const TabSelector = ({ activeTab, onTabChange }: TabSelectorProps) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "login" && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange("login")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "login" && styles.tabButtonTextActive,
          ]}
        >
          Log In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "signup" && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange("signup")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "signup" && styles.tabButtonTextActive,
          ]}
        >
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Login Form Component
interface LoginFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  phoneError: string;
  setPhoneError: (value: string) => void;
  handleContinue: () => void;
}

const LoginForm = ({
  phoneNumber,
  setPhoneNumber,
  phoneError,
  setPhoneError,
  handleContinue,
}: LoginFormProps) => {
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (value.length > 0 && value.length < 10) {
      setPhoneError(
        `${10 - value.length} more digit${10 - value.length !== 1 ? "s" : ""} needed`
      );
    } else {
      setPhoneError("");
    }
  };

  return (
    <>
      <Text style={styles.welcomeText}>Welcome to Queue</Text>

      {/* INPUT SECTION */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          {/* Country/Region - Small Container */}
          <View style={styles.countryContainer}>
            <Text style={styles.inputLabel}>Country</Text>
            <View style={styles.countryRow}>
              <Text style={styles.countryText}>India (+91)</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={COLORS.text}
              />
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
          <Ionicons
            name="alert-circle"
            size={16}
            color="#EF4444"
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{phoneError}</Text>
        </View>
      )}

      {!phoneError && phoneNumber.length === 10 && (
        <View style={styles.successContainer}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color="#10B981"
            style={styles.successIcon}
          />
          <Text style={styles.successText}>Phone number is valid</Text>
        </View>
      )}

      <Text style={styles.helperText}>
        We'll call or text you to confirm your number. Standard message and
        data rates apply.
      </Text>

      <TouchableOpacity
        style={[
          styles.continueBtn,
          phoneNumber.length !== 10 && styles.continueBtnDisabled,
        ]}
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
    </>
  );
};

// Sign Up Form Component
interface SignUpFormProps {
  formData: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    passwordConfirm: string;
  };
  setFormData: (data: any) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  showPasswordConfirm: boolean;
  setShowPasswordConfirm: (value: boolean) => void;
  handleSignUp: () => void;
  handleVerifyPhone: () => void;
  handleVerifyEmail: () => void;
  errors: Record<string, string>;
}

const SignUpForm = ({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  showPasswordConfirm,
  setShowPasswordConfirm,
  handleSignUp,
  handleVerifyPhone,
  handleVerifyEmail,
  errors,
}: SignUpFormProps) => {
  const passwordStrength = validatePassword(formData.password);
  const passwordsMatch =
    formData.password && formData.passwordConfirm
      ? formData.password === formData.passwordConfirm
      : true;

  // Phone number validation
  const phoneError =
    formData.phoneNumber.length > 0 && formData.phoneNumber.length < 10
      ? `${10 - formData.phoneNumber.length} more digit${10 - formData.phoneNumber.length !== 1 ? "s" : ""} needed`
      : "";

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phoneNumber.length === 10 &&
    passwordStrength.isValid &&
    passwordsMatch &&
    Object.keys(errors).length === 0;

  return (
    <>
      <Text style={styles.welcomeText}>Create Your Account</Text>

      {/* Name Input */}
      <View style={styles.signupInputWrapper}>
        <Text style={styles.signupInputLabel}>Full Name</Text>
        <View style={[styles.signupInputContainer, errors.name && styles.inputContainerError]}>
          <Ionicons name="person-outline" size={18} color={COLORS.primary} />
          <TextInput
            style={styles.signupInput}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.subText}
            value={formData.name}
            onChangeText={(value) =>
              setFormData({ ...formData, name: value })
            }
          />
        </View>
        {errors.name && (
          <Text style={styles.fieldErrorText}>{errors.name}</Text>
        )}
      </View>

      {/* Email Input */}
      <View style={styles.signupInputWrapper}>
        <Text style={styles.signupInputLabel}>Email Address</Text>
        <View style={[styles.signupInputContainer, errors.email && styles.inputContainerError]}>
          <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
          <TextInput
            style={styles.signupInput}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.subText}
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value) =>
              setFormData({ ...formData, email: value })
            }
          />
        </View>
        {errors.email && (
          <Text style={styles.fieldErrorText}>{errors.email}</Text>
        )}
      </View>

      {/* Verify Email Button - Shows when email is valid */}
      {formData.email.length > 0 && !errors.email && (
        <TouchableOpacity
          style={styles.verifyEmailBtn}
          onPress={handleVerifyEmail}
          activeOpacity={0.8}
        >
          <Ionicons
            name="mail-open-outline"
            size={18}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.verifyEmailBtnText}>Verify Email</Text>
        </TouchableOpacity>
      )}

      {/* Phone Number Input */}
      <View style={styles.signupInputWrapper}>
        <Text style={styles.signupInputLabel}>Phone Number</Text>
        <View style={[styles.signupInputContainer, errors.phoneNumber && styles.inputContainerError]}>
          <Ionicons name="call-outline" size={18} color={COLORS.primary} />
          <View style={styles.phoneInputWrapper}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.signupInput}
              placeholder="10-digit number"
              placeholderTextColor={COLORS.subText}
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(value) =>
                setFormData({
                  ...formData,
                  phoneNumber: value.slice(0, 10),
                })
              }
              maxLength={10}
            />
          </View>
        </View>
        {errors.phoneNumber && (
          <Text style={styles.fieldErrorText}>{errors.phoneNumber}</Text>
        )}
      </View>

      {/* LIVE PHONE NUMBER LENGTH ERROR MESSAGE - Same as Login */}
      {phoneError && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={16}
            color="#EF4444"
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{phoneError}</Text>
        </View>
      )}

      {/* LIVE PHONE NUMBER SUCCESS MESSAGE - Same as Login */}
      {!phoneError && formData.phoneNumber.length === 10 && (
        <View style={styles.successContainer}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color="#10B981"
            style={styles.successIcon}
          />
          <Text style={styles.successText}>Phone number is valid</Text>
        </View>
      )}

      {/* Verify Phone Button - Shows when phone is complete */}
      {formData.phoneNumber.length === 10 && (
        <TouchableOpacity
          style={styles.verifyPhoneBtn}
          onPress={handleVerifyPhone}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark-done-outline"
            size={18}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.verifyPhoneBtnText}>Verify Phone Number</Text>
        </TouchableOpacity>
      )}

      {/* Password Input */}
      <View style={styles.signupInputWrapper}>
        <Text style={styles.signupInputLabel}>Password</Text>
        <View style={[styles.signupInputContainer, errors.password && styles.inputContainerError]}>
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />
          <TextInput
            style={styles.signupInput}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.subText}
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(value) =>
              setFormData({ ...formData, password: value })
            }
            maxLength={16}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIconButton}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={styles.fieldErrorText}>{errors.password}</Text>
        )}
      </View>

      {/* Password Checker */}
      {formData.password && <PasswordChecker password={formData.password} />}

      {/* Confirm Password Input */}
      <View style={styles.signupInputWrapper}>
        <Text style={styles.signupInputLabel}>Confirm Password</Text>
        <View
          style={[
            styles.signupInputContainer,
            formData.passwordConfirm &&
              !passwordsMatch &&
              styles.inputContainerError,
          ]}
        >
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />
          <TextInput
            style={styles.signupInput}
            placeholder="Re-enter your password"
            placeholderTextColor={COLORS.subText}
            secureTextEntry={!showPasswordConfirm}
            value={formData.passwordConfirm}
            onChangeText={(value) =>
              setFormData({ ...formData, passwordConfirm: value })
            }
            maxLength={16}
          />
          <TouchableOpacity
            onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
            style={styles.eyeIconButton}
          >
            <Ionicons
              name={showPasswordConfirm ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
        {formData.passwordConfirm && !passwordsMatch && (
          <Text style={styles.fieldErrorText}>Passwords do not match</Text>
        )}
        {formData.passwordConfirm && passwordsMatch && (
          <Text style={styles.fieldSuccessText}>Passwords match</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.signupBtn, !isFormValid && styles.signupBtnDisabled]}
        onPress={handleSignUp}
        activeOpacity={isFormValid ? 0.8 : 0.5}
        disabled={!isFormValid}
      >
        <Text style={styles.signupBtnText}>Create Account</Text>
      </TouchableOpacity>
    </>
  );
};

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Login form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Sign up form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (value.length > 0 && value.length < 10) {
      setPhoneError(
        `${10 - value.length} more digit${10 - value.length !== 1 ? "s" : ""} needed`
      );
    } else {
      setPhoneError("");
    }
  };

  const handleContinue = () => {
    if (phoneNumber.length === 10) {
      navigation.navigate("OTPVerification", {
        phoneNumber: phoneNumber,
        source: "login",
      });
    }
  };

  const handleVerifyPhone = () => {
    if (formData.phoneNumber.length === 10) {
      navigation.navigate("OTPVerification", {
        phoneNumber: formData.phoneNumber,
        source: "signup",
        signUpData: formData,
      });
    }
  };

  const handleVerifyEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && emailRegex.test(formData.email)) {
      navigation.navigate("OTPVerification", {
        email: formData.email,
        source: "email-verification",
        signUpData: formData,
      });
    }
  };

  const validateSignUpForm = () => {
    const newErrors: Record<string, string> = {};
    const passwordStrength = validatePassword(formData.password);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordStrength.isValid) {
      newErrors.password = "Password must be 8-16 characters";
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (validateSignUpForm()) {
      console.log("Sign up successful", formData);
      // TODO: Call API to register user after email verification
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
            <Text style={styles.headerTitle}>Queue</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* TAB SELECTOR */}
          <View style={styles.tabSelectorContainer}>
            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
          >
            {activeTab === "login" ? (
              <LoginForm
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                phoneError={phoneError}
                setPhoneError={setPhoneError}
                handleContinue={handleContinue}
              />
            ) : (
              <SignUpForm
                formData={formData}
                setFormData={setFormData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showPasswordConfirm={showPasswordConfirm}
                setShowPasswordConfirm={setShowPasswordConfirm}
                handleSignUp={handleSignUp}
                handleVerifyPhone={handleVerifyPhone}
                handleVerifyEmail={handleVerifyEmail}
                errors={errors}
              />
            )}

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
  closeBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  // Tab Selector Styles
  tabSelectorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.bg,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 6,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: COLORS.bg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.subText,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  scrollContent: {
    padding: 24,
    paddingTop: 12,
    flexGrow: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 24,
    marginTop: 10,
  },

  // Login Form Styles
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

  // Button Styles
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

  // Sign Up Form Styles
  signupInputWrapper: {
    marginBottom: 18,
  },
  signupInputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  signupInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: COLORS.bg,
    gap: 10,
  },
  inputContainerError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2",
  },
  signupInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    padding: 0,
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  countryCode: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginRight: 4,
  },
  eyeIconButton: {
    padding: 4,
    marginLeft: 4,
  },
  fieldErrorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 6,
    fontWeight: "500",
  },
  fieldSuccessText: {
    fontSize: 12,
    color: "#059669",
    marginTop: 6,
    fontWeight: "500",
  },

  // Password Checker Styles - Simple & Minimal
  passwordCheckerContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  passwordStrengthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  passwordCheckerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  strengthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  strengthBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  requirementsContainer: {
    gap: 6,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Legacy Password Checker Styles
  passwordCheckerContainerNew: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  passwordCheckerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  strengthBadgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  strengthBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarContainer: {
    marginBottom: 14,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.subText,
  },
  passwordRequirementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  passwordBadge: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: "#FFF",
  },
  badgeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },

  // Old Styles (for backward compatibility)
  strengthItemsContainer: {
    gap: 8,
  },
  strengthItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Sign Up Button
  signupBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  signupBtnDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  signupBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Phone Number Length Checker Styles
  phoneCheckerContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  phoneCheckerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  phoneStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phoneStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phoneStatusText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Verify Phone Button
  verifyPhoneBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    flexDirection: "row",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  verifyPhoneBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Verify Email Button
  verifyEmailBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    flexDirection: "row",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  verifyEmailBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
