import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassCard from "@/components/GlassCard";
import { useColors } from "@/hooks/useColors";

const ENERGY_LEVELS = [
  { hour: "6am", level: 60 },
  { hour: "8am", level: 75 },
  { hour: "10am", level: 95 },
  { hour: "12pm", level: 80 },
  { hour: "2pm", level: 55 },
  { hour: "4pm", level: 85 },
  { hour: "6pm", level: 70 },
  { hour: "8pm", level: 45 },
  { hour: "10pm", level: 30 },
];

const RECOMMENDATIONS = [
  { icon: "sun", text: "Peak window 10-11 AM: schedule deep work", type: "opportunity", color: "#FFB347" },
  { icon: "coffee", text: "Dip at 2 PM — take a 10-min break or light walk", type: "warning", color: "#CF6679" },
  { icon: "moon", text: "Wind-down starts at 9 PM — avoid screens", type: "info", color: "#BB86FC" },
  { icon: "droplet", text: "Hydration below optimal — drink 500ml water", type: "warning", color: "#03DAC6" },
];

const DAILY_METRICS = [
  { label: "Sleep", value: "7h 20m", icon: "moon", color: "#BB86FC" },
  { label: "Steps", value: "8,420", icon: "activity", color: "#4ECDC4" },
  { label: "Hydration", value: "1.8L", icon: "droplet", color: "#03DAC6" },
  { label: "Focus", value: "4h 10m", icon: "target", color: "#FFB347" },
];

export default function EnergyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState(3);
  const isWeb = Platform.OS === "web";
  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;

  const currentEnergy = 82;
  const energyColor =
    currentEnergy > 75 ? colors.success : currentEnergy > 50 ? colors.warning : colors.error;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : 32, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Lifestyle Energy</Text>
        <View style={[styles.badge, { backgroundColor: energyColor + "22" }]}>
          <Feather name="battery-charging" size={14} color={energyColor} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 16, marginTop: 16 }}>
        {/* Current Energy */}
        <GlassCard padding={20}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>CURRENT ENERGY</Text>
          <View style={styles.energyCircle}>
            <View style={[styles.outerRing, { borderColor: energyColor + "33" }]}>
              <View style={[styles.innerRing, { borderColor: energyColor + "66" }]}>
                <Text style={[styles.energyValue, { color: energyColor }]}>{currentEnergy}</Text>
                <Text style={[styles.energyUnit, { color: colors.mutedForeground }]}>/ 100</Text>
              </View>
            </View>
          </View>
          <Text style={[styles.energyStatus, { color: colors.foreground }]}>
            Optimal — Peak performance window
          </Text>
          <Text style={[styles.energyHint, { color: colors.mutedForeground }]}>
            Next dip predicted at 2:00 PM
          </Text>
        </GlassCard>

        {/* Daily Metrics */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TODAY'S METRICS</Text>
        <View style={styles.metricsGrid}>
          {DAILY_METRICS.map((m) => (
            <View
              key={m.label}
              style={[styles.metricTile, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.metricIcon, { backgroundColor: m.color + "22" }]}>
                <Feather name={m.icon as any} size={18} color={m.color} />
              </View>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Energy Chart */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ENERGY TIMELINE</Text>
        <GlassCard padding={16}>
          <View style={styles.chart}>
            {ENERGY_LEVELS.map((point, idx) => {
              const barColor = point.level > 75 ? colors.success : point.level > 50 ? colors.warning : colors.error;
              return (
                <TouchableOpacity
                  key={point.hour}
                  style={styles.chartBar}
                  onPress={() => setSelectedLevel(idx)}
                  activeOpacity={0.7}
                >
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${point.level}%` as any,
                          backgroundColor: idx === selectedLevel ? barColor : barColor + "66",
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: idx === selectedLevel ? colors.foreground : colors.mutedForeground }]}>
                    {point.hour}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedLevel !== null && (
            <Text style={[styles.selectedInfo, { color: colors.mutedForeground }]}>
              {ENERGY_LEVELS[selectedLevel].hour}: {ENERGY_LEVELS[selectedLevel].level}% energy
            </Text>
          )}
        </GlassCard>

        {/* Recommendations */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AI RECOMMENDATIONS</Text>
        <View style={{ gap: 10 }}>
          {RECOMMENDATIONS.map((r, idx) => (
            <GlassCard key={idx} padding={14}>
              <View style={styles.recRow}>
                <View style={[styles.recIcon, { backgroundColor: r.color + "22" }]}>
                  <Feather name={r.icon as any} size={16} color={r.color} />
                </View>
                <Text style={[styles.recText, { color: colors.foreground, flex: 1 }]}>{r.text}</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Log Energy */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LOG CURRENT ENERGY</Text>
        <GlassCard padding={14}>
          <Text style={[styles.logLabel, { color: colors.mutedForeground }]}>How are you feeling right now?</Text>
          <View style={styles.logButtons}>
            {[
              { label: "Low", value: 25, color: colors.error },
              { label: "Medium", value: 50, color: colors.warning },
              { label: "Good", value: 75, color: colors.cyan },
              { label: "Peak", value: 100, color: colors.success },
            ].map((btn) => (
              <TouchableOpacity
                key={btn.label}
                style={[styles.logBtn, { backgroundColor: btn.color + "22", borderColor: btn.color + "44" }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.logBtnText, { color: btn.color }]}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 10 },
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  badge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 16 },
  energyCircle: { alignItems: "center", marginVertical: 8 },
  outerRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  innerRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  energyValue: { fontSize: 40, fontFamily: "Inter_700Bold", lineHeight: 46 },
  energyUnit: { fontSize: 13, fontFamily: "Inter_400Regular" },
  energyStatus: { textAlign: "center", fontSize: 15, fontFamily: "Inter_600SemiBold", marginTop: 12 },
  energyHint: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricTile: { flex: 1, minWidth: "44%", borderRadius: 16, padding: 14, borderWidth: 1, alignItems: "center", gap: 8 },
  metricIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  metricValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 6 },
  chartBar: { flex: 1, alignItems: "center", gap: 6 },
  barContainer: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 9, fontFamily: "Inter_400Regular" },
  selectedInfo: { marginTop: 10, fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  recRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  recIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  recText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  logLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  logButtons: { flexDirection: "row", gap: 8 },
  logBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  logBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
