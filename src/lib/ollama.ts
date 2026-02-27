import { createOllama } from "ai-sdk-ollama";
import { createLogger } from "@/lib/logger";

const log = createLogger("lib:ollama");

const baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const modelName = process.env.OLLAMA_MODEL || "qwen2.5";

log.info("Initializing Ollama provider", { baseURL, model: modelName });

const ollama = createOllama({
  baseURL,
});

export const model = ollama(modelName);
