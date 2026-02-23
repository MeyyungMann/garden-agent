"use client";

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
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatPanel({ open, onOpenChange }: ChatPanelProps) {
  const { messages, input, setInput, handleSubmit, isLoading, stop, status, error, clearMessages } =
    useChatAgent();

  const statusColor =
    status === "streaming" || status === "submitted"
      ? "bg-yellow-500"
      : error
        ? "bg-red-500"
        : "bg-green-500";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[400px] md:w-[540px] flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle>Garden AI Assistant</SheetTitle>
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
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear chat
              </Button>
            )}
          </div>
        </SheetHeader>
        <ChatMessages messages={messages} isLoading={isLoading} />
        {error && <ChatError error={error} onRetry={() => handleSubmit()} />}
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={() => handleSubmit()}
          onStop={stop}
          isLoading={isLoading}
        />
      </SheetContent>
    </Sheet>
  );
}
