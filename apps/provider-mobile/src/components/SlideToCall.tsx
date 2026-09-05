import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SlideToCallProps {
  onTrigger: () => void;
  disabled?: boolean;
}

export default function SlideToCall({ onTrigger, disabled }: SlideToCallProps) {
  const SLIDER_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);
  const THUMB_SIZE = 56;
  const TRACK_PADDING = 4;
  const MAX_TRANSLATE = SLIDER_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

  const pan = useRef(new Animated.Value(0)).current;
  const [triggered, setTriggered] = useState(false);

  // Interpolate text opacity — fades out as thumb slides right
  const textOpacity = pan.interpolate({
    inputRange: [0, MAX_TRANSLATE * 0.4],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !triggered,
      onMoveShouldSetPanResponder: () => !disabled && !triggered,
      onPanResponderMove: (_, gesture) => {
        if (disabled || triggered) return;
        const clamped = Math.max(0, Math.min(gesture.dx, MAX_TRANSLATE));
        pan.setValue(clamped);
      },
      onPanResponderRelease: (_, gesture) => {
        if (disabled || triggered) return;

        if (gesture.dx > MAX_TRANSLATE * 0.6) {
          // Snap to end, trigger, then spring back
          Animated.timing(pan, {
            toValue: MAX_TRANSLATE,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            setTriggered(true);
            onTrigger();

            // Spring back after a brief pause
            setTimeout(() => {
              Animated.spring(pan, {
                toValue: 0,
                tension: 60,
                friction: 10,
                useNativeDriver: true,
              }).start(() => setTriggered(false));
            }, 800);
          });
        } else {
          // Didn't reach threshold — spring back
          Animated.spring(pan, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.track,
        { width: SLIDER_WIDTH },
        disabled && styles.trackDisabled,
      ]}
    >
      {/* Centered instruction text */}
      <Animated.Text
        style={[
          styles.label,
          { opacity: disabled ? 1 : textOpacity },
          disabled && styles.labelDisabled,
        ]}
      >
        {disabled ? "NO PATIENTS WAITING" : "SLIDE TO CALL NEXT"}
      </Animated.Text>

      {/* Draggable thumb */}
      <Animated.View
        style={[
          styles.thumb,
          { transform: [{ translateX: pan }] },
          disabled && styles.thumbDisabled,
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons
          name="arrow-forward"
          size={22}
          color={disabled ? "#94A3B8" : "#2563EB"}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0F172A",
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
    color: "rgba(148, 163, 184, 0.9)",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 2,
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
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Android shadow
    elevation: 8,
    zIndex: 10,
  },
  thumbDisabled: {
    backgroundColor: "#F1F5F9",
    elevation: 0,
    shadowOpacity: 0,
  },
});
