import "react-native-gesture-handler"; // MUST BE TOP
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect } from "react";
import { useQueueStore } from "./src/store/queueStore";

// IMPORT THE NAVIGATOR WE JUST FIXED
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  const { fetchQueue, initializeSocket } = useQueueStore();

  useEffect(() => {
    // Load initial data
    fetchQueue();
    // Setup listeners
    initializeSocket();
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        {/* The App now uses the external map which includes Settings */}
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
