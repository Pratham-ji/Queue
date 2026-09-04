import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "./CustomTabBar";

// Screens
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import PharmacyScreen from "../screens/pharmacy/PharmacyScreen";
import HistoryScreen from "../screens/profile/HistoryScreen";
import EmergencyScreen from "../screens/dashboard/EmergencyScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Desk"
      tabBar={(props: any) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Desk"
        component={DashboardScreen}
        options={{ tabBarLabel: "Desk" }}
      />
      <Tab.Screen
        name="Pharmacy"
        component={PharmacyScreen}
        options={{ tabBarLabel: "Orders" }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: "History" }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{ tabBarLabel: "Pause Q" }}
      />
    </Tab.Navigator>
  );
}
