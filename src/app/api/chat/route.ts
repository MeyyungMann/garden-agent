import { runAgent } from "@/ai/agent";
import { createLogger } from "@/lib/logger";

const log = createLogger("api:chat");

function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("econnrefused") ||
      msg.includes("connection refused") ||
      msg.includes("fetch failed") ||
      msg.includes("connect econnrefused")
    );
  }
  return false;
}

function isModelNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("model") &&
      (msg.includes("not found") || msg.includes("not available"))
    );
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    log.info("Chat request received", { messageCount: messages?.length ?? 0 });

    if (!messages || !Array.isArray(messages)) {
      log.warn("Invalid request: messages is not an array");
      return new Response(
        JSON.stringify({ error: "messages must be an array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await runAgent(messages);
    log.info("Returning stream response");
    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (isConnectionError(error)) {
      log.error("Ollama connection failed - is Ollama running?", {
        error: error instanceof Error ? error.message : String(error),
      });
      return new Response(
        JSON.stringify({
          error:
            "Could not connect to Ollama. Make sure it's running on localhost:11434",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    if (isModelNotFoundError(error)) {
      log.error("Model not found", {
        error: error instanceof Error ? error.message : String(error),
      });
      return new Response(
        JSON.stringify({
          error:
            "Model not found. Run `ollama pull qwen2.5` to download it",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    log.error("Chat request failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
