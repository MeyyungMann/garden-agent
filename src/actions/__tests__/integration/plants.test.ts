import { describe, it, expect } from "vitest";
import { getPlants, getPlantById, createPlant, updatePlant, deletePlant } from "@/actions/plants";
import { testDb } from "@/test/setup-integration";
import { createTestPlant } from "@/test/fixtures";

describe("plants actions", () => {
  describe("createPlant", () => {
    it("creates a plant with required fields", async () => {
      const plant = await createPlant({ name: "Tomato" });
      expect(plant.name).toBe("Tomato");
      expect(plant.id).toBeDefined();
    });

    it("creates a plant with all fields", async () => {
      const plant = await createPlant({
        name: "Basil",
        variety: "Sweet Genovese",
        type: "HERB",
        daysToMaturity: 60,
        sunRequirement: "FULL_SUN",
        waterNeeds: "MODERATE",
        growingNotes: "Pinch flowers to encourage leaf growth",
      });
      expect(plant.name).toBe("Basil");
      expect(plant.variety).toBe("Sweet Genovese");
      expect(plant.type).toBe("HERB");
      expect(plant.daysToMaturity).toBe(60);
    });

    it("rejects duplicate name+variety", async () => {
      await createPlant({ name: "Tomato", variety: "Roma" });
      await expect(createPlant({ name: "Tomato", variety: "Roma" })).rejects.toThrow();
    });
  });

  describe("getPlants", () => {
    it("returns all plants when no filters", async () => {
      await createTestPlant(testDb, { name: "Plant A" });
      await createTestPlant(testDb, { name: "Plant B" });
      const plants = await getPlants();
      expect(plants.length).toBe(2);
    });

    it("filters by name (case-insensitive)", async () => {
      await createTestPlant(testDb, { name: "Tomato" });
      await createTestPlant(testDb, { name: "Basil" });
      const plants = await getPlants({ name: "tomato" });
      expect(plants.length).toBe(1);
      expect(plants[0].name).toBe("Tomato");
    });

    it("filters by type", async () => {
      await createTestPlant(testDb, { name: "Tomato", type: "VEGETABLE" });
      await createTestPlant(testDb, { name: "Basil", type: "HERB" });
      const plants = await getPlants({ type: "HERB" });
      expect(plants.length).toBe(1);
      expect(plants[0].name).toBe("Basil");
    });

    it("includes _count for seeds and plantings", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await testDb.seed.create({ data: { plantId: plant.id, quantity: 10 } });
      const plants = await getPlants();
      expect(plants[0]._count.seeds).toBe(1);
      expect(plants[0]._count.plantings).toBe(0);
    });
  });

  describe("getPlantById", () => {
    it("returns a plant with seeds and plantings", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const result = await getPlantById(plant.id);
      expect(result.name).toBe("Tomato");
      expect(result.seeds).toEqual([]);
      expect(result.plantings).toEqual([]);
    });

    it("throws for non-existent id", async () => {
      await expect(getPlantById("non-existent-id")).rejects.toThrow();
    });
  });

  describe("updatePlant", () => {
    it("updates specified fields", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      const updated = await updatePlant(plant.id, { name: "Cherry Tomato", daysToMaturity: 70 });
      expect(updated.name).toBe("Cherry Tomato");
      expect(updated.daysToMaturity).toBe(70);
    });
  });

  describe("deletePlant", () => {
    it("deletes a plant", async () => {
      const plant = await createTestPlant(testDb, { name: "Tomato" });
      await deletePlant(plant.id);
      const remaining = await getPlants();
      expect(remaining.length).toBe(0);
    });

    it("throws for non-existent id", async () => {
      await expect(deletePlant("non-existent-id")).rejects.toThrow();
    });
  });
});
