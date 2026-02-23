"use server";

import { db } from "@/lib/db";
import { createLogger } from "@/lib/logger";

const log = createLogger("actions:dashboard");

export async function getDashboardSummary() {
  log.debug("getDashboardSummary called");
  try {
    const [plantCount, seedCount, locationCount, activePlantingCount, upcomingPlantings] =
      await Promise.all([
        db.plant.count(),
        db.seed.count(),
        db.gardenLocation.count(),
        db.planting.count({
          where: {
            status: { in: ["PLANNED", "SOWN", "GERMINATED", "TRANSPLANTED", "GROWING", "HARVESTING"] },
          },
        }),
        db.planting.findMany({
          where: {
            status: { in: ["PLANNED", "SOWN"] },
          },
          include: {
            plant: true,
            location: true,
          },
          orderBy: { sowIndoorDate: "asc" },
          take: 10,
        }),
      ]);

    const summary = {
      plantCount,
      seedCount,
      locationCount,
      activePlantingCount,
      upcomingPlantings,
    };

    log.info("getDashboardSummary result", {
      plantCount,
      seedCount,
      locationCount,
      activePlantingCount,
      upcomingCount: upcomingPlantings.length,
    });

    return summary;
  } catch (error) {
    log.error("getDashboardSummary failed", { error });
    throw error;
  }
}
