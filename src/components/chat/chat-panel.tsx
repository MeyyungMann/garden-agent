"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatError } from "./chat-error";
import { useChatAgent } from "@/hooks/use-chat-agent";
import { Button } from "@/components/ui/button";
import { Trash2, Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import type { SessionState } from "@/hooks/use-chat-agent";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatContentProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose?: () => void;
  // Chat state passed from parent
  messages: UIMessage[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  stop: () => void;
  status: string;
  error: Error | undefined;
  clearMessages: () => void;
  sessionState: SessionState;
  summary: string | null;
  hasHistory: boolean;
  isLoadingHistory: boolean;
  loadHistory: () => void;
}

function ChatContent({
  isFullscreen,
  onToggleFullscreen,
  onClose,
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  stop,
  status,
  error,
  clearMessages,
  sessionState,
  summary,
  hasHistory,
  isLoadingHistory,
  loadHistory,
}: ChatContentProps) {
  const statusColor =
    status === "streaming" || status === "submitted"
      ? "bg-yellow-500"
      : error
        ? "bg-red-500"
        : "bg-green-500";

  return (
    <>
      <div className="px-4 py-3 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Garden AI Assistant</h2>
            <span
              className={cn("h-2 w-2 rounded-full", statusColor)}
              title={
                status === "streaming"
                  ? "Streaming"
                  : status === "submitted"
                    ? "Processing"
                    : error
                      ? "Error"
                      : "Ready"
              }
            />
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-7 w-7 text-muted-foreground"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 text-muted-foreground"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {sessionState === "loading" ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground animate-pulse">
            Starting chat...
          </div>
        </div>
      ) : (
        <>
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            summary={summary}
            hasHistory={hasHistory}
            isLoadingHistory={isLoadingHistory}
            onLoadHistory={loadHistory}
          />
          {error && <ChatError error={error} onRetry={() => handleSubmit()} />}
          <ChatInput
            input={input}
            onInputChange={setInput}
            onSubmit={() => handleSubmit()}
            onStop={stop}
            isLoading={isLoading}
          />
        </>
      )}
    </>
  );
}

export function ChatPanel({ open, onOpenChange }: ChatPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lift chat state up so it survives fullscreen toggle
  const chatState = useChatAgent();

  if (!open) return null;

  const contentProps = {
    ...chatState,
    stop: chatState.stop,
  };

  // Fullscreen mode — render as a fixed overlay instead of a Sheet
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <ChatContent
          isFullscreen={true}
          onToggleFullscreen={() => setIsFullscreen(false)}
          onClose={() => {
            setIsFullscreen(false);
            onOpenChange(false);
          }}
          {...contentProps}
        />
      </div>
    );
  }

  // Normal mode — side sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showCloseButton={false} className="w-full sm:w-[400px] md:w-[540px] !gap-0 flex flex-col p-0 overflow-hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>Garden AI Assistant</SheetTitle>
        </SheetHeader>
        <ChatContent
          isFullscreen={false}
          onToggleFullscreen={() => setIsFullscreen(true)}
          onClose={() => onOpenChange(false)}
          {...contentProps}
        />
      </SheetContent>
    </Sheet>
  );
}
