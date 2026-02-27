import { describe, it, expect } from "vitest";
import { getSeeds, createSeed, updateSeed, deleteSeed } from "@/actions/seeds";
import { testDb } from "@/test/setup-integration";
import { createTestPlant } from "@/test/fixtures";

describe("seeds actions", () => {
  describe("createSeed", () => {
    it("creates a seed linked to a plant", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const seed = await createSeed({ plantId: plant.id, quantity: 5 });
      expect(seed.plantId).toBe(plant.id);
      expect(seed.quantity).toBe(5);
      expect(seed.plant.name).toBe("Tomato");
    });

    it("rejects invalid plantId", async () => {
      await expect(createSeed({ plantId: "non-existent", quantity: 5 })).rejects.toThrow();
    });
  });

  describe("getSeeds", () => {
    it("returns all seeds", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await createSeed({ plantId: plant.id, quantity: 5 });
      await createSeed({ plantId: plant.id, quantity: 10, supplier: "Acme Seeds" });
      const seeds = await getSeeds();
      expect(seeds.length).toBe(2);
    });

    it("filters by plantId", async () => {
      const p1 = await createTestPlant(testDb, { name: "Tomato" });
      const p2 = await createTestPlant(testDb, { name: "Basil" });
      await createSeed({ plantId: p1.id, quantity: 5 });
      await createSeed({ plantId: p2.id, quantity: 3 });
      const seeds = await getSeeds({ plantId: p1.id });
      expect(seeds.length).toBe(1);
      expect(seeds[0].plant.name).toBe("Tomato");
    });

    it("filters by supplier (case-insensitive)", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await createSeed({ plantId: plant.id, quantity: 5, supplier: "Acme Seeds" });
      await createSeed({ plantId: plant.id, quantity: 10, supplier: "Other Co" });
      const seeds = await getSeeds({ supplier: "acme" });
      expect(seeds.length).toBe(1);
      expect(seeds[0].supplier).toBe("Acme Seeds");
    });
  });

  describe("updateSeed", () => {
    it("updates seed quantity and viability", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const seed = await createSeed({ plantId: plant.id, quantity: 5 });
      const updated = await updateSeed(seed.id, { quantity: 20, viability: 85 });
      expect(updated.quantity).toBe(20);
      expect(updated.viability).toBe(85);
    });
  });

  describe("deleteSeed", () => {
    it("deletes a seed", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const seed = await createSeed({ plantId: plant.id, quantity: 5 });
      await deleteSeed(seed.id);
      const remaining = await getSeeds();
      expect(remaining.length).toBe(0);
    });

    it("does not delete the parent plant", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const seed = await createSeed({ plantId: plant.id, quantity: 5 });
      await deleteSeed(seed.id);
      const plants = await testDb.plant.findMany();
      expect(plants.length).toBe(1);
    });
  });
});
