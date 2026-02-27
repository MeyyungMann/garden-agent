import { describe, it, expect } from "vitest";
import { buildDatabaseContext } from "@/ai/agent";
import { testDb } from "@/test/setup-integration";
import { createTestPlant, createTestLocation, createTestSeed, createTestPlanting } from "@/test/fixtures";

describe("buildDatabaseContext", () => {
  it("returns empty state markers on empty database", async () => {
    const context = await buildDatabaseContext();
    expect(context).toContain("## Current Database State");
    expect(context).toContain("No locations yet.");
    expect(context).toContain("No plants yet.");
    expect(context).toContain("No seeds yet.");
    expect(context).toContain("No plantings scheduled yet.");
  });

  it("includes plants with IDs", async () => {
    const plant = await createTestPlant(testDb, { name: "Tomato", variety: "Roma", type: "VEGETABLE" });
    const context = await buildDatabaseContext();
    expect(context).toContain("**Tomato (Roma)**");
    expect(context).toContain(`ID: \`${plant.id}\``);
    expect(context).toContain("Type: VEGETABLE");
  });

  it("includes locations with IDs", async () => {
    const loc = await createTestLocation(testDb, { name: "Greenhouse", locationType: "GREENHOUSE" });
    const context = await buildDatabaseContext();
    expect(context).toContain("**Greenhouse**");
    expect(context).toContain(`ID: \`${loc.id}\``);
    expect(context).toContain("Type: GREENHOUSE");
  });

  it("includes seeds with plant name", async () => {
    const plant = await createTestPlant(testDb, { name: "Basil" });
    await createTestSeed(testDb, plant.id, { quantity: 5, supplier: "Acme" });
    const context = await buildDatabaseContext();
    expect(context).toContain("**Basil** seed");
    expect(context).toContain("5 packets");
    expect(context).toContain("from Acme");
  });

  it("includes plantings with status and dates", async () => {
    const plant = await createTestPlant(testDb, { name: "Pepper" });
    const loc = await createTestLocation(testDb, { name: "Bed A" });
    await createTestPlanting(testDb, plant.id, {
      locationId: loc.id,
      year: 2026,
      status: "PLANNED",
      sowIndoorDate: new Date("2026-03-01"),
    });
    const context = await buildDatabaseContext();
    expect(context).toContain("**Pepper**");
    expect(context).toContain("at Bed A");
    expect(context).toContain("Year: 2026");
    expect(context).toContain("Status: PLANNED");
    expect(context).toContain("Sow indoor: 2026-03-01");
  });

  it("shows counts in section headers", async () => {
    await createTestPlant(testDb, { name: "Plant 1" });
    await createTestPlant(testDb, { name: "Plant 2" });
    const context = await buildDatabaseContext();
    expect(context).toContain("### Plants (2)");
  });
});
