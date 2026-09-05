import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

export default function CustomTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  return (
    <View style={styles.container}>
      {/* iOS gets the blur; Android gets a solid opaque fallback */}
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} tint="light" style={styles.innerPill}>
          <TabBarContent {...props} />
        </BlurView>
      ) : (
        <View style={styles.innerPill}>
          <TabBarContent {...props} />
        </View>
      )}
    </View>
  );
}

function TabBarContent({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
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

        // Premium Action Button
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
        <Ionicons name={iconName} size={22} color={isFocused ? "#0D9488" : "#94A3B8"} />
        <Text style={[styles.tabLabel, { color: isFocused ? "#0D9488" : "#94A3B8" }]}>
          {label}
        </Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    zIndex: 100,
    // NO overflow: 'hidden' here — it kills Android elevation
    borderRadius: 40,
    // Android shadow (this IS the z-ordering mechanism)
    elevation: 20,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  innerPill: {
    borderRadius: 40,
    overflow: "hidden", // Clip blur/content to pill shape INSIDE the elevated wrapper
    backgroundColor: Platform.OS === "android" ? "rgba(255, 255, 255, 0.97)" : "transparent",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginLeft: 8,
    shadowColor: "#059669",
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
