import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import BottomTabs from "./BottomTabs";
import LoginScreen from "../screens/auth/LoginScreen";
import HospitalDetailsScreen from "../screens/hospital/HospitalDetailsScreen";
import BookingScreen from "../screens/booking/BookingScreen";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  HospitalDetails: { id: string };
  Booking: { doctorId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // CHANGE: We set the initial route to 'Login' so the app starts there,
  // but we keep 'Main' in the stack so we can navigate to it.
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      {/* 1. Auth Screen */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* 2. Main App (Tabs) */}
      <Stack.Screen name="Main" component={BottomTabs} />

      {/* 3. Feature Screens */}
      <Stack.Screen
        name="HospitalDetails"
        component={HospitalDetailsScreen}
        options={{ animation: "slide_from_right" }}
      />

      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
