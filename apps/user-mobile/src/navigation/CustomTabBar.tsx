import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.innerContainer}>
          {state.routes.map((route, index) => {
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

            // Zomato style Premium Action Button
            if (route.name === "Create") {
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={onPress}
                  style={styles.premiumButton}
                >
                  <Text style={styles.premiumText}>Host</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </TouchableOpacity>
              );
            }

            // Normal Tabs
            const getIconName = () => {
              if (route.name === "Home") return isFocused ? "search" : "search-outline";
              if (route.name === "Queue") return isFocused ? "clipboard" : "clipboard-outline";
              if (route.name === "Messages") return isFocused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
              if (route.name === "Profile") return isFocused ? "person-circle" : "person-circle-outline";
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <Ionicons name={iconName} size={22} color={isFocused ? "#0D9488" : "#94A3B8"} />
        <Text style={[styles.tabLabel, { color: isFocused ? "#0D9488" : "#94A3B8" }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    width: "90%",
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Fallback if blur fails visually
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden", // Ensures blur doesn't bleed outside border radius on iOS
  },
  blurContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12, // slightly larger to look like a pill
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Space them evenly
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
    backgroundColor: "#7C3AED",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginLeft: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
    marginRight: 4,
  }
});
