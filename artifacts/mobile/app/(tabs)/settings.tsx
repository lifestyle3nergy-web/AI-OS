import { Feather } from "@expo/vector-icons";
import React from "react";
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

const VERSION = "1.0.0";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  accent?: string;
}

function SettingRow({ icon, label, value, rightContent, onPress, accent }: SettingRowProps) {
  const colors = useColors();
  const iconColor = accent ?? colors.primary;
  const content = (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + "22" }]}>
        <Feather name={icon as any} size={16} color={iconColor} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>}
        {rightContent}
        {onPress && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
      </View>
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;
  const paddingBottom = isWeb ? 34 + 84 : 84 + 24;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop, paddingBottom, gap: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile */}
      <View style={styles.profileSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "33", borderColor: colors.primary + "55" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>LE</Text>
        </View>
        <View>
          <Text style={[styles.profileName, { color: colors.foreground }]}>Lifestyle Energy</Text>
          <Text style={[styles.profileRole, { color: colors.mutedForeground }]}>AI OS Admin · Pro Plan</Text>
        </View>
      </View>

      {/* System */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SYSTEM</Text>
        <GlassCard padding={0}>
          <SettingRow icon="cpu" label="AI Model" value="GPT-4o" />
          <SettingRow icon="server" label="API Endpoint" value="localhost:5000" accent={colors.cyan} />
          <SettingRow icon="database" label="Database" value="SQLite" />
          <SettingRow icon="activity" label="Telemetry" value="Active" accent={colors.success} />
        </GlassCard>
      </View>

      {/* Agents */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AGENTS</Text>
        <GlassCard padding={0}>
          <SettingRow icon="refresh-cw" label="Auto-restart on crash" value="On" accent={colors.success} />
          <SettingRow icon="sliders" label="Max concurrent agents" value="5" />
          <SettingRow icon="clock" label="Task timeout" value="30s" />
        </GlassCard>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NOTIFICATIONS</Text>
        <GlassCard padding={0}>
          <SettingRow icon="bell" label="Push notifications" value="On" accent={colors.success} />
          <SettingRow icon="alert-circle" label="Error alerts" value="On" accent={colors.error} />
          <SettingRow icon="check-circle" label="Task completion" value="Off" accent={colors.mutedForeground} />
        </GlassCard>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PRIVACY & SECURITY</Text>
        <GlassCard padding={0}>
          <SettingRow icon="lock" label="Local encryption" value="AES-256" accent={colors.cyan} />
          <SettingRow icon="shield" label="Biometric lock" value="Off" />
          <SettingRow icon="eye-off" label="Privacy mode" value="Off" />
        </GlassCard>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ABOUT</Text>
        <GlassCard padding={0}>
          <SettingRow icon="info" label="Version" value={`AI OS v${VERSION}`} />
          <SettingRow icon="globe" label="Lifestyle Energy" value="lse.io" accent={colors.cyan} />
          <SettingRow icon="file-text" label="Licenses" onPress={() => {}} />
        </GlassCard>
      </View>

      {/* Reset */}
      <View style={[styles.section, { paddingHorizontal: 16 }]}>
        <TouchableOpacity
          style={[styles.resetBtn, { backgroundColor: colors.error + "18", borderColor: colors.error + "44" }]}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={16} color={colors.error} />
          <Text style={[styles.resetText, { color: colors.error }]}>Reset All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  profileRole: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  resetText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
