import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./src/navigation/RootNavigator";
import { useUserQueueStore } from "./src/store/userQueueStore"; // Import Store
import { LogBox } from "react-native";

LogBox.ignoreLogs(["Socket", "http"]);

export default function App() {
  const { loadSession } = useUserQueueStore();

  useEffect(() => {
    // 🔄 GLOBAL CHECK: Keep the user logged in if they have a ticket
    loadSession();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}
