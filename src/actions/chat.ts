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

export async function saveChatMessages(messages: ChatMessageInput[]) {
  log.debug("saveChatMessages called", { count: messages.length });
  try {
    const data = messages.map((m) => ({
      role: m.role,
      content: m.content,
      toolCalls: m.toolCalls ?? undefined,
      toolResults: m.toolResults ?? undefined,
    }));

    await db.chatMessage.createMany({ data });
    log.info("Chat messages saved", { count: messages.length });
  } catch (error) {
    log.error("Failed to save chat messages", { error });
    throw new Error("Failed to save chat messages");
  }
}

export async function getChatHistory(limit: number = 50) {
  log.debug("getChatHistory called", { limit });
  try {
    const messages = await db.chatMessage.findMany({
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    log.info("Chat history retrieved", { count: messages.length });
    return messages;
  } catch (error) {
    log.error("Failed to get chat history", { error });
    throw new Error("Failed to get chat history");
  }
}

export async function clearChatHistory() {
  log.debug("clearChatHistory called");
  try {
    const result = await db.chatMessage.deleteMany();
    log.info("Chat history cleared", { deletedCount: result.count });
  } catch (error) {
    log.error("Failed to clear chat history", { error });
    throw new Error("Failed to clear chat history");
  }
}
