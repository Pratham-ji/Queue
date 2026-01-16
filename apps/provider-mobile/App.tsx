import "react-native-gesture-handler"; // MUST BE TOP
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

// IMPORT THE NAVIGATOR WE JUST FIXED
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
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
