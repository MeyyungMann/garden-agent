"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { createLogger } from "@/lib/logger";
import {
  createSession,
  getLatestSession,
  saveMessage,
  getSessionContext,
  summarizeMessages,
  updateSessionSummary,
} from "@/actions/chat";

const log = createLogger("hooks:chat-agent");

const ROUTE_MAP: Record<string, string> = {
  dashboard: "/",
  plants: "/plants",
  seeds: "/seeds",
  garden: "/garden",
  calendar: "/calendar",
  chat: "/chat",
};

export type SessionState = "loading" | "active";

export function useChatAgent() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [summary, setSummary] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const savedMessageIds = useRef(new Set<string>());
  const messageCountSinceSummary = useRef(0);
  const transportRef = useRef(
    new DefaultChatTransport({
      api: "/api/chat",
      body: { summary: null as string | null },
    })
  );

  // Keep ref in sync with state
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Auto-start a new session on mount
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        // Check if history exists
        const latest = await getLatestSession();
        if (!cancelled) {
          setHasHistory(!!latest && latest.messages.length > 0);
        }

        // Always start fresh
        const session = await createSession();
        if (!cancelled) {
          setSessionId(session.id);
          sessionIdRef.current = session.id;
          setSessionState("active");
          log.info("New chat session created on mount", { sessionId: session.id });
        }
      } catch (e) {
        log.error("Failed to initialize chat", { error: e });
        if (!cancelled) setSessionState("active");
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // Update transport body when summary changes
  useEffect(() => {
    transportRef.current = new DefaultChatTransport({
      api: "/api/chat",
      body: { summary },
    });
  }, [summary]);

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

  // Auto-save messages to DB — runs whenever messages change and not streaming
  useEffect(() => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;
    if (chat.status === "streaming" || chat.status === "submitted") return;

    const msgs = chat.messages;
    let newCount = 0;

    for (const msg of msgs) {
      if (savedMessageIds.current.has(msg.id)) continue;

      const textContent = msg.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("\n") || "";

      if (!textContent) continue;

      savedMessageIds.current.add(msg.id);
      newCount++;

      saveMessage(currentSessionId, {
        role: msg.role,
        content: textContent,
      }).catch((e) => {
        log.error("Failed to auto-save message", { error: e });
        savedMessageIds.current.delete(msg.id);
      });
    }

    if (newCount > 0) {
      log.info("Auto-saved messages", { count: newCount, sessionId: currentSessionId });
      messageCountSinceSummary.current += newCount;
      if (messageCountSinceSummary.current >= 10 && msgs.length > 20) {
        triggerSummarization();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.messages, chat.status]);

  const triggerSummarization = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    try {
      const context = await getSessionContext(sid);
      if (context.needsSummarization && context.olderMessages) {
        const newSummary = await summarizeMessages(
          context.olderMessages.map((m) => ({ role: m.role, content: m.content }))
        );
        await updateSessionSummary(sid, newSummary);
        setSummary(newSummary);
        messageCountSinceSummary.current = 0;
        log.info("Session re-summarized");
      }
    } catch (e) {
      log.error("Failed to re-summarize", { error: e });
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const latest = await getLatestSession();
      if (!latest || latest.messages.length === 0) {
        log.info("No history to load");
        setIsLoadingHistory(false);
        return;
      }

      setSessionId(latest.id);
      sessionIdRef.current = latest.id;

      // Load context with possible summarization
      const context = await getSessionContext(latest.id);

      if (context.needsSummarization && context.olderMessages) {
        log.info("Summarizing older messages on load");
        const newSummary = await summarizeMessages(
          context.olderMessages.map((m) => ({ role: m.role, content: m.content }))
        );
        await updateSessionSummary(latest.id, newSummary);
        setSummary(newSummary);
      } else {
        setSummary(context.summary);
      }

      // Convert DB messages to UIMessage format
      const uiMessages = context.recentMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        parts: [{ type: "text" as const, text: m.content }],
      }));

      // Mark these as already saved so we don't re-save them
      for (const m of uiMessages) {
        savedMessageIds.current.add(m.id);
      }

      chat.setMessages(uiMessages);
      messageCountSinceSummary.current = 0;
      setHasHistory(false); // hide button after loading
      log.info("History loaded", {
        sessionId: latest.id,
        messageCount: uiMessages.length,
        hasSummary: !!context.summary,
      });
    } catch (e) {
      log.error("Failed to load history", { error: e });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [chat]);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    const message = input;
    setInput("");
    chat.sendMessage({ text: message });
  }, [input, chat]);

  const clearMessages = useCallback(async () => {
    chat.setMessages([]);
    setSummary(null);
    savedMessageIds.current = new Set();
    messageCountSinceSummary.current = 0;

    // Start a fresh session
    try {
      const session = await createSession();
      setSessionId(session.id);
      sessionIdRef.current = session.id;
      // Re-check for history
      const latest = await getLatestSession();
      setHasHistory(!!latest && latest.messages.length > 0);
    } catch (e) {
      log.error("Failed to create new session after clear", { error: e });
    }

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
    // Session management
    sessionId,
    sessionState,
    summary,
    hasHistory,
    isLoadingHistory,
    loadHistory,
  };
}
