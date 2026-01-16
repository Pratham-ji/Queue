import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 1. IMPORT ALL SCREENS
import LoginScreen from "../screens/auth/LoginScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import PatientListScreen from "../screens/queue/PatientListScreen";
import SettingsScreen from "../screens/profile/SettingsScreen"; // <--- The missing link

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right", // Industry standard IOS animation
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="PatientList" component={PatientListScreen} />

      {/* 2. REGISTER SETTINGS HERE */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
