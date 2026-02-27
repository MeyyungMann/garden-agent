import { describe, it, expect } from "vitest";
import { getDashboardSummary } from "@/actions/dashboard";
import { testDb } from "@/test/setup-integration";
import { createTestPlant, createTestLocation, createTestSeed } from "@/test/fixtures";

describe("dashboard actions", () => {
  describe("getDashboardSummary", () => {
    it("returns zero counts on empty database", async () => {
      const summary = await getDashboardSummary();
      expect(summary.plantCount).toBe(0);
      expect(summary.seedCount).toBe(0);
      expect(summary.locationCount).toBe(0);
      expect(summary.activePlantingCount).toBe(0);
      expect(summary.upcomingPlantings).toEqual([]);
    });

    it("counts plants, seeds, and locations correctly", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await createTestPlant(testDb, { name: "Basil" });
      await createTestSeed(testDb, plant.id);
      await createTestLocation(testDb, { name: "Bed A" });

      const summary = await getDashboardSummary();
      expect(summary.plantCount).toBe(2);
      expect(summary.seedCount).toBe(1);
      expect(summary.locationCount).toBe(1);
    });

    it("counts active plantings (excludes DONE and FAILED)", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await testDb.planting.create({
        data: { plantId: plant.id, status: "GROWING", year: 2026 },
      });
      await testDb.planting.create({
        data: { plantId: plant.id, status: "DONE", year: 2026 },
      });
      await testDb.planting.create({
        data: { plantId: plant.id, status: "FAILED", year: 2026 },
      });

      const summary = await getDashboardSummary();
      expect(summary.activePlantingCount).toBe(1);
    });

    it("returns upcoming plantings (PLANNED or SOWN)", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await testDb.planting.create({
        data: { plantId: plant.id, status: "PLANNED", year: 2026 },
      });
      await testDb.planting.create({
        data: { plantId: plant.id, status: "GROWING", year: 2026 },
      });

      const summary = await getDashboardSummary();
      expect(summary.upcomingPlantings.length).toBe(1);
      expect(summary.upcomingPlantings[0].status).toBe("PLANNED");
    });
  });
});
