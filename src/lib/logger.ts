/* eslint-disable @typescript-eslint/no-explicit-any */
type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ??
  (process.env.NODE_ENV === "development" ? "debug" : "info");

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
}

function formatMessage(level: LogLevel, module: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;
  return data ? `${base} ${JSON.stringify(data)}` : base;
}

export function createLogger(module: string) {
  return {
    debug(message: string, data?: any) {
      if (shouldLog("debug")) console.debug(formatMessage("debug", module, message, data));
    },
    info(message: string, data?: any) {
      if (shouldLog("info")) console.info(formatMessage("info", module, message, data));
    },
    warn(message: string, data?: any) {
      if (shouldLog("warn")) console.warn(formatMessage("warn", module, message, data));
    },
    error(message: string, data?: any) {
      if (shouldLog("error")) console.error(formatMessage("error", module, message, data));
    },
  };
}
