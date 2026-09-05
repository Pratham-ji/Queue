import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SlideToCallProps {
  onTrigger: () => void;
  disabled?: boolean;
}

export default function SlideToCall({ onTrigger, disabled }: SlideToCallProps) {
  // Respecting the grid alignment constraints
  const SLIDER_WIDTH = SCREEN_WIDTH - 48; // To match exact dimensions (marginHorizontal: 24 on both sides = 48)
  const THUMB_SIZE = 56;
  const TRACK_PADDING = 4;
  const MAX_TRANSLATE = SLIDER_WIDTH - THUMB_SIZE - (TRACK_PADDING * 2);
  const THRESHOLD = MAX_TRANSLATE * 0.75;

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const [triggered, setTriggered] = useState(false);

  const handleTriggerComplete = () => {
    setTriggered(true);
    onTrigger();
    
    // Reset state after slight delay
    setTimeout(() => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      setTriggered(false);
    }, 800);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      if (disabled || triggered) return;
      const translation = Math.max(0, Math.min(startX.value + event.translationX, MAX_TRANSLATE));
      translateX.value = translation;
    })
    .onEnd(() => {
      if (disabled || triggered) return;
      if (translateX.value > THRESHOLD) {
        translateX.value = withTiming(MAX_TRANSLATE, { duration: 150 }, () => {
          runOnJS(handleTriggerComplete)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, MAX_TRANSLATE * 0.4],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity: disabled ? 1 : opacity };
  });

  return (
    <View
      style={[
        styles.track,
        { width: SLIDER_WIDTH },
        disabled && styles.trackDisabled,
      ]}
    >
      <Animated.Text
        style={[
          styles.label,
          animatedTextStyle,
          disabled && styles.labelDisabled,
        ]}
      >
        {disabled ? "NO PATIENTS WAITING" : "SLIDE TO CALL NEXT"}
      </Animated.Text>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.thumb,
            animatedThumbStyle,
            disabled && styles.thumbDisabled,
          ]}
        >
          <Ionicons
            name="arrow-forward"
            size={22}
            color={disabled ? "#94A3B8" : "#2563EB"}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 64,
    borderRadius: 999,
    backgroundColor: "#0F172A", // Rich slate
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    padding: 4,
    alignSelf: "center",
    // Android shadow
    elevation: 6,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  trackDisabled: {
    backgroundColor: "#E2E8F0",
    borderColor: "#CBD5E1",
    elevation: 0,
    shadowOpacity: 0,
  },
  label: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 1.5,
  },
  labelDisabled: {
    color: "#94A3B8",
    letterSpacing: 1,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    // New drop shadow requirement
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  thumbDisabled: {
    backgroundColor: "#F1F5F9",
    elevation: 0,
    shadowOpacity: 0,
  },
});
