// src/components/Screen.tsx
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

export default function Screen({ children, scroll = false, style }: Props) {
  if (scroll) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, style]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 18 },
  scroll: { paddingHorizontal: 20 },
});
