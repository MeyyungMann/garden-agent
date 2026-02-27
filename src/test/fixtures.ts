import type { PrismaClient } from "@/generated/prisma/client";

export async function createTestPlant(
  db: PrismaClient,
  overrides: Partial<{
    name: string;
    variety: string;
    type: "VEGETABLE" | "HERB" | "FLOWER" | "FRUIT" | "OTHER";
    daysToMaturity: number;
    sunRequirement: "FULL_SUN" | "PARTIAL_SUN" | "SHADE";
    waterNeeds: "LOW" | "MODERATE" | "HIGH";
    growingNotes: string;
  }> = {}
) {
  return db.plant.create({
    data: {
      name: overrides.name ?? `Test Plant ${Date.now()}`,
      variety: overrides.variety,
      type: overrides.type ?? "VEGETABLE",
      daysToMaturity: overrides.daysToMaturity ?? 60,
      sunRequirement: overrides.sunRequirement ?? "FULL_SUN",
      waterNeeds: overrides.waterNeeds ?? "MODERATE",
      growingNotes: overrides.growingNotes,
    },
  });
}

export async function createTestLocation(
  db: PrismaClient,
  overrides: Partial<{
    name: string;
    locationType: "BED" | "POT" | "CONTAINER" | "ROW" | "GREENHOUSE" | "INDOOR" | "OTHER";
    description: string;
    sunExposure: "FULL_SUN" | "PARTIAL_SUN" | "SHADE";
    soilType: string;
    climateZone: string;
  }> = {}
) {
  return db.gardenLocation.create({
    data: {
      name: overrides.name ?? `Test Location ${Date.now()}`,
      locationType: overrides.locationType ?? "BED",
      description: overrides.description,
      sunExposure: overrides.sunExposure ?? "FULL_SUN",
      soilType: overrides.soilType,
      climateZone: overrides.climateZone,
    },
  });
}

export async function createTestSeed(
  db: PrismaClient,
  plantId: string,
  overrides: Partial<{
    quantity: number;
    quantityUnit: string;
    supplier: string;
    viability: number;
    notes: string;
  }> = {}
) {
  return db.seed.create({
    data: {
      plantId,
      quantity: overrides.quantity ?? 10,
      quantityUnit: overrides.quantityUnit ?? "packets",
      supplier: overrides.supplier,
      viability: overrides.viability ?? 90,
      notes: overrides.notes,
    },
    include: { plant: true },
  });
}

export async function createTestPlanting(
  db: PrismaClient,
  plantId: string,
  overrides: Partial<{
    locationId: string;
    year: number;
    status: string;
    sowIndoorDate: Date;
    sowOutdoorDate: Date;
    transplantDate: Date;
    harvestStart: Date;
    harvestEnd: Date;
    notes: string;
  }> = {}
) {
  return db.planting.create({
    data: {
      plantId,
      locationId: overrides.locationId,
      year: overrides.year ?? new Date().getFullYear(),
      status: (overrides.status as "PLANNED") ?? "PLANNED",
      sowIndoorDate: overrides.sowIndoorDate,
      sowOutdoorDate: overrides.sowOutdoorDate,
      transplantDate: overrides.transplantDate,
      harvestStart: overrides.harvestStart,
      harvestEnd: overrides.harvestEnd,
      notes: overrides.notes,
    },
    include: { plant: true, location: true },
  });
}
