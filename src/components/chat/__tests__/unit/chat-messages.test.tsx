import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChatMessages } from "@/components/chat/chat-messages";
import type { UIMessage } from "ai";

afterEach(cleanup);

// jsdom doesn't implement scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Mock tool-result-card since it has complex deps
vi.mock("@/components/chat/tool-result-card", () => ({
  ToolResultCard: ({ toolName }: { toolName: string }) => (
    <div data-testid="tool-result">{toolName}</div>
  ),
}));

// Mock loading skeleton
vi.mock("@/components/ui/loading-skeleton", () => ({
  ChatMessageSkeleton: () => <div data-testid="chat-skeleton">Loading...</div>,
}));

// Mock ScrollArea to just render children
vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-area" className={className}>{children}</div>
  ),
}));

function makeMessage(opts: {
  id: string;
  role: "user" | "assistant";
  text: string;
  parts?: UIMessage["parts"];
}): UIMessage {
  return {
    id: opts.id,
    role: opts.role,
    content: "",
    parts: opts.parts ?? [{ type: "text" as const, text: opts.text }],
    createdAt: new Date(),
  };
}

describe("ChatMessages", () => {
  it("renders loading skeleton when initialLoading", () => {
    render(<ChatMessages messages={[]} isLoading={false} initialLoading={true} />);
    expect(screen.getByTestId("chat-skeleton")).toBeInTheDocument();
  });

  it("renders empty state with example prompts when no messages", () => {
    render(<ChatMessages messages={[]} isLoading={false} />);
    expect(screen.getByText("Garden AI Assistant")).toBeInTheDocument();
    expect(screen.getByText(/Show me my tomato seeds/)).toBeInTheDocument();
    expect(screen.getByText(/What's planned for this season/)).toBeInTheDocument();
  });

  it("renders 'Continue previous chat' button when onLoadHistory is provided", () => {
    const onLoadHistory = vi.fn();
    render(
      <ChatMessages
        messages={[]}
        isLoading={false}
        hasHistory={true}
        onLoadHistory={onLoadHistory}
      />
    );
    expect(screen.getByText("Continue previous chat")).toBeInTheDocument();
  });

  it("renders user and assistant messages", () => {
    const messages: UIMessage[] = [
      makeMessage({ id: "1", role: "user", text: "Hello garden bot" }),
      makeMessage({ id: "2", role: "assistant", text: "Hi there, gardener!" }),
    ];
    render(<ChatMessages messages={messages} isLoading={false} />);
    expect(screen.getByText("Hello garden bot")).toBeInTheDocument();
    expect(screen.getByText("Hi there, gardener!")).toBeInTheDocument();
  });

  it("strips <tools> XML tags from assistant messages", () => {
    const messages: UIMessage[] = [
      makeMessage({
        id: "1",
        role: "assistant",
        text: "",
        parts: [
          { type: "text" as const, text: "Here are your plants<tools>some xml</tools>" },
        ],
      }),
    ];
    render(<ChatMessages messages={messages} isLoading={false} />);
    expect(screen.getByText("Here are your plants")).toBeInTheDocument();
    expect(screen.queryByText(/some xml/)).not.toBeInTheDocument();
  });

  it("strips unclosed <tools> tags at end of message", () => {
    const messages: UIMessage[] = [
      makeMessage({
        id: "1",
        role: "assistant",
        text: "",
        parts: [
          { type: "text" as const, text: "Searching now<tools>partial content" },
        ],
      }),
    ];
    render(<ChatMessages messages={messages} isLoading={false} />);
    expect(screen.getByText("Searching now")).toBeInTheDocument();
  });

  it("shows 'Thinking...' indicator when loading", () => {
    const messages: UIMessage[] = [
      makeMessage({ id: "1", role: "user", text: "Question" }),
    ];
    render(<ChatMessages messages={messages} isLoading={true} />);
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("shows summary notification when summary is provided", () => {
    const messages: UIMessage[] = [
      makeMessage({ id: "1", role: "user", text: "Follow up" }),
    ];
    render(
      <ChatMessages
        messages={messages}
        isLoading={false}
        summary="Previous chat about tomatoes"
      />
    );
    expect(screen.getByText("Continuing from previous session")).toBeInTheDocument();
  });
});
