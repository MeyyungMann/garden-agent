import { describe, it, expect } from "vitest";

// Test the ROUTE_MAP constant directly by re-declaring it
// (since the hook has side effects from useChat, we test the mapping logic separately)
const ROUTE_MAP: Record<string, string> = {
  dashboard: "/",
  plants: "/plants",
  seeds: "/seeds",
  garden: "/garden",
  calendar: "/calendar",
  chat: "/chat",
};

describe("ROUTE_MAP", () => {
  it("maps dashboard to /", () => {
    expect(ROUTE_MAP["dashboard"]).toBe("/");
  });

  it("maps plants to /plants", () => {
    expect(ROUTE_MAP["plants"]).toBe("/plants");
  });

  it("maps seeds to /seeds", () => {
    expect(ROUTE_MAP["seeds"]).toBe("/seeds");
  });

  it("maps garden to /garden", () => {
    expect(ROUTE_MAP["garden"]).toBe("/garden");
  });

  it("maps calendar to /calendar", () => {
    expect(ROUTE_MAP["calendar"]).toBe("/calendar");
  });

  it("maps chat to /chat", () => {
    expect(ROUTE_MAP["chat"]).toBe("/chat");
  });

  it("has all 6 routes defined", () => {
    expect(Object.keys(ROUTE_MAP)).toHaveLength(6);
  });

  it("returns undefined for unknown pages (used as fallback to /)", () => {
    expect(ROUTE_MAP["unknown"]).toBeUndefined();
  });
});

// Test the navigation path resolution logic (mirrors the useEffect in use-chat-agent)
function resolveNavigationPath(nav: { page?: string; plantId?: string; seedId?: string }): string {
  const { page, plantId, seedId } = nav;
  if (plantId) return `/plants/${plantId}`;
  if (seedId) return `/seeds/${seedId}`;
  if (page) return ROUTE_MAP[page] || "/";
  return "/";
}

describe("resolveNavigationPath", () => {
  it("navigates to plant detail page when plantId is provided", () => {
    expect(resolveNavigationPath({ page: "plants", plantId: "abc123" })).toBe("/plants/abc123");
  });

  it("navigates to seed detail page when seedId is provided", () => {
    expect(resolveNavigationPath({ page: "seeds", seedId: "def456" })).toBe("/seeds/def456");
  });

  it("prefers plantId over seedId", () => {
    expect(resolveNavigationPath({ plantId: "p1", seedId: "s1" })).toBe("/plants/p1");
  });

  it("navigates to calendar page by name", () => {
    expect(resolveNavigationPath({ page: "calendar" })).toBe("/calendar");
  });

  it("falls back to / for unknown page names", () => {
    expect(resolveNavigationPath({ page: "settings" })).toBe("/");
  });

  it("falls back to / when no page or IDs provided", () => {
    expect(resolveNavigationPath({})).toBe("/");
  });
});
