import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

const SYSTEM_PROMPT = `You are PAI — a Personal AI assistant embedded in an AI OS interface for the Lifestyle Energy ecosystem. You have access to the user's system metrics, running agents, projects, and lifestyle data.

Your personality:
- Intelligent, concise, and futuristic — like a next-gen OS assistant
- You give actionable insights, not generic answers
- You reference the user's actual system context when relevant
- You can discuss agents (PAI Core, Research, Memory, Automation, Energy, Content, Device Optimizer), projects, energy tracking, automations, and research

When given system metrics, reference them naturally in your responses. Be helpful, smart, and direct. Keep responses focused — no unnecessary filler.`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  model: "gpt" | "deepseek";
  systemContext?: string;
}

router.post("/chat", async (req, res) => {
  const { messages, model, systemContext } = req.body as ChatRequestBody;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const systemMessage = systemContext
    ? `${SYSTEM_PROMPT}\n\nCurrent system context:\n${systemContext}`
    : SYSTEM_PROMPT;

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemMessage },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    if (model === "deepseek") {
      const stream = await deepseekClient.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324",
        max_tokens: 8192,
        messages: chatMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
    } else {
      const stream = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 8192,
        messages: chatMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI request failed";
    req.log.error({ err }, "Chat streaming error");
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message, done: true })}\n\n`);
      res.end();
    }
  }
});

export default router;
