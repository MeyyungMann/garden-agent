import { describe, it, expect } from "vitest";
import { formatEnum, toDateInputValue, parseDateInput } from "@/lib/format";

describe("formatEnum", () => {
  it("converts SCREAMING_SNAKE_CASE to Title Case", () => {
    expect(formatEnum("FULL_SUN")).toBe("Full Sun");
  });

  it("handles single word enums", () => {
    expect(formatEnum("VEGETABLE")).toBe("Vegetable");
  });

  it("handles multi-word enums", () => {
    expect(formatEnum("PARTIAL_SUN")).toBe("Partial Sun");
  });

  it("handles three-word enums", () => {
    expect(formatEnum("VERY_HIGH_PRIORITY")).toBe("Very High Priority");
  });
});

describe("toDateInputValue", () => {
  it("returns YYYY-MM-DD string for a Date", () => {
    const date = new Date("2026-03-15T00:00:00Z");
    expect(toDateInputValue(date)).toBe("2026-03-15");
  });

  it("returns empty string for null", () => {
    expect(toDateInputValue(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(toDateInputValue(undefined)).toBe("");
  });
});

describe("parseDateInput", () => {
  it("parses a date string to a Date object", () => {
    const result = parseDateInput("2026-03-15");
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2026);
    expect(result!.getMonth()).toBe(2); // March = 2
    expect(result!.getDate()).toBe(15);
  });

  it("returns undefined for empty string", () => {
    expect(parseDateInput("")).toBeUndefined();
  });
});
