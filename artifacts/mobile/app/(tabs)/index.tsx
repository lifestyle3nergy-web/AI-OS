import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassCard from "@/components/GlassCard";
import MetricCard from "@/components/MetricCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const ACTIVITY_ICONS: Record<string, string> = {
  agent: "cpu",
  memory: "database",
  research: "search",
  automation: "zap",
  system: "monitor",
  energy: "battery-charging",
  project: "folder",
};

const QUICK_LINKS = [
  { label: "Memory", icon: "database", path: "/memory" },
  { label: "Research", icon: "search", path: "/research" },
  { label: "Energy", icon: "battery-charging", path: "/energy" },
  { label: "Reports", icon: "bar-chart-2", path: "/reports" },
  { label: "Automations", icon: "zap", path: "/automations" },
];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { systemStatus } = useApp();
  const router = useRouter();
  const isWeb = Platform.OS === "web";

  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;
  const paddingBottom = isWeb ? 34 + 84 : 84 + 16;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });

  const aiStatusColor =
    systemStatus.aiStatus === "active"
      ? colors.success
      : systemStatus.aiStatus === "processing"
      ? colors.warning
      : colors.mutedForeground;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop, paddingBottom, paddingHorizontal: 16, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.brand, { color: colors.primary }]}>AI OS v1.0</Text>
          <Text style={[styles.datetime, { color: colors.mutedForeground }]}>
            {dateStr} · {timeStr}
          </Text>
        </View>
        <View style={[styles.aiIndicator, { backgroundColor: aiStatusColor + "22", borderColor: aiStatusColor + "55" }]}>
          <View style={[styles.aiDot, { backgroundColor: aiStatusColor }]} />
          <Text style={[styles.aiLabel, { color: aiStatusColor }]}>
            {systemStatus.aiStatus.charAt(0).toUpperCase() + systemStatus.aiStatus.slice(1)}
          </Text>
        </View>
      </View>

      {/* System Metrics */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SYSTEM</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricRow}>
          <MetricCard
            label="CPU"
            value={systemStatus.cpu}
            color={colors.cyan}
            icon={<Feather name="cpu" size={12} color={colors.cyan} />}
          />
          <MetricCard
            label="RAM"
            value={systemStatus.ram}
            color={colors.purple}
            icon={<Feather name="server" size={12} color={colors.purple} />}
          />
        </View>
        <View style={styles.metricRow}>
          <MetricCard
            label="Battery"
            value={systemStatus.battery}
            color={colors.success}
            icon={<Feather name="battery-charging" size={12} color={colors.success} />}
          />
          <MetricCard
            label="Storage"
            value={systemStatus.storage.used}
            maxValue={systemStatus.storage.total}
            unit={` / ${systemStatus.storage.total}GB`}
            color={colors.warning}
            icon={<Feather name="hard-drive" size={12} color={colors.warning} />}
          />
        </View>
      </View>

      {/* Network */}
      <GlassCard style={styles.networkCard} padding={14}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>NETWORK</Text>
        <View style={styles.networkRow}>
          <View style={styles.networkStat}>
            <Feather name="arrow-up" size={16} color={colors.primary} />
            <Text style={[styles.networkValue, { color: colors.foreground }]}>
              {systemStatus.network.upload}
            </Text>
            <Text style={[styles.networkUnit, { color: colors.mutedForeground }]}>MB/s</Text>
          </View>
          <View style={[styles.networkDivider, { backgroundColor: colors.border }]} />
          <View style={styles.networkStat}>
            <Feather name="arrow-down" size={16} color={colors.cyan} />
            <Text style={[styles.networkValue, { color: colors.foreground }]}>
              {systemStatus.network.download}
            </Text>
            <Text style={[styles.networkUnit, { color: colors.mutedForeground }]}>MB/s</Text>
          </View>
        </View>
      </GlassCard>

      {/* Running Agents */}
      <GlassCard padding={14}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>RUNNING AGENTS</Text>
          <TouchableOpacity onPress={() => router.push("/agents" as any)} activeOpacity={0.7}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.agentChips}>
          {systemStatus.runningAgents.map((agent) => (
            <View
              key={agent}
              style={[styles.agentChip, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
            >
              <View style={[styles.chipDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.chipText, { color: colors.foreground }]}>{agent}</Text>
            </View>
          ))}
          {systemStatus.workflowQueue > 0 && (
            <View style={[styles.agentChip, { backgroundColor: colors.warning + "22", borderColor: colors.warning + "44" }]}>
              <Feather name="clock" size={10} color={colors.warning} />
              <Text style={[styles.chipText, { color: colors.warning }]}>
                +{systemStatus.workflowQueue} queued
              </Text>
            </View>
          )}
        </View>
      </GlassCard>

      {/* Quick Links */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>QUICK ACCESS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {QUICK_LINKS.map((link) => (
          <TouchableOpacity
            key={link.label}
            style={[styles.quickLink, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(link.path as any)}
            activeOpacity={0.7}
          >
            <Feather name={link.icon as any} size={20} color={colors.primary} />
            <Text style={[styles.quickLinkText, { color: colors.foreground }]}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recent Activity */}
      <View style={styles.rowBetween}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>RECENT ACTIVITY</Text>
      </View>
      <GlassCard padding={0} style={{ overflow: "hidden" }}>
        {systemStatus.recentActivity.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.activityItem,
              idx < systemStatus.recentActivity.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={[styles.activityIcon, { backgroundColor: colors.muted }]}>
              <Feather
                name={(ACTIVITY_ICONS[item.type] as any) ?? "circle"}
                size={13}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.activityText, { color: colors.foreground, flex: 1 }]}>
              {item.action}
            </Text>
            <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>{item.time}</Text>
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  datetime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  aiIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  aiDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  aiLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  metricsGrid: { gap: 10 },
  metricRow: { flexDirection: "row", gap: 10 },
  networkCard: {},
  cardLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  networkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  networkStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  networkValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  networkUnit: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  networkDivider: {
    width: 1,
    height: 30,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAll: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  agentChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  agentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  quickLink: {
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 80,
  },
  quickLinkText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activityText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  activityTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
