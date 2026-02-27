import { describe, it, expect } from "vitest";
import { isConnectionError, isModelNotFoundError } from "@/lib/errors";

describe("isConnectionError", () => {
  it("returns true for ECONNREFUSED errors", () => {
    expect(isConnectionError(new Error("connect ECONNREFUSED 127.0.0.1:11434"))).toBe(true);
  });

  it("returns true for connection refused errors", () => {
    expect(isConnectionError(new Error("Connection refused"))).toBe(true);
  });

  it("returns true for fetch failed errors", () => {
    expect(isConnectionError(new Error("fetch failed"))).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isConnectionError(new Error("something else"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isConnectionError("string error")).toBe(false);
    expect(isConnectionError(null)).toBe(false);
    expect(isConnectionError(undefined)).toBe(false);
  });
});

describe("isModelNotFoundError", () => {
  it("returns true for model not found errors", () => {
    expect(isModelNotFoundError(new Error("model 'qwen3' not found"))).toBe(true);
  });

  it("returns true for model not available errors", () => {
    expect(isModelNotFoundError(new Error("Model is not available"))).toBe(true);
  });

  it("returns false when only 'model' is present without 'not found'", () => {
    expect(isModelNotFoundError(new Error("model loaded successfully"))).toBe(false);
  });

  it("returns false for unrelated errors", () => {
    expect(isModelNotFoundError(new Error("database error"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isModelNotFoundError("string error")).toBe(false);
    expect(isModelNotFoundError(42)).toBe(false);
  });
});
