import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import BottomTabs from "./BottomTabs";
import LoginScreen from "../screens/auth/LoginScreen";
import OTPVerificationScreen from "../screens/auth/OTPVerificationScreen";
import HospitalDetailsScreen from "../screens/hospital/HospitalDetailsScreen";
import CustomSessionScreen from "../screens/create/CustomSessionScreen";
import QueueScreen from "../screens/queue/QueueScreen";
import LiveTrackingScreen from "../screens/queue/LiveTrackingScreen";
import BookingScreen from "../screens/booking/BookingScreen";
import ChatScreen from "../screens/telehealth/ChatScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import { useUserQueueStore } from "../store/userQueueStore";

export type RootStackParamList = {
  Login: undefined;
  OTPVerification: { phoneNumber: string };
  Main: undefined;
  HospitalDetails: { id: string };
  Queue: { clinicId?: string; clinicName?: string } | undefined;
  LiveTracking: { clinicId?: string; clinicName?: string; doctorId?: string };
  Booking: { doctorId: string }; // ✅ ADD THIS
  ChatScreen: { threadId: string; profile: any; isActive: boolean }; // ✅ TELEHEALTH
  Profile: undefined;
  CustomSession: { session: any; role: string; participant?: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const registerPushToken = useUserQueueStore((state) => state.registerPushToken);

  React.useEffect(() => {
    registerPushToken();
  }, []);

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
        name="LiveTracking"
        component={LiveTrackingScreen}
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
      
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}