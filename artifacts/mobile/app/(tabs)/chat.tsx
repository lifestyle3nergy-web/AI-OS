import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatBubble, { Message } from "@/components/ChatBubble";
import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";

type AIModel = "gpt" | "deepseek";

const MODEL_OPTIONS: { id: AIModel; label: string; sublabel: string }[] = [
  { id: "gpt", label: "ChatGPT", sublabel: "GPT-4o" },
  { id: "deepseek", label: "DeepSeek", sublabel: "Free · V3" },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "0",
    role: "assistant",
    content:
      "Hello! I'm PAI — your Personal AI. I have full access to your agents, projects, and system data. How can I assist you today?",
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
];

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "/api";
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { systemStatus, agents, projects } = useAppContext();

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const abortRef = useRef<AbortController | null>(null);

  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;

  function buildSystemContext(): string {
    const runningAgents = agents
      .filter((a) => a.status === "running")
      .map((a) => a.name)
      .join(", ");
    const activeProjects = projects
      .filter((p) => p.status === "active")
      .map((p) => p.name)
      .join(", ");

    return [
      `CPU: ${systemStatus.cpu}%`,
      `RAM: ${systemStatus.ram}%`,
      `Battery: ${systemStatus.battery}%`,
      `Storage: ${systemStatus.storage.used}/${systemStatus.storage.total}GB`,
      `Network: ↑${systemStatus.network.upload}MB/s ↓${systemStatus.network.download}MB/s`,
      `AI Status: ${systemStatus.aiStatus}`,
      `Running Agents: ${runningAgents || "none"}`,
      `Active Projects: ${activeProjects || "none"}`,
      `Queued Workflows: ${systemStatus.workflowQueue}`,
    ].join("\n");
  }

  function buildApiMessages() {
    return [...messages]
      .reverse()
      .filter((m) => m.id !== "0")
      .map((m) => ({ role: m.role, content: m.content }));
  }

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const currentInput = input.trim();
    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setIsStreaming(true);

    const aiId = (Date.now() + 1).toString();
    setStreamingId(aiId);

    const streamingMsg: Message = {
      id: aiId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [streamingMsg, ...prev]);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const historyMessages = buildApiMessages();
      const body = JSON.stringify({
        messages: [
          ...historyMessages,
          { role: "user", content: currentInput },
        ],
        model: selectedModel,
        systemContext: buildSystemContext(),
      });

      const response = await fetch(`${getApiBase()}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: abort.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.done) break;
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              accumulated += parsed.content;
              const snapshot = accumulated;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId ? { ...m, content: snapshot } : m
                )
              );
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      const errMsg =
        err instanceof Error ? err.message : "Connection failed. Try again.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? { ...m, content: `⚠️ ${errMsg}` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setStreamingId(null);
      abortRef.current = null;
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamingId(null);
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerInfo}>
          <View
            style={[
              styles.aiAvatar,
              {
                backgroundColor: colors.primary + "22",
                borderColor: colors.primary + "55",
              },
            ]}
          >
            <Text style={[styles.aiAvatarText, { color: colors.primary }]}>
              AI
            </Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              PAI Assistant
            </Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: isStreaming
                      ? colors.warning
                      : colors.success,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isStreaming ? colors.warning : colors.success,
                  },
                ]}
              >
                {isStreaming
                  ? "Generating…"
                  : `Online · ${selectedModel === "gpt" ? "GPT-4o" : "DeepSeek V3"}`}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.clearBtn, { backgroundColor: colors.muted }]}
          onPress={clearChat}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Model selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.modelRow,
          { borderBottomColor: colors.border },
        ]}
      >
        {MODEL_OPTIONS.map((opt) => {
          const active = selectedModel === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.modelChip,
                {
                  backgroundColor: active
                    ? colors.primary + "22"
                    : colors.muted,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedModel(opt.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modelLabel,
                  { color: active ? colors.primary : colors.mutedForeground },
                ]}
              >
                {opt.label}
              </Text>
              <Text
                style={[styles.modelSublabel, { color: colors.mutedForeground }]}
              >
                {opt.sublabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            isStreaming={isStreaming && item.id === streamingId}
          />
        )}
        inverted
        contentContainerStyle={{ paddingVertical: 16, gap: 4 }}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: isWeb
              ? 34 + insets.bottom
              : insets.bottom + 84 + 8,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Message PAI..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            onSubmitEditing={sendMessage}
          />
          {isStreaming ? (
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: colors.destructive }]}
              onPress={stopStreaming}
              activeOpacity={0.7}
            >
              <Feather name="square" size={14} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: input.trim()
                    ? colors.primary
                    : colors.accent,
                },
              ]}
              onPress={sendMessage}
              activeOpacity={0.7}
              disabled={!input.trim()}
            >
              {isStreaming ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Feather
                  name="send"
                  size={16}
                  color={
                    input.trim()
                      ? colors.primaryForeground
                      : colors.mutedForeground
                  }
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
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
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatarText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modelRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  modelLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  modelSublabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  inputBar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 120,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
