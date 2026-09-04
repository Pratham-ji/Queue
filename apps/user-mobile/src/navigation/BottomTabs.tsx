import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "./CustomTabBar";

// Screens
import HomeScreen from "../screens/home/HomeScreen";
import QueueScreen from "../screens/queue/QueueScreen";
import CreateScreen from "../screens/create/CreateScreen";
import MessagesScreen from "../screens/messages/MessagesScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Explore" }}
      />
      <Tab.Screen
        name="Queue"
        component={QueueScreen}
        options={{ tabBarLabel: "Visits" }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarLabel: "Messages" }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{ tabBarLabel: "Consult" }}
      />
    </Tab.Navigator>
  );
}
