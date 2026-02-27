import { describe, it, expect } from "vitest";
import { tools } from "@/ai/tools";

describe("navigateTo tool", () => {
  it("resolves exact page names", async () => {
    const result = await tools.navigateTo.execute(
      { page: "plants", plantId: undefined, seedId: undefined },
      { toolCallId: "test", messages: [], abortSignal: undefined as never }
    );
    expect(result.success).toBe(true);
    expect(result.navigateTo.page).toBe("plants");
  });

  it("fuzzy-matches page names by prefix", async () => {
    const result = await tools.navigateTo.execute(
      { page: "cal", plantId: undefined, seedId: undefined },
      { toolCallId: "test", messages: [], abortSignal: undefined as never }
    );
    expect(result.success).toBe(true);
    expect(result.navigateTo.page).toBe("calendar");
  });

  it("defaults to dashboard for unrecognized pages", async () => {
    const result = await tools.navigateTo.execute(
      { page: "xyz", plantId: undefined, seedId: undefined },
      { toolCallId: "test", messages: [], abortSignal: undefined as never }
    );
    expect(result.success).toBe(true);
    expect(result.navigateTo.page).toBe("dashboard");
  });

  it("includes plantId when provided", async () => {
    const result = await tools.navigateTo.execute(
      { page: "plants", plantId: "abc-123", seedId: undefined },
      { toolCallId: "test", messages: [], abortSignal: undefined as never }
    );
    expect(result.navigateTo.plantId).toBe("abc-123");
  });

  it("includes seedId when provided", async () => {
    const result = await tools.navigateTo.execute(
      { page: "seeds", plantId: undefined, seedId: "seed-456" },
      { toolCallId: "test", messages: [], abortSignal: undefined as never }
    );
    expect(result.navigateTo.seedId).toBe("seed-456");
  });
});

describe("tool error return shapes", () => {
  it("searchPlants returns success:false on error", async () => {
    // The mock of getPlants will throw since it's not configured
    const result = await tools.searchPlants.execute(
      { query: "test", type: undefined },
      { toolCallId: "test", messages: [], abortSignal: undefined as never }
    );
    expect(result.success).toBe(false);
    expect("error" in result).toBe(true);
  });

  it("addPlant returns success:false on error", async () => {
    const result = await tools.addPlant.execute(
      { name: "Test", variety: undefined, type: undefined, daysToMaturity: undefined, sunRequirement: undefined, waterNeeds: undefined, growingNotes: undefined },
      { toolCallId: "test", messages: [], abortSignal: undefined as never }
    );
    expect(result.success).toBe(false);
    expect("error" in result).toBe(true);
  });
});
