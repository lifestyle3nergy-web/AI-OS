import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Agent } from "@/context/AppContext";

interface AgentCardProps {
  agent: Agent;
  onExecute: (id: string) => void;
  onStop: (id: string) => void;
}

const STATUS_COLORS: Record<Agent["status"], string> = {
  running: "#4ECDC4",
  idle: "#BB86FC",
  stopped: "#6E6E8E",
  error: "#CF6679",
};

const STATUS_LABELS: Record<Agent["status"], string> = {
  running: "Running",
  idle: "Idle",
  stopped: "Stopped",
  error: "Error",
};

export default function AgentCard({ agent, onExecute, onStop }: AgentCardProps) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[agent.status];

  const handleExecute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onExecute(agent.id);
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStop(agent.id);
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.name, { color: colors.foreground }]}>
            {agent.name}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[agent.status]}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        {agent.description}
      </Text>

      <View style={styles.capabilities}>
        {agent.capabilities.map((cap) => (
          <View
            key={cap}
            style={[styles.cap, { backgroundColor: colors.muted }]}
          >
            <Text style={[styles.capText, { color: colors.mutedForeground }]}>
              {cap}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Feather name="check-circle" size={12} color={colors.secondary} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {agent.tasksCompleted} tasks
          </Text>
        </View>
        <View style={styles.stat}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {agent.uptime}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
          onPress={handleExecute}
          activeOpacity={0.7}
          disabled={agent.status === "running"}
        >
          <Feather name="play" size={13} color={colors.primary} />
          <Text style={[styles.btnText, { color: colors.primary }]}>Execute</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.muted, borderColor: colors.border }]}
          onPress={handleStop}
          activeOpacity={0.7}
          disabled={agent.status !== "running"}
        >
          <Feather name="square" size={13} color={colors.mutedForeground} />
          <Text style={[styles.btnText, { color: colors.mutedForeground }]}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  capabilities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  cap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  capText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  stats: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  btnPrimary: {},
  btnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
