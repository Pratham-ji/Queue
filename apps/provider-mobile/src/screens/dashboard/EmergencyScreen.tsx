import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function EmergencyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Emergency / Pause Q Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F172A" },
  text: { color: "#FFF" },
});
