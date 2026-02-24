"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Square } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  onStop,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex gap-2 items-end border-t p-3 shrink-0">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your garden..."
        className="min-h-[44px] max-h-[120px] resize-none"
        rows={1}
      />
      {isLoading ? (
        <Button variant="outline" size="icon" onClick={onStop}>
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={onSubmit}
          disabled={!input.trim()}
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
