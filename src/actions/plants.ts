"use server";

import { db } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import type { PlantType, SunRequirement, WaterNeeds } from "@/generated/prisma/client";

const log = createLogger("actions:plants");

export async function getPlants(filters?: { name?: string; type?: string }) {
  log.debug("getPlants called", filters);
  try {
    const where: Record<string, unknown> = {};

    if (filters?.name) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }
    if (filters?.type) {
      where.type = filters.type as PlantType;
    }

    const plants = await db.plant.findMany({
      where,
      include: {
        _count: {
          select: { seeds: true, plantings: true },
        },
      },
      orderBy: { name: "asc" },
    });

    log.info("getPlants result", { count: plants.length });
    return plants;
  } catch (error) {
    log.error("getPlants failed", { error });
    throw error;
  }
}

export async function getPlantById(id: string) {
  log.debug("getPlantById called", { id });
  try {
    const plant = await db.plant.findUniqueOrThrow({
      where: { id },
      include: {
        seeds: true,
        plantings: {
          include: { location: true },
        },
        companions: true,
      },
    });

    log.info("getPlantById result", { id: plant.id });
    return plant;
  } catch (error) {
    log.error("getPlantById failed", { id, error });
    throw error;
  }
}

export async function createPlant(data: {
  name: string;
  variety?: string;
  type?: string;
  daysToMaturity?: number;
  sunRequirement?: string;
  waterNeeds?: string;
  growingNotes?: string;
}) {
  log.debug("createPlant called", data);
  try {
    const plant = await db.plant.create({
      data: {
        name: data.name,
        variety: data.variety,
        type: (data.type as PlantType) ?? undefined,
        daysToMaturity: data.daysToMaturity,
        sunRequirement: (data.sunRequirement as SunRequirement) ?? undefined,
        waterNeeds: (data.waterNeeds as WaterNeeds) ?? undefined,
        growingNotes: data.growingNotes,
      },
    });

    log.info("createPlant result", { id: plant.id, name: plant.name });
    return plant;
  } catch (error) {
    log.error("createPlant failed", { data, error });
    throw error;
  }
}

export async function updatePlant(
  id: string,
  data: Partial<{
    name: string;
    variety: string;
    type: string;
    daysToMaturity: number;
    sunRequirement: string;
    waterNeeds: string;
    growingNotes: string;
  }>
) {
  log.debug("updatePlant called", { id, data });
  try {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.variety !== undefined) updateData.variety = data.variety;
    if (data.type !== undefined) updateData.type = data.type as PlantType;
    if (data.daysToMaturity !== undefined) updateData.daysToMaturity = data.daysToMaturity;
    if (data.sunRequirement !== undefined) updateData.sunRequirement = data.sunRequirement as SunRequirement;
    if (data.waterNeeds !== undefined) updateData.waterNeeds = data.waterNeeds as WaterNeeds;
    if (data.growingNotes !== undefined) updateData.growingNotes = data.growingNotes;

    const plant = await db.plant.update({
      where: { id },
      data: updateData,
    });

    log.info("updatePlant result", { id: plant.id });
    return plant;
  } catch (error) {
    log.error("updatePlant failed", { id, data, error });
    throw error;
  }
}

export async function deletePlant(id: string) {
  log.debug("deletePlant called", { id });
  try {
    const plant = await db.plant.delete({
      where: { id },
    });

    log.info("deletePlant result", { id: plant.id });
    return plant;
  } catch (error) {
    log.error("deletePlant failed", { id, error });
    throw error;
  }
}
