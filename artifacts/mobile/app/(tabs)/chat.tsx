import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
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

const AI_RESPONSES = [
  "I'm analyzing your Lifestyle Energy metrics. Your optimal work windows appear to be 9-11 AM and 3-5 PM based on recent data.",
  "The PAI Core agent has processed your request. Research synthesis is underway — expect results within 2 minutes.",
  "Based on your current system load, I recommend deferring the automation pipeline by 30 minutes to optimize CPU usage.",
  "Memory consolidation is complete. I've indexed 47 new entries across 5 knowledge categories.",
  "Your project 'Lifestyle Energy Dashboard' is 72% complete. Next milestone: API integration layer. Estimated completion: 3 days.",
  "I've identified 3 research papers highly relevant to your current project. Shall I compile a synthesis report?",
  "Automation pipeline 'Daily Research Digest' executed successfully. Summary ready in your Reports section.",
  "System health is optimal. CPU: 34%, RAM: 52%, Storage: 67%. All agents operating within normal parameters.",
];

let responseIdx = 0;

function getNextResponse(): string {
  const r = AI_RESPONSES[responseIdx % AI_RESPONSES.length];
  responseIdx++;
  return r;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "0",
    role: "assistant",
    content: "Hello! I'm PAI — your Personal AI. I have full access to your agents, projects, and system data. How can I assist you today?",
    timestamp: "now",
  },
];

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const paddingTop = isWeb ? insets.top + 67 : insets.top + 16;

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getNextResponse(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [aiMsg, ...prev]);
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1200 + Math.random() * 800);
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
          <View style={[styles.aiAvatar, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" }]}>
            <Text style={[styles.aiAvatarText, { color: colors.primary }]}>AI</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>PAI Assistant</Text>
            <View style={styles.statusRow}>
              <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.success }]}>Online · GPT-4o</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.clearBtn, { backgroundColor: colors.muted }]}
          onPress={() => {
            setMessages(INITIAL_MESSAGES);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        inverted
        contentContainerStyle={{ paddingVertical: 16, gap: 4 }}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isTyping ? (
            <View style={[styles.typingRow, { paddingHorizontal: 16 }]}>
              <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.typingDots, { color: colors.mutedForeground }]}>●●●</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: isWeb ? 34 + insets.bottom : insets.bottom + 84 + 8,
          },
        ]}
      >
        <View style={[styles.inputWrapper, { backgroundColor: colors.muted, borderColor: colors.border }]}>
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
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: input.trim() ? colors.primary : colors.accent },
            ]}
            onPress={sendMessage}
            activeOpacity={0.7}
            disabled={!input.trim() || isTyping}
          >
            <Feather name="send" size={16} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />
          </TouchableOpacity>
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
  typingRow: {
    marginBottom: 8,
  },
  typingBubble: {
    alignSelf: "flex-start",
    marginLeft: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  typingDots: {
    fontSize: 10,
    letterSpacing: 4,
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
