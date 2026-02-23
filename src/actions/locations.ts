"use server";

import { db } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import type { LocationType, SunRequirement } from "@/generated/prisma/client";

const log = createLogger("actions:locations");

export async function getLocations() {
  log.debug("getLocations called");
  try {
    const locations = await db.gardenLocation.findMany({
      include: {
        _count: {
          select: { plantings: true },
        },
      },
      orderBy: { name: "asc" },
    });

    log.info("getLocations result", { count: locations.length });
    return locations;
  } catch (error) {
    log.error("getLocations failed", { error });
    throw error;
  }
}

export async function getLocationById(id: string) {
  log.debug("getLocationById called", { id });
  try {
    const location = await db.gardenLocation.findUniqueOrThrow({
      where: { id },
      include: {
        plantings: {
          include: { plant: true },
        },
      },
    });

    log.info("getLocationById result", { id: location.id });
    return location;
  } catch (error) {
    log.error("getLocationById failed", { id, error });
    throw error;
  }
}

export async function createLocation(data: {
  name: string;
  locationType?: string;
  description?: string;
  sunExposure?: string;
  soilType?: string;
  climateZone?: string;
}) {
  log.debug("createLocation called", data);
  try {
    const location = await db.gardenLocation.create({
      data: {
        name: data.name,
        locationType: (data.locationType as LocationType) ?? undefined,
        description: data.description,
        sunExposure: (data.sunExposure as SunRequirement) ?? undefined,
        soilType: data.soilType,
        climateZone: data.climateZone,
      },
    });

    log.info("createLocation result", { id: location.id, name: location.name });
    return location;
  } catch (error) {
    log.error("createLocation failed", { data, error });
    throw error;
  }
}

export async function updateLocation(
  id: string,
  data: Partial<{
    name: string;
    locationType: string;
    description: string;
    sunExposure: string;
    soilType: string;
    climateZone: string;
  }>
) {
  log.debug("updateLocation called", { id, data });
  try {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.locationType !== undefined) updateData.locationType = data.locationType as LocationType;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sunExposure !== undefined) updateData.sunExposure = data.sunExposure as SunRequirement;
    if (data.soilType !== undefined) updateData.soilType = data.soilType;
    if (data.climateZone !== undefined) updateData.climateZone = data.climateZone;

    const location = await db.gardenLocation.update({
      where: { id },
      data: updateData,
    });

    log.info("updateLocation result", { id: location.id });
    return location;
  } catch (error) {
    log.error("updateLocation failed", { id, data, error });
    throw error;
  }
}

export async function deleteLocation(id: string) {
  log.debug("deleteLocation called", { id });
  try {
    const location = await db.gardenLocation.delete({
      where: { id },
    });

    log.info("deleteLocation result", { id: location.id });
    return location;
  } catch (error) {
    log.error("deleteLocation failed", { id, error });
    throw error;
  }
}
