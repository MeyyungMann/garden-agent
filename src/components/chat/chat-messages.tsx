"use client";

import type { UIMessage } from "ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { ToolResultCard } from "./tool-result-card";
import { Bot, User, Sprout, Package, MapPin, CalendarDays, Search } from "lucide-react";
import { ChatMessageSkeleton } from "@/components/ui/loading-skeleton";

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
  initialLoading?: boolean;
}

const examplePrompts = [
  { icon: Search, text: "Show me my tomato seeds" },
  { icon: Package, text: "Add 2 packets of basil seeds from Baker Creek" },
  { icon: CalendarDays, text: "What's planned for this season?" },
  { icon: MapPin, text: "Take me to the garden locations" },
  { icon: Sprout, text: "What plants do I have?" },
  { icon: Search, text: "Search for pepper varieties" },
];

export function ChatMessages({ messages, isLoading, initialLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (initialLoading) {
    return (
      <div className="flex-1">
        <ChatMessageSkeleton />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <Bot className="h-10 w-10 mx-auto text-green-600" />
          <h3 className="font-semibold text-lg">Garden AI Assistant</h3>
          <p className="text-sm text-muted-foreground">
            I can help you manage your plants, seeds, and garden. Try asking:
          </p>
          <div className="grid gap-2">
            {examplePrompts.map((prompt, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-muted-foreground rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
              >
                <prompt.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>&quot;{prompt.text}&quot;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-4 p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Bot className="h-4 w-4 animate-pulse" />
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  // Fallback: if parts is undefined or empty, render message content directly
  const hasParts = message.parts && message.parts.length > 0;

  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <Bot className="h-5 w-5 text-green-600" />
        </div>
      )}
      <div
        className={cn(
          "rounded-lg px-3 py-2 max-w-[85%] text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {hasParts
          ? message.parts.map((part, i) => {
              if (part.type === "text") {
                return <p key={i} className="whitespace-pre-wrap">{part.text}</p>;
              }
              if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
                const toolPart = part as unknown as {
                  type: string;
                  toolCallId: string;
                  toolName?: string;
                  state: string;
                  input?: unknown;
                  output?: unknown;
                };
                const toolName = toolPart.toolName ?? part.type.replace("tool-", "");
                return (
                  <ToolResultCard
                    key={i}
                    toolName={toolName}
                    state={toolPart.state}
                    args={(toolPart.input as Record<string, unknown>) ?? {}}
                    result={toolPart.output}
                  />
                );
              }
              return null;
            })
          : (
              <p className="whitespace-pre-wrap text-muted-foreground italic">
                (empty message)
              </p>
            )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
