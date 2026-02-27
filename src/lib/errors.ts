export function isConnectionError(error: unknown): boolean {
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

export function isModelNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("model") &&
      (msg.includes("not found") || msg.includes("not available"))
    );
  }
  return false;
}
