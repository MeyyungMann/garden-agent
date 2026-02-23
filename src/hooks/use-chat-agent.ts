"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { createLogger } from "@/lib/logger";

const log = createLogger("hooks:chat-agent");

const ROUTE_MAP: Record<string, string> = {
  dashboard: "/",
  plants: "/plants",
  seeds: "/seeds",
  garden: "/garden",
  calendar: "/calendar",
  chat: "/chat",
};

export function useChatAgent() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const transportRef = useRef(new DefaultChatTransport({ api: "/api/chat" }));

  const chat = useChat({
    transport: transportRef.current,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "navigateTo") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args = (toolCall as any).args ?? (toolCall as any).input ?? {};
        const { page, plantId, seedId } = args as {
          page: string;
          plantId?: string;
          seedId?: string;
        };

        let path: string;
        if (plantId) {
          path = `/plants/${plantId}`;
        } else if (seedId) {
          path = `/seeds/${seedId}`;
        } else {
          path = ROUTE_MAP[page] || "/";
        }

        log.info("Navigating to", { path, page, plantId, seedId });
        router.push(path);
      }
    },
    onError: (error) => {
      log.error("Chat error", { error: error.message });
    },
  });

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    const message = input;
    setInput("");
    chat.sendMessage({ text: message });
  }, [input, chat]);

  const clearMessages = useCallback(() => {
    chat.setMessages([]);
    log.info("Chat messages cleared");
  }, [chat]);

  return {
    messages: chat.messages,
    input,
    setInput,
    handleSubmit,
    isLoading: chat.status === "streaming" || chat.status === "submitted",
    stop: chat.stop,
    status: chat.status,
    error: chat.error,
    clearMessages,
  };
}
