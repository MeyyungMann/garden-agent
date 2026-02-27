import { describe, it, expect } from "vitest";
import { getLocations, createLocation, updateLocation, deleteLocation } from "@/actions/locations";
import { testDb } from "@/test/setup-integration";
import { createTestLocation } from "@/test/fixtures";

describe("locations actions", () => {
  describe("createLocation", () => {
    it("creates a location with required fields", async () => {
      const loc = await createLocation({ name: "Raised Bed A" });
      expect(loc.name).toBe("Raised Bed A");
      expect(loc.id).toBeDefined();
    });

    it("creates a location with all fields", async () => {
      const loc = await createLocation({
        name: "Greenhouse",
        locationType: "GREENHOUSE",
        description: "Main greenhouse",
        sunExposure: "FULL_SUN",
        soilType: "loamy",
        climateZone: "7b",
      });
      expect(loc.locationType).toBe("GREENHOUSE");
      expect(loc.soilType).toBe("loamy");
    });

    it("rejects duplicate names", async () => {
      await createLocation({ name: "Bed A" });
      await expect(createLocation({ name: "Bed A" })).rejects.toThrow();
    });
  });

  describe("getLocations", () => {
    it("returns all locations with planting counts", async () => {
      await createTestLocation(testDb, { name: "Loc A" });
      await createTestLocation(testDb, { name: "Loc B" });
      const locations = await getLocations();
      expect(locations.length).toBe(2);
      expect(locations[0]._count.plantings).toBe(0);
    });

    it("returns locations ordered by name", async () => {
      await createTestLocation(testDb, { name: "Zephyr" });
      await createTestLocation(testDb, { name: "Alpha" });
      const locations = await getLocations();
      expect(locations[0].name).toBe("Alpha");
      expect(locations[1].name).toBe("Zephyr");
    });
  });

  describe("updateLocation", () => {
    it("updates specified fields", async () => {
      const loc = await createTestLocation(testDb, { name: "Bed A" });
      const updated = await updateLocation(loc.id, { name: "Bed B", sunExposure: "SHADE" });
      expect(updated.name).toBe("Bed B");
      expect(updated.sunExposure).toBe("SHADE");
    });
  });

  describe("deleteLocation", () => {
    it("deletes a location", async () => {
      const loc = await createTestLocation(testDb, { name: "Bed A" });
      await deleteLocation(loc.id);
      const remaining = await getLocations();
      expect(remaining.length).toBe(0);
    });
  });
});
