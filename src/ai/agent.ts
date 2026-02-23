import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { model } from "@/lib/ollama";
import { systemPrompt } from "./prompts/system";
import { tools } from "./tools";
import { createLogger } from "@/lib/logger";

const log = createLogger("ai:agent");

export async function runAgent(messages: UIMessage[]) {
  log.info("Running agent", { messageCount: messages.length });

  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    log.debug("Last message role", { role: lastMessage.role });
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
    onStepFinish({ text, toolCalls, toolResults, finishReason }) {
      log.debug("Step finished", {
        finishReason,
        hasText: !!text,
        toolCallCount: toolCalls?.length ?? 0,
        toolResultCount: toolResults?.length ?? 0,
      });
    },
  });

  log.info("Agent stream created");
  return result;
}
