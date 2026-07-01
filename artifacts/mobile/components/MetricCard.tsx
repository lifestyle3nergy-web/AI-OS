import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  maxValue?: number;
  color?: string;
  icon?: React.ReactNode;
}

export default function MetricCard({
  label,
  value,
  unit = "%",
  maxValue = 100,
  color,
  icon,
}: MetricCardProps) {
  const colors = useColors();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const accentColor = color ?? colors.primary;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: value / maxValue,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [value, maxValue]);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const displayColor =
    value > 80 ? colors.error : value > 60 ? colors.warning : accentColor;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.row}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, { color: displayColor }]}>
        {value}
        <Text style={[styles.unit, { color: colors.mutedForeground }]}>
          {unit}
        </Text>
      </Text>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <Animated.View
          style={[styles.bar, { width: barWidth, backgroundColor: displayColor }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: {
    opacity: 0.7,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  unit: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 2,
  },
});
