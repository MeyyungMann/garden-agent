"use client";

import { AlertCircle, RefreshCw, WifiOff, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatErrorProps {
  error: Error | null;
  onRetry?: () => void;
}

type ErrorType = "connection" | "model_not_found" | "generic";

function detectErrorType(error: Error): ErrorType {
  const msg = error.message.toLowerCase();
  if (
    msg.includes("econnrefused") ||
    msg.includes("connection refused") ||
    msg.includes("could not connect") ||
    msg.includes("fetch failed") ||
    msg.includes("network error") ||
    msg.includes("ollama")
  ) {
    return "connection";
  }
  if (
    msg.includes("model") &&
    (msg.includes("not found") || msg.includes("not available") || msg.includes("pull"))
  ) {
    return "model_not_found";
  }
  return "generic";
}

export function ChatError({ error, onRetry }: ChatErrorProps) {
  if (!error) return null;

  const errorType = detectErrorType(error);

  return (
    <div className="mx-4 mb-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
      <div className="flex items-start gap-2">
        {errorType === "connection" ? (
          <WifiOff className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        ) : errorType === "model_not_found" ? (
          <Download className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-destructive">
            {errorType === "connection" && "Could not connect to Ollama"}
            {errorType === "model_not_found" && "Model not found"}
            {errorType === "generic" && "Something went wrong"}
          </p>
          <p className="text-xs text-muted-foreground">
            {errorType === "connection" &&
              "Make sure Ollama is running on localhost:11434. Start it with `ollama serve`."}
            {errorType === "model_not_found" &&
              "Model not found. Run `ollama pull qwen2.5` to download it."}
            {errorType === "generic" && (error.message || "An unexpected error occurred.")}
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2 h-7 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
