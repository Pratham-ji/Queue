import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, PanResponder } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SlideToCall({ onTrigger, disabled }: { onTrigger: () => void; disabled?: boolean }) {
  const SLIDER_WIDTH = 300;
  const KNOB_WIDTH = 60;
  const MAX_TRANSLATE = SLIDER_WIDTH - KNOB_WIDTH - 8; 

  const pan = useRef(new Animated.ValueXY()).current;
  const [triggered, setTriggered] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;
        let newX = gestureState.dx;
        if (newX < 0) newX = 0;
        if (newX > MAX_TRANSLATE) newX = MAX_TRANSLATE;
        pan.setValue({ x: newX, y: 0 });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabled) return;
        if (gestureState.dx > MAX_TRANSLATE * 0.6) {
          if (!triggered) {
            setTriggered(true);
            onTrigger();
            setTimeout(() => setTriggered(false), 2000);
          }
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false, // width/translation layout requires non-native driver for robust bounding or native driver if purely transform. For simple X transform, true is fine.
        }).start();
      },
    })
  ).current;

  return (
    <View style={[styles.container, { width: SLIDER_WIDTH }, disabled && styles.disabledContainer]}>
      <Text style={styles.instructionText}>
        {disabled ? "NO PATIENTS WAITING" : "SLIDE TO CALL NEXT >>>"}
      </Text>
      
      <Animated.View 
        style={[styles.knob, { transform: [{ translateX: pan.x }] }, disabled && styles.disabledKnob]}
        {...panResponder.panHandlers}
      >
        <Ionicons name="arrow-forward" size={24} color={disabled ? "#94A3B8" : "#2563EB"} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 68,
    backgroundColor: "#1E293B",
    borderRadius: 34,
    justifyContent: "center",
    padding: 4,
    overflow: "hidden",
  },
  disabledContainer: {
    backgroundColor: "#E2E8F0",
  },
  instructionText: {
    position: "absolute",
    alignSelf: "center",
    color: "#94A3B8",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 1,
    zIndex: 0,
  },
  knob: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  disabledKnob: {
    backgroundColor: "#F1F5F9",
    shadowOpacity: 0,
  }
});
