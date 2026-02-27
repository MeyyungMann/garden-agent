"use server";

import { db } from "@/lib/db";
import { createLogger } from "@/lib/logger";

const log = createLogger("actions:chat");

interface ChatMessageInput {
  role: string;
  content: string;
  toolCalls?: unknown;
  toolResults?: unknown;
}

// ── Session CRUD ──

export async function createSession(title?: string) {
  log.debug("createSession called", { title });
  try {
    const session = await db.chatSession.create({
      data: { title: title ?? "New Chat" },
    });
    log.info("Session created", { id: session.id });
    return session;
  } catch (error) {
    log.error("Failed to create session", { error });
    throw new Error("Failed to create session");
  }
}

export async function getLatestSession() {
  log.debug("getLatestSession called");
  try {
    const session = await db.chatSession.findFirst({
      where: { messages: { some: {} } },
      orderBy: { updatedAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    log.info("Latest session retrieved", {
      id: session?.id ?? null,
      messageCount: session?.messages.length ?? 0,
    });
    return session;
  } catch (error) {
    log.error("Failed to get latest session", { error });
    throw new Error("Failed to get latest session");
  }
}

export async function saveMessage(sessionId: string, message: ChatMessageInput) {
  log.debug("saveMessage called", { sessionId, role: message.role });
  try {
    const saved = await db.chatMessage.create({
      data: {
        sessionId,
        role: message.role,
        content: message.content,
        toolCalls: message.toolCalls ?? undefined,
        toolResults: message.toolResults ?? undefined,
      },
    });

    // Touch the session updatedAt
    await db.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    log.info("Message saved", { id: saved.id });
    return saved;
  } catch (error) {
    log.error("Failed to save message", { error });
    throw new Error("Failed to save message");
  }
}

export async function updateSessionSummary(sessionId: string, summary: string) {
  log.debug("updateSessionSummary called", { sessionId });
  try {
    await db.chatSession.update({
      where: { id: sessionId },
      data: { summary },
    });
    log.info("Session summary updated", { sessionId });
  } catch (error) {
    log.error("Failed to update session summary", { error });
    throw new Error("Failed to update session summary");
  }
}

const SUMMARY_THRESHOLD = 20;
const RECENT_MESSAGE_COUNT = 10;
const RESUMMARIZE_INTERVAL = 10;

export async function getSessionContext(sessionId: string) {
  log.debug("getSessionContext called", { sessionId });

  const session = await db.chatSession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) throw new Error("Session not found");

  const allMessages = session.messages;
  const total = allMessages.length;

  // If few messages, return all as-is
  if (total <= SUMMARY_THRESHOLD) {
    return {
      summary: session.summary ?? null,
      recentMessages: allMessages,
      needsSummarization: false,
    };
  }

  // Many messages — split into old + recent
  const recentMessages = allMessages.slice(-RECENT_MESSAGE_COUNT);
  const olderMessages = allMessages.slice(0, -RECENT_MESSAGE_COUNT);

  // Check if we need to re-summarize
  // We need a summary if there isn't one, or if 10+ new older messages since last summary
  const needsSummarization =
    !session.summary || olderMessages.length % RESUMMARIZE_INTERVAL < 2;

  return {
    summary: session.summary ?? null,
    recentMessages,
    needsSummarization,
    olderMessages: needsSummarization ? olderMessages : undefined,
  };
}

export async function summarizeMessages(
  messages: { role: string; content: string }[]
): Promise<string> {
  log.info("summarizeMessages called", { count: messages.length });

  const baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const modelName = process.env.OLLAMA_MODEL || "qwen2.5";

  const conversationText = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const response = await fetch(`${baseURL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content:
              "You are a summarizer. Summarize the following conversation concisely, preserving key facts, decisions, and context. Keep it under 500 words. Focus on what the user asked for and what was done.",
          },
          {
            role: "user",
            content: `Summarize this conversation:\n\n${conversationText}`,
          },
        ],
        stream: false,
      }),
    });

    const data = await response.json();
    const summary = data.message?.content ?? "No summary generated.";
    log.info("Summary generated", { length: summary.length });
    return summary;
  } catch (error) {
    log.error("Failed to summarize messages", { error });
    return "Previous conversation context (summary unavailable).";
  }
}

