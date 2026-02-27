"use server";

import { db } from "@/lib/db";
import { createLogger } from "@/lib/logger";

const log = createLogger("actions:seeds");

export async function getSeeds(filters?: { plantId?: string; supplier?: string }) {
  log.debug("getSeeds called", filters);
  try {
    const where: Record<string, unknown> = {};

    if (filters?.plantId) {
      where.plantId = filters.plantId;
    }
    if (filters?.supplier) {
      where.supplier = { contains: filters.supplier, mode: "insensitive" };
    }

    const seeds = await db.seed.findMany({
      where,
      include: {
        plant: true,
      },
      orderBy: { createdAt: "desc" },
    });

    log.info("getSeeds result", { count: seeds.length });
    return seeds;
  } catch (error) {
    log.error("getSeeds failed", { filters, error });
    throw error;
  }
}

export async function createSeed(data: {
  plantId: string;
  quantity: number;
  quantityUnit?: string;
  supplier?: string;
  viability?: number;
  lotNumber?: string;
  notes?: string;
  purchaseDate?: Date;
  expiryDate?: Date;
}) {
  log.debug("createSeed called", data);
  try {
    const seed = await db.seed.create({
      data: {
        plantId: data.plantId,
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
        supplier: data.supplier,
        viability: data.viability,
        lotNumber: data.lotNumber,
        notes: data.notes,
        purchaseDate: data.purchaseDate,
        expiryDate: data.expiryDate,
      },
      include: {
        plant: true,
      },
    });

    log.info("createSeed result", { id: seed.id, plantId: seed.plantId });
    return seed;
  } catch (error) {
    log.error("createSeed failed", { data, error });
    throw error;
  }
}

export async function updateSeed(
  id: string,
  data: Partial<{
    plantId: string;
    quantity: number;
    quantityUnit: string;
    supplier: string;
    viability: number;
    lotNumber: string;
    notes: string;
    purchaseDate: Date;
    expiryDate: Date;
  }>
) {
  log.debug("updateSeed called", { id, data });
  try {
    const updateData: Record<string, unknown> = {};

    if (data.plantId !== undefined) updateData.plantId = data.plantId;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.quantityUnit !== undefined) updateData.quantityUnit = data.quantityUnit;
    if (data.supplier !== undefined) updateData.supplier = data.supplier;
    if (data.viability !== undefined) updateData.viability = data.viability;
    if (data.lotNumber !== undefined) updateData.lotNumber = data.lotNumber;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate;
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate;

    const seed = await db.seed.update({
      where: { id },
      data: updateData,
      include: {
        plant: true,
      },
    });

    log.info("updateSeed result", { id: seed.id });
    return seed;
  } catch (error) {
    log.error("updateSeed failed", { id, data, error });
    throw error;
  }
}

export async function deleteSeed(id: string) {
  log.debug("deleteSeed called", { id });
  try {
    const seed = await db.seed.delete({
      where: { id },
    });

    log.info("deleteSeed result", { id: seed.id });
    return seed;
  } catch (error) {
    log.error("deleteSeed failed", { id, error });
    throw error;
  }
}
