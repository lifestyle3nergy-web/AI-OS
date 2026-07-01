import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassCard from "@/components/GlassCard";
import { useColors } from "@/hooks/useColors";

interface ResearchItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  relevance: number;
  tags: string[];
  timestamp: string;
}

const MOCK_RESEARCH: ResearchItem[] = [
  {
    id: "1",
    title: "Optimal Cognitive Performance Windows",
    summary:
      "Circadian rhythms govern peak performance windows. Most individuals experience 2-3 high-performance windows per day lasting 90-120 minutes each.",
    source: "Nature Neuroscience",
    relevance: 94,
    tags: ["cognition", "energy", "lifestyle"],
    timestamp: "2h ago",
  },
  {
    id: "2",
    title: "AI Agent Coordination in Multi-Task Environments",
    summary:
      "Novel approaches to agent orchestration demonstrate 40% efficiency gains when agents share a unified memory layer.",
    source: "arXiv: 2506.12847",
    relevance: 91,
    tags: ["ai", "agents", "multi-task"],
    timestamp: "5h ago",
  },
  {
    id: "3",
    title: "Retrieval-Augmented Generation at Scale",
    summary:
      "RAG pipelines with hierarchical indexing outperform flat retrieval by 2.3x on knowledge-intensive tasks.",
    source: "DeepMind Technical Report",
    relevance: 88,
    tags: ["rag", "memory", "llm"],
    timestamp: "Yesterday",
  },
  {
    id: "4",
    title: "Lifestyle Biomarkers and Productivity Correlation",
    summary:
      "Sleep quality, hydration, and movement frequency collectively account for 68% of variance in self-reported productivity scores.",
    source: "Journal of Applied Physiology",
    relevance: 82,
    tags: ["lifestyle", "health", "productivity"],
    timestamp: "2d ago",
  },
];

const TOPICS = ["All", "AI", "Energy", "Memory", "Lifestyle", "Systems"];

export default function ResearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");
  const [searching, setSearching] = useState(false);
  const isWeb = Platform.OS === "web";
  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;

  const filtered = MOCK_RESEARCH.filter(
    (r) =>
      (topic === "All" || r.tags.some((t) => t.toLowerCase().includes(topic.toLowerCase()))) &&
      (query === "" || r.title.toLowerCase().includes(query.toLowerCase()) || r.summary.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => setSearching(false), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Research Hub</Text>
        <View style={[styles.badge, { backgroundColor: colors.cyan + "22" }]}>
          <Feather name="search" size={14} color={colors.cyan} />
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchInput, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchText, { color: colors.foreground }]}
            placeholder="Search papers, topics..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: searching ? colors.warning : colors.cyan }]}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <Feather name={searching ? "loader" : "zap"} size={16} color="#080810" />
        </TouchableOpacity>
      </View>

      {/* Topic filters */}
      <FlatList
        horizontal
        data={TOPICS}
        keyExtractor={(t) => t}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isActive = topic === item;
          return (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: isActive ? colors.cyan + "22" : colors.muted }]}
              onPress={() => setTopic(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: isActive ? colors.cyan : colors.mutedForeground }]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 0 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: isWeb ? 34 : 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GlassCard>
            <View style={styles.researchHeader}>
              <Text style={[styles.researchTitle, { color: colors.foreground, flex: 1 }]}>{item.title}</Text>
              <View style={[styles.relevanceBadge, { backgroundColor: colors.cyan + "22" }]}>
                <Text style={[styles.relevanceText, { color: colors.cyan }]}>{item.relevance}%</Text>
              </View>
            </View>
            <Text style={[styles.summary, { color: colors.mutedForeground }]}>{item.summary}</Text>
            <View style={styles.researchFooter}>
              <View style={styles.tags}>
                {item.tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.tagText, { color: colors.mutedForeground }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.sourceLine}>
              <Feather name="file-text" size={12} color={colors.mutedForeground} />
              <Text style={[styles.sourceText, { color: colors.mutedForeground }]}>{item.source}</Text>
              <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>{item.timestamp}</Text>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 10 },
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  badge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  searchInput: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  searchText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  searchBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  researchHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  researchTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  relevanceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  relevanceText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  summary: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 10 },
  researchFooter: { flexDirection: "row", alignItems: "center" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  sourceLine: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  sourceText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular" },
  timestamp: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 14 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
