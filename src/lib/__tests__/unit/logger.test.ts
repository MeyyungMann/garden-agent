import { describe, it, expect, vi, beforeEach } from "vitest";

describe("createLogger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a logger with debug, info, warn, error methods", async () => {
    // Re-import to get fresh module state
    const { createLogger } = await import("@/lib/logger");
    const log = createLogger("test:module");
    expect(log).toHaveProperty("debug");
    expect(log).toHaveProperty("info");
    expect(log).toHaveProperty("warn");
    expect(log).toHaveProperty("error");
  });

  it("formats messages with timestamp, level, and module", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { createLogger } = await import("@/lib/logger");
    const log = createLogger("test:module");

    log.error("something broke");

    expect(spy).toHaveBeenCalledOnce();
    const msg = spy.mock.calls[0][0] as string;
    expect(msg).toContain("[ERROR]");
    expect(msg).toContain("[test:module]");
    expect(msg).toContain("something broke");
  });

  it("includes data as JSON when provided", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { createLogger } = await import("@/lib/logger");
    const log = createLogger("test:module");

    log.error("failed", { code: 42 });

    const msg = spy.mock.calls[0][0] as string;
    expect(msg).toContain('"code":42');
  });
});
