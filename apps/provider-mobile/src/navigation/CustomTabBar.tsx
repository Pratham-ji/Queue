import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");
const COLORS = {
  primary: "#2563EB", // Royal Blue
  danger: "#EF4444",
  dark: "#0F172A",
  text: "#FFFFFF",
  muted: "#64748B",
};

import { useQueueStore } from "../store/queueStore";

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { activeClinic, fetchMyClinics } = useQueueStore();
  const isPaused = activeClinic?.isEmergencyPause || false;

  return (
    <View style={styles.container}>
      <BlurView intensity={100} tint="dark" style={styles.blurContainer}>
        <View style={styles.innerContainer}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Premium Action Button (Far Right)
            if (route.name === "Emergency") {
              const handleEmergency = () => {
                if (!activeClinic?.id) return;
                
                const performPause = async (reason: string) => {
                  try {
                    // Optimistic update
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: true }
                    });
                    
                    const { api } = require("../../services/api");
                    await api.post(`/queue/${activeClinic.id}/toggle-pause`, {
                      isPaused: true,
                      reason
                    });
                  } catch (err) {
                    alert("Failed to toggle queue state");
                    // Revert on error
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: false }
                    });
                  }
                };

                const performResume = async () => {
                  try {
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: false }
                    });
                    
                    const { api } = require("../../services/api");
                    await api.post(`/queue/${activeClinic.id}/toggle-pause`, {
                      isPaused: false
                    });
                  } catch (err) {
                    alert("Failed to resume queue");
                    useQueueStore.setState({
                      activeClinic: { ...activeClinic, isEmergencyPause: true }
                    });
                  }
                };

                if (isPaused) {
                  performResume();
                } else {
                  const { ActionSheetIOS, Platform, Alert } = require("react-native");
                  if (Platform.OS === "ios") {
                    ActionSheetIOS.showActionSheetWithOptions(
                      {
                        options: ["Cancel", "🚨 Emergency (Pause Queue)", "☕ Doctor on Break"],
                        cancelButtonIndex: 0,
                        title: "Pause Queue",
                        message: "Select a reason for pausing the queue",
                      },
                      (buttonIndex: number) => {
                        if (buttonIndex === 1) performPause("EMERGENCY");
                        if (buttonIndex === 2) performPause("BREAK");
                      }
                    );
                  } else {
                    Alert.alert(
                      "Pause Queue",
                      "Select a reason for pausing the queue",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "🚨 Emergency (Pause Queue)", onPress: () => performPause("EMERGENCY") },
                        { text: "☕ Doctor on Break", onPress: () => performPause("BREAK") },
                      ]
                    );
                  }
                }
              };

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={handleEmergency}
                  style={[styles.premiumButton, isPaused && { backgroundColor: "#10B981", shadowColor: "#10B981" }]}
                >
                  <Text style={styles.premiumText}>{isPaused ? "Resume ▶️" : "Pause Q 🚨"}</Text>
                </TouchableOpacity>
              );
            }

            // Normal Tabs
            const getIconName = () => {
              if (route.name === "Desk") return isFocused ? "grid" : "grid-outline";
              if (route.name === "Pharmacy") return isFocused ? "medical" : "medical-outline";
              if (route.name === "History") return isFocused ? "time" : "time-outline";
              return "ellipse";
            };

            return (
              <AnimatedTabIcon
                key={index}
                isFocused={isFocused}
                onPress={onPress}
                label={label as string}
                iconName={getIconName()}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const AnimatedTabIcon = ({ isFocused, onPress, label, iconName }: any) => {
  const viewRef = React.useRef<any>(null);

  const handlePressIn = () => {
    if (viewRef.current) {
      viewRef.current.animate({ 0: { scale: 1 }, 1: { scale: 0.85 } }, 150);
    }
  };

  const handlePressOut = () => {
    if (viewRef.current) {
      viewRef.current.animate({ 0: { scale: 0.85 }, 1: { scale: 1 } }, 150);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animatable.View ref={viewRef} style={styles.tabContent} useNativeDriver>
        <Ionicons name={iconName} size={22} color={isFocused ? "#60A5FA" : COLORS.muted} />
        <Text style={[styles.tabLabel, { color: isFocused ? "#60A5FA" : COLORS.muted }]}>
          {label}
        </Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 100,
    borderRadius: 40,
    backgroundColor: "transparent", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  blurContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "rgba(15, 23, 42, 0.95)", // move dark bg here for solid fallback
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.danger,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginLeft: 8,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 13,
    marginRight: 6,
  }
});
