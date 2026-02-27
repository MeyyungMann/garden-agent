"use server";

import { db } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import type { PlantingStatus } from "@/generated/prisma/client";

const log = createLogger("actions:plantings");

export async function getPlantings(filters?: {
  plantId?: string;
  locationId?: string;
  year?: number;
  status?: string;
}) {
  log.debug("getPlantings called", filters);
  try {
    const where: Record<string, unknown> = {};

    if (filters?.plantId) {
      where.plantId = filters.plantId;
    }
    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }
    if (filters?.year) {
      where.year = filters.year;
    }
    if (filters?.status) {
      where.status = filters.status as PlantingStatus;
    }

    const plantings = await db.planting.findMany({
      where,
      include: {
        plant: true,
        location: true,
      },
      orderBy: { createdAt: "desc" },
    });

    log.info("getPlantings result", { count: plantings.length });
    return plantings;
  } catch (error) {
    log.error("getPlantings failed", { filters, error });
    throw error;
  }
}

export async function createPlanting(data: {
  plantId: string;
  locationId?: string;
  year?: number;
  sowIndoorDate?: Date;
  sowOutdoorDate?: Date;
  transplantDate?: Date;
  harvestStart?: Date;
  harvestEnd?: Date;
  status?: string;
  notes?: string;
}) {
  log.debug("createPlanting called", data);
  try {
    const planting = await db.planting.create({
      data: {
        plantId: data.plantId,
        locationId: data.locationId,
        year: data.year,
        sowIndoorDate: data.sowIndoorDate,
        sowOutdoorDate: data.sowOutdoorDate,
        transplantDate: data.transplantDate,
        harvestStart: data.harvestStart,
        harvestEnd: data.harvestEnd,
        status: (data.status as PlantingStatus) ?? undefined,
        notes: data.notes,
      },
      include: {
        plant: true,
        location: true,
      },
    });

    log.info("createPlanting result", { id: planting.id, plantId: planting.plantId });
    return planting;
  } catch (error) {
    log.error("createPlanting failed", { data, error });
    throw error;
  }
}

export async function updatePlanting(
  id: string,
  data: Partial<{
    plantId: string;
    locationId: string;
    year: number;
    sowIndoorDate: Date;
    sowOutdoorDate: Date;
    transplantDate: Date;
    harvestStart: Date;
    harvestEnd: Date;
    status: string;
    notes: string;
  }>
) {
  log.debug("updatePlanting called", { id, data });
  try {
    const updateData: Record<string, unknown> = {};

    if (data.plantId !== undefined) updateData.plantId = data.plantId;
    if (data.locationId !== undefined) updateData.locationId = data.locationId;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.sowIndoorDate !== undefined) updateData.sowIndoorDate = data.sowIndoorDate;
    if (data.sowOutdoorDate !== undefined) updateData.sowOutdoorDate = data.sowOutdoorDate;
    if (data.transplantDate !== undefined) updateData.transplantDate = data.transplantDate;
    if (data.harvestStart !== undefined) updateData.harvestStart = data.harvestStart;
    if (data.harvestEnd !== undefined) updateData.harvestEnd = data.harvestEnd;
    if (data.status !== undefined) updateData.status = data.status as PlantingStatus;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const planting = await db.planting.update({
      where: { id },
      data: updateData,
      include: {
        plant: true,
        location: true,
      },
    });

    log.info("updatePlanting result", { id: planting.id });
    return planting;
  } catch (error) {
    log.error("updatePlanting failed", { id, data, error });
    throw error;
  }
}

export async function deletePlanting(id: string) {
  log.debug("deletePlanting called", { id });
  try {
    const planting = await db.planting.delete({
      where: { id },
    });

    log.info("deletePlanting result", { id: planting.id });
    return planting;
  } catch (error) {
    log.error("deletePlanting failed", { id, error });
    throw error;
  }
}
