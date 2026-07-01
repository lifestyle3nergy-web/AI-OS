import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import { useApp } from "@/context/AppContext";
import type { MemoryEntry } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["all", "knowledge", "task", "insight", "personal", "system"];
const IMPORTANCE_COLORS = { low: "#6E6E8E", medium: "#FFB347", high: "#CF6679" };

export default function MemoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { memories, addMemory, deleteMemory } = useApp();
  const [category, setCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("knowledge");
  const [newImportance, setNewImportance] = useState<MemoryEntry["importance"]>("medium");
  const isWeb = Platform.OS === "web";

  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;

  const filtered = category === "all" ? memories : memories.filter((m) => m.category === category);

  const handleCreate = () => {
    if (!newContent.trim()) return;
    addMemory({ content: newContent.trim(), category: newCategory, importance: newImportance });
    setNewContent("");
    setShowModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const IMPORTANCE_OPTIONS: MemoryEntry["importance"][] = ["low", "medium", "high"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Memory Manager</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isActive = category === item;
          return (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: isActive ? colors.primary + "22" : colors.muted }]}
              onPress={() => setCategory(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: isActive ? colors.primary : colors.mutedForeground }]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        }}
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 0 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: isWeb ? 34 : 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const impColor = IMPORTANCE_COLORS[item.importance];
          return (
            <View style={[styles.memoryCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: impColor }]}>
              <View style={styles.memoryHeader}>
                <View style={[styles.catBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.catText, { color: colors.mutedForeground }]}>{item.category}</Text>
                </View>
                <View style={[styles.impBadge, { backgroundColor: impColor + "22" }]}>
                  <Text style={[styles.impText, { color: impColor }]}>{item.importance}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    deleteMemory(item.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                  style={styles.delBtn}
                >
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.memoryContent, { color: colors.foreground }]}>{item.content}</Text>
              <Text style={[styles.memoryTime, { color: colors.mutedForeground }]}>{item.timestamp}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="database" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No memories stored</Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
              onPress={() => setShowModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.emptyBtnText, { color: colors.primary }]}>Add first memory</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Memory</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Memory content..."
              placeholderTextColor={colors.mutedForeground}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              autoFocus
            />
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
            <View style={styles.optionRow}>
              {["knowledge", "task", "insight", "personal", "system"].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.optionBtn, { backgroundColor: newCategory === c ? colors.primary + "22" : colors.muted }]}
                  onPress={() => setNewCategory(c)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, { color: newCategory === c ? colors.primary : colors.mutedForeground }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Importance</Text>
            <View style={styles.optionRow}>
              {IMPORTANCE_OPTIONS.map((imp) => (
                <TouchableOpacity
                  key={imp}
                  style={[styles.optionBtn, { backgroundColor: newImportance === imp ? IMPORTANCE_COLORS[imp] + "22" : colors.muted }]}
                  onPress={() => setNewImportance(imp)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, { color: newImportance === imp ? IMPORTANCE_COLORS[imp] : colors.mutedForeground }]}>{imp}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.muted }]} onPress={() => setShowModal(false)} activeOpacity={0.7}>
                <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleCreate} activeOpacity={0.8}>
                <Text style={[styles.modalBtnText, { color: colors.primaryForeground }]}>Save</Text>
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
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 10 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  memoryCard: { borderRadius: 16, padding: 14, borderWidth: 1, borderLeftWidth: 3, gap: 8 },
  memoryHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  impBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  impText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  delBtn: { marginLeft: "auto" as any },
  memoryContent: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  memoryTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 14 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14, borderWidth: 1, borderBottomWidth: 0 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  textArea: { borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", borderWidth: 1, minHeight: 100, textAlignVertical: "top" },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  optionText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  modalBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
