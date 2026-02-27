import { describe, it, expect } from "vitest";
import { getPlantings, createPlanting, updatePlanting, deletePlanting } from "@/actions/plantings";
import { testDb } from "@/test/setup-integration";
import { createTestPlant, createTestLocation } from "@/test/fixtures";

describe("plantings actions", () => {
  describe("createPlanting", () => {
    it("creates a planting with plant and location", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const loc = await createTestLocation(testDb, { name: "Bed A" });
      const planting = await createPlanting({
        plantId: plant.id,
        locationId: loc.id,
        year: 2026,
      });
      expect(planting.plant.name).toBe("Tomato");
      expect(planting.location?.name).toBe("Bed A");
      expect(planting.year).toBe(2026);
      expect(planting.status).toBe("PLANNED");
    });

    it("creates a planting without location", async () => {
      const plant = await createTestPlant(testDb, { name: "Basil" });
      const planting = await createPlanting({ plantId: plant.id });
      expect(planting.location).toBeNull();
    });
  });

  describe("getPlantings", () => {
    it("returns all plantings", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await createPlanting({ plantId: plant.id, year: 2026 });
      await createPlanting({ plantId: plant.id, year: 2025 });
      const plantings = await getPlantings();
      expect(plantings.length).toBe(2);
    });

    it("filters by year", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await createPlanting({ plantId: plant.id, year: 2026 });
      await createPlanting({ plantId: plant.id, year: 2025 });
      const plantings = await getPlantings({ year: 2026 });
      expect(plantings.length).toBe(1);
      expect(plantings[0].year).toBe(2026);
    });

    it("filters by status", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await createPlanting({ plantId: plant.id, status: "PLANNED" });
      await createPlanting({ plantId: plant.id, status: "GROWING" });
      const plantings = await getPlantings({ status: "GROWING" });
      expect(plantings.length).toBe(1);
      expect(plantings[0].status).toBe("GROWING");
    });

    it("filters by locationId", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const loc = await createTestLocation(testDb, { name: "Bed A" });
      await createPlanting({ plantId: plant.id, locationId: loc.id });
      await createPlanting({ plantId: plant.id });
      const plantings = await getPlantings({ locationId: loc.id });
      expect(plantings.length).toBe(1);
    });
  });

  describe("updatePlanting", () => {
    it("updates status and notes", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const planting = await createPlanting({ plantId: plant.id });
      const updated = await updatePlanting(planting.id, {
        status: "SOWN",
        notes: "Started indoor sowing",
      });
      expect(updated.status).toBe("SOWN");
      expect(updated.notes).toBe("Started indoor sowing");
    });

    it("updates dates", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const planting = await createPlanting({ plantId: plant.id });
      const sowDate = new Date("2026-03-15");
      const updated = await updatePlanting(planting.id, { sowIndoorDate: sowDate });
      expect(updated.sowIndoorDate).toEqual(sowDate);
    });
  });

  describe("deletePlanting", () => {
    it("deletes a planting", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const planting = await createPlanting({ plantId: plant.id });
      await deletePlanting(planting.id);
      const remaining = await getPlantings();
      expect(remaining.length).toBe(0);
    });
  });
});
