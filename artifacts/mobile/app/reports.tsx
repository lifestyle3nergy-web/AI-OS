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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const PERIODS = ["Today", "Week", "Month", "All time"];

const WEEKLY_DATA = [
  { day: "Mon", tasks: 24, energy: 80 },
  { day: "Tue", tasks: 18, energy: 65 },
  { day: "Wed", tasks: 31, energy: 90 },
  { day: "Thu", tasks: 27, energy: 75 },
  { day: "Fri", tasks: 22, energy: 70 },
  { day: "Sat", tasks: 12, energy: 55 },
  { day: "Sun", tasks: 8, energy: 45 },
];

const AGENT_PERFORMANCE = [
  { name: "PAI Core", tasks: 142, success: 98, color: "#BB86FC" },
  { name: "Memory Agent", tasks: 231, success: 99, color: "#03DAC6" },
  { name: "Device Optimizer", tasks: 78, success: 96, color: "#4ECDC4" },
  { name: "Automation Agent", tasks: 56, success: 94, color: "#FFB347" },
  { name: "Research Agent", tasks: 87, success: 91, color: "#BB86FC" },
];

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { agents, projects } = useApp();
  const [period, setPeriod] = useState("Week");
  const isWeb = Platform.OS === "web";
  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;

  const totalTasks = AGENT_PERFORMANCE.reduce((acc, a) => acc + a.tasks, 0);
  const avgSuccess = Math.round(
    AGENT_PERFORMANCE.reduce((acc, a) => acc + a.success, 0) / AGENT_PERFORMANCE.length
  );
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const maxTasks = Math.max(...WEEKLY_DATA.map((d) => d.tasks));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Reports</Text>
        <View style={[styles.badge, { backgroundColor: colors.purple + "22" }]}>
          <Feather name="bar-chart-2" size={14} color={colors.purple} />
        </View>
      </View>

      {/* Period selector */}
      <View style={[styles.periodRow, { borderBottomColor: colors.border }]}>
        {PERIODS.map((p) => {
          const isActive = period === p;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, isActive && { backgroundColor: colors.primary + "22" }]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, { color: isActive ? colors.primary : colors.mutedForeground }]}>
                {p}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ padding: 16, gap: 16 }}>
        {/* KPIs */}
        <View style={styles.kpiRow}>
          {[
            { label: "Total Tasks", value: totalTasks, icon: "check-square", color: colors.cyan },
            { label: "Avg Success", value: `${avgSuccess}%`, icon: "trending-up", color: colors.success },
            { label: "Active Projects", value: activeProjects, icon: "folder", color: colors.warning },
            { label: "Active Agents", value: agents.filter((a) => a.status === "running").length, icon: "cpu", color: colors.primary },
          ].map((kpi) => (
            <View
              key={kpi.label}
              style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.kpiIcon, { backgroundColor: kpi.color + "22" }]}>
                <Feather name={kpi.icon as any} size={16} color={kpi.color} />
              </View>
              <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Tasks Chart */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          TASKS COMPLETED — {period.toUpperCase()}
        </Text>
        <GlassCard padding={16}>
          <View style={styles.barChart}>
            {WEEKLY_DATA.map((d) => {
              const pct = d.tasks / maxTasks;
              return (
                <View key={d.day} style={styles.barGroup}>
                  <Text style={[styles.barValue, { color: colors.primary }]}>{d.tasks}</Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${pct * 100}%` as any,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, { color: colors.mutedForeground }]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Energy vs Task correlation */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ENERGY × TASKS CORRELATION</Text>
        <GlassCard padding={16}>
          <View style={styles.corrChart}>
            {WEEKLY_DATA.map((d) => (
              <View key={d.day} style={styles.corrItem}>
                <Text style={[styles.corrDay, { color: colors.mutedForeground }]}>{d.day}</Text>
                <View style={styles.corrBars}>
                  <View style={[styles.corrBarTrack, { backgroundColor: colors.muted }]}>
                    <View
                      style={[styles.corrBarFill, { width: `${(d.tasks / maxTasks) * 100}%` as any, backgroundColor: colors.primary }]}
                    />
                  </View>
                  <View style={[styles.corrBarTrack, { backgroundColor: colors.muted }]}>
                    <View
                      style={[styles.corrBarFill, { width: `${d.energy}%` as any, backgroundColor: colors.success }]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Tasks</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Energy</Text>
            </View>
          </View>
        </GlassCard>

        {/* Agent Performance */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AGENT PERFORMANCE</Text>
        <GlassCard padding={0}>
          {AGENT_PERFORMANCE.map((agent, idx) => (
            <View
              key={agent.name}
              style={[
                styles.agentRow,
                { borderBottomColor: colors.border },
                idx === AGENT_PERFORMANCE.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.agentDot, { backgroundColor: agent.color }]} />
              <Text style={[styles.agentName, { color: colors.foreground, flex: 1 }]}>{agent.name}</Text>
              <Text style={[styles.agentTasks, { color: colors.mutedForeground }]}>{agent.tasks} tasks</Text>
              <View style={[styles.successBadge, { backgroundColor: agent.color + "22" }]}>
                <Text style={[styles.successText, { color: agent.color }]}>{agent.success}%</Text>
              </View>
            </View>
          ))}
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
  periodRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  periodText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpiCard: { flex: 1, minWidth: "44%", borderRadius: 16, padding: 14, borderWidth: 1, gap: 6, alignItems: "center" },
  kpiIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  kpiValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  kpiLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  barChart: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 120 },
  barGroup: { flex: 1, alignItems: "center", gap: 4 },
  barValue: { fontSize: 9, fontFamily: "Inter_500Medium" },
  barTrack: { flex: 1, width: "80%", borderRadius: 4, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 4 },
  barDay: { fontSize: 10, fontFamily: "Inter_400Regular" },
  corrChart: { gap: 8 },
  corrItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  corrDay: { width: 28, fontSize: 10, fontFamily: "Inter_500Medium" },
  corrBars: { flex: 1, gap: 3 },
  corrBarTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  corrBarFill: { height: "100%", borderRadius: 3 },
  legend: { flexDirection: "row", gap: 16, marginTop: 12, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  agentRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1 },
  agentDot: { width: 8, height: 8, borderRadius: 4 },
  agentName: { fontSize: 13, fontFamily: "Inter_400Regular" },
  agentTasks: { fontSize: 12, fontFamily: "Inter_400Regular" },
  successBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  successText: { fontSize: 11, fontFamily: "Inter_700Bold" },
});
