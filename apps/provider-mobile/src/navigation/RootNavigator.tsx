import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import Screens
import LoginScreen from "../screens/auth/LoginScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import PatientListScreen from "../screens/queue/PatientListScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import ClinicProfileScreen from "../screens/profile/ClinicProfileScreen";
import HistoryScreen from "../screens/profile/HistoryScreen";
import ScanScreen from "../screens/dashboard/ScanScreen";

// NEW IMPORTS
import ConsultationScreen from "../screens/dashboard/ConsultationScreen";
import NotificationScreen from "../screens/dashboard/NotificationScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import AnalyticsScreen from "../screens/profile/AnalyticsScreen";
import ContentScreen from "../screens/content/ContentScreen";

export type ProviderRootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  PatientList: undefined;
  Settings: undefined;
  ClinicProfile: undefined;
  History: undefined;
  Scan: undefined;
  Analytics: undefined;
  Consultation: undefined;
  EditProfile: undefined;
  Notification: undefined;
  ContentPage: { slug: string; title?: string; role?: "PROVIDER" | "ADMIN" };
};

const Stack = createNativeStackNavigator<ProviderRootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="PatientList" component={PatientListScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ClinicProfile" component={ClinicProfileScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />

      {/* NEW ROUTES */}
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Consultation" component={ConsultationScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />

      {/* Dynamic Content Pages (Help, Terms, FAQ, etc.) */}
      <Stack.Screen
        name="ContentPage"
        component={ContentScreen}
        options={{
          animation: "slide_from_right",
          headerShown: true,
          title: "Information",
        }}
      />
    </Stack.Navigator>
  );
}
