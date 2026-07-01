import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AgentCard from "@/components/AgentCard";
import { useApp } from "@/context/AppContext";
import type { Agent } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type FilterStatus = "all" | Agent["status"];

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Idle", value: "idle" },
  { label: "Stopped", value: "stopped" },
];

export default function AgentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { agents, updateAgentStatus } = useApp();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const isWeb = Platform.OS === "web";

  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;
  const paddingBottom = isWeb ? 34 + 84 : 84 + 16;

  const filtered = filter === "all" ? agents : agents.filter((a) => a.status === filter);

  const runningCount = agents.filter((a) => a.status === "running").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;

  const handleExecute = (id: string) => {
    updateAgentStatus(id, "running");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleStop = (id: string) => {
    updateAgentStatus(id, "idle");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[styles.header, { paddingTop, borderBottomColor: colors.border }]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Agent Manager</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {runningCount} running · {idleCount} idle
          </Text>
        </View>
        <View style={[styles.statBadge, { backgroundColor: colors.primary + "22" }]}>
          <Feather name="cpu" size={14} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.primary }]}>{agents.length}</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterBtn,
                isActive && { backgroundColor: colors.primary + "22" },
              ]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? colors.primary : colors.mutedForeground },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => (
          <AgentCard agent={item} onExecute={handleExecute} onStop={handleStop} />
        )}
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          paddingBottom,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="cpu" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No agents match this filter
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
