import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Project } from "@/context/AppContext";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

const STATUS_COLORS: Record<Project["status"], string> = {
  active: "#4ECDC4",
  pending: "#FFB347",
  completed: "#BB86FC",
  paused: "#6E6E8E",
};

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[project.status];

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete(project.id);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={[styles.name, { color: colors.foreground }]}>{project.name}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + "22" }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleDelete} activeOpacity={0.7} style={styles.deleteBtn}>
          <Feather name="trash-2" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.desc, { color: colors.mutedForeground }]}>{project.description}</Text>

      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressBar,
              { width: `${project.progress}%` as any, backgroundColor: statusColor },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: statusColor }]}>{project.progress}%</Text>
      </View>

      <View style={styles.tags}>
        {project.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: colors.muted }]}>
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>#{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.date, { color: colors.mutedForeground }]}>
        Updated {project.updatedAt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  titleArea: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 20,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  deleteBtn: {
    padding: 4,
  },
  desc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    minWidth: 34,
    textAlign: "right",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  date: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
