import { BlurView } from "expo-blur";
import React from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  padding?: number;
}

export default function GlassCard({
  children,
  style,
  intensity = 20,
  padding = 16,
}: GlassCardProps) {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";

  if (isIOS) {
    return (
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[
          styles.card,
          {
            borderColor: colors.border,
            borderRadius: 20,
            padding,
          },
          style,
        ]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardGlass,
          borderColor: colors.border,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
});
