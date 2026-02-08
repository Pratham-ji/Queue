import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Screens
import HomeScreen from "../screens/home/HomeScreen";
import QueueScreen from "../screens/queue/QueueScreen";
import CreateScreen from "../screens/create/CreateScreen";
import MessagesScreen from "../screens/messages/MessagesScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: "#047857", // Emerald Green
  inactive: "#94A3B8", // Slate Grey
  background: "#FFFFFF",
  border: "#F1F5F9",
};

export default function BottomTabs() {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          height: isIOS ? 88 : 70, // Industry standard height
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 0,
          paddingTop: 6,
          paddingBottom: isIOS ? 28 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Queue"
        component={QueueScreen}
        options={{
          tabBarLabel: "Queue",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* THE USP BUTTON - PERFECTLY ALIGNED */}
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarLabel: () => null, // No label
          tabBarIcon: ({ focused }) => (
            <View style={styles.uspButtonContainer}>
              <View style={styles.uspButton}>
                <Ionicons name="add" size={32} color="#FFFFFF" />
              </View>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: "Messages",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // Container: Lowers the button to sit ON the bar, not above it
  uspButtonContainer: {
    top: 6, // Perfect "Break the Line" alignment
    alignItems: "center",
    justifyContent: "center",
  },
  // The Green Circle
  uspButton: {
    width: 54,
    height: 54,
    borderRadius: 27, // Perfect Circle
    backgroundColor: "#047857",
    alignItems: "center",
    justifyContent: "center",
    // Soft, wide shadow for depth
    shadowColor: "#047857",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    // Clean white border to separate from bar
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
});
