import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProjectCard from "@/components/ProjectCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, addProject, deleteProject } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const isWeb = Platform.OS === "web";

  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;
  const paddingBottom = isWeb ? 34 + 84 : 84 + 16;

  const activeCount = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  const handleCreate = () => {
    if (!newName.trim()) return;
    addProject({
      name: newName.trim(),
      description: newDesc.trim() || "No description",
      status: "active",
      progress: 0,
      tags: [],
    });
    setNewName("");
    setNewDesc("");
    setShowModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Project", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteProject(id),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Projects</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {activeCount} active · {completedCount} completed
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
        {[
          { label: "Total", value: projects.length, color: colors.foreground },
          { label: "Active", value: activeCount, color: colors.cyan },
          { label: "Done", value: completedCount, color: colors.success },
          { label: "Pending", value: projects.filter((p) => p.status === "pending").length, color: colors.warning },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <ProjectCard project={item} onDelete={handleDelete} />
        )}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="folder" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No projects yet
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
              onPress={() => setShowModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.emptyBtnText, { color: colors.primary }]}>Create your first project</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Project</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Project name"
              placeholderTextColor={colors.mutedForeground}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreate}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnText, { color: colors.primaryForeground }]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", paddingTop: 80, gap: 14 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  modalInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  modalTextArea: { minHeight: 80, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
