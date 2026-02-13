import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import BottomTabs from "./BottomTabs";
import LoginScreen from "../screens/auth/LoginScreen";
import OTPVerificationScreen from "../screens/auth/OTPVerificationScreen";
import HospitalDetailsScreen from "../screens/hospital/HospitalDetailsScreen";
import CustomSessionScreen from "../screens/create/CustomSessionScreen";
import QueueScreen from "../screens/queue/QueueScreen";
import BookingScreen from "../screens/booking/BookingScreen"; // ✅ IMPORT THIS

export type RootStackParamList = {
  Login: undefined;
  OTPVerification: { phoneNumber: string };
  Main: undefined;
  HospitalDetails: { id: string };
  Queue: undefined;
  Booking: { doctorId: string }; // ✅ ADD THIS
  
  CustomSession: { session: any; role: string; participant?: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="Main" component={BottomTabs} />

      <Stack.Screen
        name="HospitalDetails"
        component={HospitalDetailsScreen}
        options={{ animation: "slide_from_right" }}
      />

      <Stack.Screen
        name="Queue"
        component={QueueScreen}
        options={{ animation: "slide_from_right" }}
      />

      <Stack.Screen
        name="CustomSession"
        component={CustomSessionScreen}
        options={{ headerShown: false }}
      />

      {/* ✅ REGISTER BOOKING SCREEN */}
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          animation: "slide_from_bottom", // Nice slide up effect
          presentation: "modal", // optional: makes it look like a popup
        }}
      />
    </Stack.Navigator>
  );
}