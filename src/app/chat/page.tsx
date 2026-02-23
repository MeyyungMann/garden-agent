"use client";

import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { useChatAgent } from "@/hooks/use-chat-agent";

export default function ChatPage() {
  const { messages, input, setInput, handleSubmit, isLoading, stop } =
    useChatAgent();

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <h1 className="text-2xl font-bold px-1 pb-2">Garden AI Chat</h1>
      <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={() => handleSubmit()}
          onStop={stop}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
