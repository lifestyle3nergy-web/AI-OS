import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const colors = useColors();
  const isUser = message.role === "user";

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primary + "33", borderColor: colors.primary + "55" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>AI</Text>
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser
          ? { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }
          : { backgroundColor: colors.card, borderColor: colors.border },
        { maxWidth: "80%" },
      ]}>
        <Text style={[styles.text, { color: colors.foreground }]}>{message.content}</Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{message.timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: "flex-end",
    gap: 8,
  },
  wrapperUser: {
    justifyContent: "flex-end",
  },
  wrapperAssistant: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  bubble: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  text: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
