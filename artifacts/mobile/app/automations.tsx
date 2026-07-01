import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassCard from "@/components/GlassCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function AutomationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { automations, toggleAutomation } = useApp();
  const isWeb = Platform.OS === "web";
  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;

  const enabledCount = automations.filter((a) => a.enabled).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Automations</Text>
        <View style={[styles.badge, { backgroundColor: colors.warning + "22" }]}>
          <Text style={[styles.badgeText, { color: colors.warning }]}>{enabledCount}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
        {[
          { label: "Active", value: enabledCount, color: colors.success },
          { label: "Paused", value: automations.length - enabledCount, color: colors.mutedForeground },
          { label: "Total Runs", value: automations.reduce((acc, a) => acc + a.runCount, 0), color: colors.cyan },
        ].map((s) => (
          <View key={s.label} style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={automations}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: isWeb ? 34 : 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GlassCard>
            <View style={styles.autoHeader}>
              <View
                style={[
                  styles.autoIcon,
                  { backgroundColor: item.enabled ? colors.warning + "22" : colors.muted },
                ]}
              >
                <Feather
                  name="zap"
                  size={16}
                  color={item.enabled ? colors.warning : colors.mutedForeground}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.autoName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.autoTrigger, { color: colors.mutedForeground }]}>
                  <Feather name="clock" size={10} color={colors.mutedForeground} /> {item.trigger}
                </Text>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={() => {
                  toggleAutomation(item.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: colors.muted, true: colors.warning + "66" }}
                thumbColor={item.enabled ? colors.warning : colors.mutedForeground}
              />
            </View>

            <Text style={[styles.autoDesc, { color: colors.mutedForeground }]}>
              {item.description}
            </Text>

            <View style={styles.autoFooter}>
              <View style={styles.autoStat}>
                <Feather name="play-circle" size={12} color={colors.mutedForeground} />
                <Text style={[styles.autoStatText, { color: colors.mutedForeground }]}>
                  {item.runCount} runs
                </Text>
              </View>
              <View style={styles.autoStat}>
                <Feather name="refresh-cw" size={12} color={colors.mutedForeground} />
                <Text style={[styles.autoStatText, { color: colors.mutedForeground }]}>
                  Last: {item.lastRun}
                </Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: item.enabled ? colors.success + "22" : colors.muted }]}>
                <Text style={[styles.statusPillText, { color: item.enabled ? colors.success : colors.mutedForeground }]}>
                  {item.enabled ? "Active" : "Paused"}
                </Text>
              </View>
            </View>
          </GlassCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  autoHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  autoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  autoName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  autoTrigger: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  autoDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 10 },
  autoFooter: { flexDirection: "row", alignItems: "center", gap: 12 },
  autoStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  autoStatText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusPill: {
    marginLeft: "auto" as any,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
