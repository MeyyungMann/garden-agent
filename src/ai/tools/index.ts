import { tool } from "ai";
import { z } from "zod/v4";
import { getPlants, createPlant, updatePlant, deletePlant } from "@/actions/plants";
import { getSeeds, createSeed, updateSeed, deleteSeed } from "@/actions/seeds";
import { getPlantings, createPlanting, updatePlanting, deletePlanting } from "@/actions/plantings";
import { getLocations, createLocation, updateLocation, deleteLocation } from "@/actions/locations";
import { getDashboardSummary } from "@/actions/dashboard";
import { createLogger } from "@/lib/logger";

const log = createLogger("ai:tools");

export const tools = {
  searchPlants: tool({
    description:
      "Search for plants in the catalog by name, variety, or type. Returns a list of matching plants with their IDs, names, types, and related counts.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Search term to match against plant name or variety"),
      type: z
        .enum(["VEGETABLE", "HERB", "FLOWER", "FRUIT", "OTHER"])
        .optional()
        .describe("Filter by plant type"),
    }),
    execute: async ({ query, type }) => {
      log.info("searchPlants tool called", { query, type });
      try {
        const plants = await getPlants({ name: query, type });
        log.info("searchPlants result", { count: plants.length });
        return {
          success: true as const,
          plants: plants.map((p) => ({
            id: p.id,
            name: p.name,
            variety: p.variety,
            type: p.type,
            daysToMaturity: p.daysToMaturity,
            sunRequirement: p.sunRequirement,
            waterNeeds: p.waterNeeds,
            seedCount: p._count.seeds,
            plantingCount: p._count.plantings,
          })),
        };
      } catch (error) {
        log.error("searchPlants tool failed", { error });
        return { success: false as const, error: "Failed to search plants. Please try again." };
      }
    },
  }),

  addPlant: tool({
    description:
      "Add a new plant to the catalog. Returns the created plant with its ID. Use this when the user wants to add a plant that doesn't exist yet.",
    inputSchema: z.object({
      name: z.string().describe("Plant name (e.g., 'Tomato', 'Basil')"),
      variety: z
        .string()
        .optional()
        .describe("Plant variety (e.g., 'Roma', 'Sweet Genovese')"),
      type: z
        .enum(["VEGETABLE", "HERB", "FLOWER", "FRUIT", "OTHER"])
        .optional()
        .describe("The category of plant"),
      daysToMaturity: z
        .number()
        .optional()
        .describe("Approximate number of days from planting to harvest"),
      sunRequirement: z
        .enum(["FULL_SUN", "PARTIAL_SUN", "SHADE"])
        .optional()
        .describe("How much sun the plant needs"),
      waterNeeds: z
        .enum(["LOW", "MODERATE", "HIGH"])
        .optional()
        .describe("How much water the plant needs"),
      growingNotes: z
        .string()
        .optional()
        .describe("Any additional growing tips or notes"),
    }),
    execute: async (params) => {
      log.info("addPlant tool called", { name: params.name, variety: params.variety });
      try {
        const plant = await createPlant(params);
        log.info("addPlant result", { id: plant.id, name: plant.name });
        return {
          success: true as const,
          plant: {
            id: plant.id,
            name: plant.name,
            variety: plant.variety,
            type: plant.type,
            daysToMaturity: plant.daysToMaturity,
            sunRequirement: plant.sunRequirement,
            waterNeeds: plant.waterNeeds,
          },
        };
      } catch (error) {
        log.error("addPlant tool failed", { error });
        return {
          success: false as const,
          error: "Failed to add plant. It may already exist with that name and variety.",
        };
      }
    },
  }),

  addSeed: tool({
    description:
      "Add seeds to the inventory for an existing plant. You must search for the plant first to get its ID. Use this when the user wants to record seed packets they have.",
    inputSchema: z.object({
      plantId: z
        .string()
        .describe("The ID of the plant this seed belongs to (get this from searchPlants first)"),
      quantity: z.number().describe("Number of seed packets or units"),
      quantityUnit: z
        .string()
        .optional()
        .default("packets")
        .describe("Unit of measurement (e.g., 'packets', 'grams', 'seeds')"),
      supplier: z
        .string()
        .optional()
        .describe("Where the seeds were purchased from"),
      viability: z
        .number()
        .optional()
        .describe("Estimated viability/germination rate as a percentage (0-100)"),
      notes: z.string().optional().describe("Any additional notes about these seeds"),
    }),
    execute: async (params) => {
      log.info("addSeed tool called", { plantId: params.plantId, quantity: params.quantity });
      try {
        const seed = await createSeed({
          plantId: params.plantId,
          quantity: params.quantity,
          quantityUnit: params.quantityUnit,
          supplier: params.supplier,
          viability: params.viability,
          notes: params.notes,
        });
        log.info("addSeed result", { id: seed.id });
        return {
          success: true as const,
          seed: {
            id: seed.id,
            plantId: seed.plantId,
            plantName: seed.plant.name,
            quantity: seed.quantity,
            quantityUnit: seed.quantityUnit,
            supplier: seed.supplier,
            viability: seed.viability,
          },
        };
      } catch (error) {
        log.error("addSeed tool failed", { error });
        return {
          success: false as const,
          error: "Failed to add seed. Make sure the plant ID is valid.",
        };
      }
    },
  }),

  updateInventory: tool({
    description:
      "Update an existing seed inventory entry. Use this to change quantity, viability, or notes on a seed record.",
    inputSchema: z.object({
      seedId: z.string().describe("The ID of the seed entry to update"),
      quantity: z.number().optional().describe("New quantity value"),
      viability: z
        .number()
        .optional()
        .describe("New viability percentage (0-100)"),
      notes: z.string().optional().describe("Updated notes"),
    }),
    execute: async ({ seedId, ...data }) => {
      log.info("updateInventory tool called", { seedId, data });
      try {
        const seed = await updateSeed(seedId, data);
        log.info("updateInventory result", { id: seed.id });
        return {
          success: true as const,
          seed: {
            id: seed.id,
            plantName: seed.plant.name,
            quantity: seed.quantity,
            quantityUnit: seed.quantityUnit,
            viability: seed.viability,
            notes: seed.notes,
          },
        };
      } catch (error) {
        log.error("updateInventory tool failed", { error });
        return {
          success: false as const,
          error: "Failed to update seed. Make sure the seed ID is valid.",
        };
      }
    },
  }),

  getPlantingSchedule: tool({
    description:
      "Get the planting schedule. Can be filtered by year, location, plant, or status. Returns a list of plantings with dates and status.",
    inputSchema: z.object({
      year: z.number().optional().describe("Filter by planting year (e.g., 2026)"),
      locationId: z
        .string()
        .optional()
        .describe("Filter by garden location ID"),
      plantId: z.string().optional().describe("Filter by plant ID"),
      status: z
        .string()
        .optional()
        .describe(
          "Filter by status: PLANNED, SOWN, GERMINATED, TRANSPLANTED, GROWING, HARVESTING, DONE, FAILED"
        ),
    }),
    execute: async (params) => {
      log.info("getPlantingSchedule tool called", params);
      try {
        const plantings = await getPlantings(params);
        log.info("getPlantingSchedule result", { count: plantings.length });
        return {
          success: true as const,
          plantings: plantings.map((p) => ({
            id: p.id,
            plantName: p.plant.name,
            plantVariety: p.plant.variety,
            locationName: p.location?.name ?? null,
            year: p.year,
            status: p.status,
            sowIndoorDate: p.sowIndoorDate?.toISOString() ?? null,
            sowOutdoorDate: p.sowOutdoorDate?.toISOString() ?? null,
            transplantDate: p.transplantDate?.toISOString() ?? null,
            harvestStart: p.harvestStart?.toISOString() ?? null,
            harvestEnd: p.harvestEnd?.toISOString() ?? null,
            notes: p.notes,
          })),
        };
      } catch (error) {
        log.error("getPlantingSchedule tool failed", { error });
        return { success: false as const, error: "Failed to get planting schedule." };
      }
    },
  }),

  createPlanting: tool({
    description:
      "Schedule a new planting for a plant at a garden location. Requires a plant ID (search for the plant first). Location ID is optional. Dates should be ISO strings.",
    inputSchema: z.object({
      plantId: z
        .string()
        .describe("The plant ID to create a planting for (search for the plant first)"),
      locationId: z
        .string()
        .optional()
        .describe("The garden location ID (use getLocations to find available locations)"),
      year: z
        .number()
        .optional()
        .describe("The planting year (defaults to current year)"),
      sowIndoorDate: z
        .string()
        .optional()
        .describe("Date to start seeds indoors (ISO date string, e.g., '2026-03-15')"),
      sowOutdoorDate: z
        .string()
        .optional()
        .describe("Date to sow seeds outdoors (ISO date string)"),
      transplantDate: z
        .string()
        .optional()
        .describe("Date to transplant seedlings (ISO date string)"),
      harvestStart: z
        .string()
        .optional()
        .describe("Expected harvest start date (ISO date string)"),
      harvestEnd: z
        .string()
        .optional()
        .describe("Expected harvest end date (ISO date string)"),
      notes: z.string().optional().describe("Any notes about this planting"),
    }),
    execute: async (params) => {
      log.info("createPlanting tool called", {
        plantId: params.plantId,
        locationId: params.locationId,
      });
      try {
        const plantingData = {
          plantId: params.plantId,
          locationId: params.locationId,
          year: params.year,
          sowIndoorDate: params.sowIndoorDate
            ? new Date(params.sowIndoorDate)
            : undefined,
          sowOutdoorDate: params.sowOutdoorDate
            ? new Date(params.sowOutdoorDate)
            : undefined,
          transplantDate: params.transplantDate
            ? new Date(params.transplantDate)
            : undefined,
          harvestStart: params.harvestStart
            ? new Date(params.harvestStart)
            : undefined,
          harvestEnd: params.harvestEnd
            ? new Date(params.harvestEnd)
            : undefined,
          notes: params.notes,
        };

        const planting = await createPlanting(plantingData);
        log.info("createPlanting result", { id: planting.id });
        return {
          success: true as const,
          planting: {
            id: planting.id,
            plantName: planting.plant.name,
            locationName: planting.location?.name ?? null,
            year: planting.year,
            status: planting.status,
            sowIndoorDate: planting.sowIndoorDate?.toISOString() ?? null,
            sowOutdoorDate: planting.sowOutdoorDate?.toISOString() ?? null,
            transplantDate: planting.transplantDate?.toISOString() ?? null,
            harvestStart: planting.harvestStart?.toISOString() ?? null,
            harvestEnd: planting.harvestEnd?.toISOString() ?? null,
          },
        };
      } catch (error) {
        log.error("createPlanting tool failed", { error });
        return {
          success: false as const,
          error:
            "Failed to create planting. Make sure the plant ID (and location ID if provided) are valid.",
        };
      }
    },
  }),

  updatePlanting: tool({
    description:
      "Update an existing planting's status, dates, or notes. Use this to track planting progress through its lifecycle.",
    inputSchema: z.object({
      plantingId: z.string().describe("The ID of the planting to update"),
      status: z
        .enum([
          "PLANNED",
          "SOWN",
          "GERMINATED",
          "TRANSPLANTED",
          "GROWING",
          "HARVESTING",
          "DONE",
          "FAILED",
        ])
        .optional()
        .describe("New planting status"),
      notes: z.string().optional().describe("Updated notes"),
      sowIndoorDate: z
        .string()
        .optional()
        .describe("Updated indoor sow date (ISO date string)"),
      sowOutdoorDate: z
        .string()
        .optional()
        .describe("Updated outdoor sow date (ISO date string)"),
      transplantDate: z
        .string()
        .optional()
        .describe("Updated transplant date (ISO date string)"),
      harvestStart: z
        .string()
        .optional()
        .describe("Updated harvest start date (ISO date string)"),
      harvestEnd: z
        .string()
        .optional()
        .describe("Updated harvest end date (ISO date string)"),
    }),
    execute: async ({ plantingId, ...data }) => {
      log.info("updatePlanting tool called", { plantingId, data });
      try {
        const updateData: Record<string, unknown> = {};

        if (data.status !== undefined) updateData.status = data.status;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.sowIndoorDate !== undefined)
          updateData.sowIndoorDate = new Date(data.sowIndoorDate);
        if (data.sowOutdoorDate !== undefined)
          updateData.sowOutdoorDate = new Date(data.sowOutdoorDate);
        if (data.transplantDate !== undefined)
          updateData.transplantDate = new Date(data.transplantDate);
        if (data.harvestStart !== undefined)
          updateData.harvestStart = new Date(data.harvestStart);
        if (data.harvestEnd !== undefined)
          updateData.harvestEnd = new Date(data.harvestEnd);

        const planting = await updatePlanting(plantingId, updateData);
        log.info("updatePlanting result", { id: planting.id });
        return {
          success: true as const,
          planting: {
            id: planting.id,
            plantName: planting.plant.name,
            locationName: planting.location?.name ?? null,
            year: planting.year,
            status: planting.status,
            notes: planting.notes,
          },
        };
      } catch (error) {
        log.error("updatePlanting tool failed", { error });
        return {
          success: false as const,
          error: "Failed to update planting. Make sure the planting ID is valid.",
        };
      }
    },
  }),

  getLocations: tool({
    description:
      "List all garden locations (beds, pots, containers, rows, greenhouse, indoor areas). Returns location names and IDs needed for creating plantings.",
    inputSchema: z.object({}),
    execute: async () => {
      log.info("getLocations tool called");
      try {
        const locations = await getLocations();
        log.info("getLocations result", { count: locations.length });
        return {
          success: true as const,
          locations: locations.map((l) => ({
            id: l.id,
            name: l.name,
            locationType: l.locationType,
            description: l.description,
            sunExposure: l.sunExposure,
            plantingCount: l._count.plantings,
          })),
        };
      } catch (error) {
        log.error("getLocations tool failed", { error });
        return { success: false as const, error: "Failed to get locations." };
      }
    },
  }),

  addLocation: tool({
    description:
      "Create a new garden location (bed, pot, container, row, greenhouse, indoor area). Use this when the user wants to add a new location to their garden.",
    inputSchema: z.object({
      name: z.string().describe("Location name (e.g., 'Big Greenhouse', 'Raised Bed A')"),
      locationType: z
        .enum(["BED", "POT", "CONTAINER", "ROW", "GREENHOUSE", "INDOOR", "OTHER"])
        .optional()
        .describe("The type of garden location"),
      description: z.string().optional().describe("Description of the location"),
      sunExposure: z
        .enum(["FULL_SUN", "PARTIAL_SUN", "SHADE"])
        .optional()
        .describe("Sun exposure level"),
      soilType: z.string().optional().describe("Type of soil (e.g., 'loamy', 'sandy')"),
      climateZone: z.string().optional().describe("USDA hardiness zone or climate zone"),
    }),
    execute: async (params) => {
      log.info("addLocation tool called", { name: params.name });
      try {
        const location = await createLocation(params);
        log.info("addLocation result", { id: location.id, name: location.name });
        return {
          success: true as const,
          location: {
            id: location.id,
            name: location.name,
            locationType: location.locationType,
            description: location.description,
            sunExposure: location.sunExposure,
          },
        };
      } catch (error) {
        log.error("addLocation tool failed", { error });
        return {
          success: false as const,
          error: "Failed to create location. It may already exist with that name.",
        };
      }
    },
  }),

  updateLocationTool: tool({
    description:
      "Update an existing garden location's details. Use getLocations first to find the location ID.",
    inputSchema: z.object({
      locationId: z.string().describe("The ID of the location to update (get from getLocations)"),
      name: z.string().optional().describe("New name for the location"),
      locationType: z
        .enum(["BED", "POT", "CONTAINER", "ROW", "GREENHOUSE", "INDOOR", "OTHER"])
        .optional()
        .describe("New location type"),
      description: z.string().optional().describe("New description"),
      sunExposure: z
        .enum(["FULL_SUN", "PARTIAL_SUN", "SHADE"])
        .optional()
        .describe("New sun exposure level"),
      soilType: z.string().optional().describe("New soil type"),
      climateZone: z.string().optional().describe("New climate zone"),
    }),
    execute: async ({ locationId, ...data }) => {
      log.info("updateLocation tool called", { locationId, data });
      try {
        const location = await updateLocation(locationId, data);
        log.info("updateLocation result", { id: location.id });
        return {
          success: true as const,
          location: {
            id: location.id,
            name: location.name,
            locationType: location.locationType,
            sunExposure: location.sunExposure,
          },
        };
      } catch (error) {
        log.error("updateLocation tool failed", { error });
        return { success: false as const, error: "Failed to update location." };
      }
    },
  }),

  deleteLocationTool: tool({
    description:
      "Delete a garden location. Use getLocations first to find the location ID. Plantings at this location will lose their location reference.",
    inputSchema: z.object({
      locationId: z.string().describe("The ID of the location to delete"),
    }),
    execute: async ({ locationId }) => {
      log.info("deleteLocation tool called", { locationId });
      try {
        const location = await deleteLocation(locationId);
        log.info("deleteLocation result", { id: location.id });
        return { success: true as const, deletedName: location.name };
      } catch (error) {
        log.error("deleteLocation tool failed", { error });
        return { success: false as const, error: "Failed to delete location." };
      }
    },
  }),

  updatePlantTool: tool({
    description:
      "Update an existing plant's details. Use searchPlants first to find the plant ID.",
    inputSchema: z.object({
      plantId: z.string().describe("The ID of the plant to update (get from searchPlants)"),
      name: z.string().optional().describe("New plant name"),
      variety: z.string().optional().describe("New variety name"),
      type: z
        .enum(["VEGETABLE", "HERB", "FLOWER", "FRUIT", "OTHER"])
        .optional()
        .describe("New plant type"),
      daysToMaturity: z.number().optional().describe("New days to maturity"),
      sunRequirement: z
        .enum(["FULL_SUN", "PARTIAL_SUN", "SHADE"])
        .optional()
        .describe("New sun requirement"),
      waterNeeds: z
        .enum(["LOW", "MODERATE", "HIGH"])
        .optional()
        .describe("New water needs"),
      growingNotes: z.string().optional().describe("New growing notes"),
    }),
    execute: async ({ plantId, ...data }) => {
      log.info("updatePlant tool called", { plantId, data });
      try {
        const plant = await updatePlant(plantId, data);
        log.info("updatePlant result", { id: plant.id });
        return {
          success: true as const,
          plant: {
            id: plant.id,
            name: plant.name,
            variety: plant.variety,
            type: plant.type,
            daysToMaturity: plant.daysToMaturity,
            sunRequirement: plant.sunRequirement,
            waterNeeds: plant.waterNeeds,
          },
        };
      } catch (error) {
        log.error("updatePlant tool failed", { error });
        return { success: false as const, error: "Failed to update plant." };
      }
    },
  }),

  deletePlantTool: tool({
    description:
      "Delete a plant from the catalog. Use searchPlants first to find the plant ID. This will also delete associated seeds and plantings.",
    inputSchema: z.object({
      plantId: z.string().describe("The ID of the plant to delete"),
    }),
    execute: async ({ plantId }) => {
      log.info("deletePlant tool called", { plantId });
      try {
        const plant = await deletePlant(plantId);
        log.info("deletePlant result", { id: plant.id });
        return { success: true as const, deletedName: plant.name };
      } catch (error) {
        log.error("deletePlant tool failed", { error });
        return { success: false as const, error: "Failed to delete plant." };
      }
    },
  }),

  getSeedInventory: tool({
    description:
      "List seed inventory entries. Can filter by plant or supplier. Returns seed details including plant name, quantity, supplier, and viability.",
    inputSchema: z.object({
      plantId: z.string().optional().describe("Filter seeds by plant ID"),
      supplier: z.string().optional().describe("Filter seeds by supplier name"),
    }),
    execute: async (params) => {
      log.info("getSeedInventory tool called", params);
      try {
        const seeds = await getSeeds(params);
        log.info("getSeedInventory result", { count: seeds.length });
        return {
          success: true as const,
          seeds: seeds.map((s) => ({
            id: s.id,
            plantId: s.plantId,
            plantName: s.plant.name,
            plantVariety: s.plant.variety,
            quantity: s.quantity,
            quantityUnit: s.quantityUnit,
            supplier: s.supplier,
            viability: s.viability,
            lotNumber: s.lotNumber,
            notes: s.notes,
            purchaseDate: s.purchaseDate?.toISOString() ?? null,
            expiryDate: s.expiryDate?.toISOString() ?? null,
          })),
        };
      } catch (error) {
        log.error("getSeedInventory tool failed", { error });
        return { success: false as const, error: "Failed to get seed inventory." };
      }
    },
  }),

  deleteSeedTool: tool({
    description:
      "Delete a seed inventory entry. Use getSeedInventory first to find the seed ID.",
    inputSchema: z.object({
      seedId: z.string().describe("The ID of the seed entry to delete"),
    }),
    execute: async ({ seedId }) => {
      log.info("deleteSeed tool called", { seedId });
      try {
        const seed = await deleteSeed(seedId);
        log.info("deleteSeed result", { id: seed.id });
        return { success: true as const, deletedSeedId: seed.id };
      } catch (error) {
        log.error("deleteSeed tool failed", { error });
        return { success: false as const, error: "Failed to delete seed." };
      }
    },
  }),

  deletePlantingTool: tool({
    description:
      "Delete a planting from the schedule. Use getPlantingSchedule first to find the planting ID.",
    inputSchema: z.object({
      plantingId: z.string().describe("The ID of the planting to delete"),
    }),
    execute: async ({ plantingId }) => {
      log.info("deletePlanting tool called", { plantingId });
      try {
        const planting = await deletePlanting(plantingId);
        log.info("deletePlanting result", { id: planting.id });
        return { success: true as const, deletedPlantingId: planting.id };
      } catch (error) {
        log.error("deletePlanting tool failed", { error });
        return { success: false as const, error: "Failed to delete planting." };
      }
    },
  }),

  getDashboardSummary: tool({
    description:
      "Get an overview of the garden including total plant count, seed count, active plantings, and upcoming tasks. Use this when the user asks for a summary or overview.",
    inputSchema: z.object({}),
    execute: async () => {
      log.info("getDashboardSummary tool called");
      try {
        const summary = await getDashboardSummary();
        log.info("getDashboardSummary result", {
          plantCount: summary.plantCount,
          seedCount: summary.seedCount,
        });
        return {
          success: true as const,
          summary: {
            plantCount: summary.plantCount,
            seedCount: summary.seedCount,
            locationCount: summary.locationCount,
            activePlantingCount: summary.activePlantingCount,
            upcomingPlantings: summary.upcomingPlantings.map((p) => ({
              id: p.id,
              plantName: p.plant.name,
              locationName: p.location?.name ?? null,
              status: p.status,
              sowIndoorDate: p.sowIndoorDate?.toISOString() ?? null,
              sowOutdoorDate: p.sowOutdoorDate?.toISOString() ?? null,
            })),
          },
        };
      } catch (error) {
        log.error("getDashboardSummary tool failed", { error });
        return { success: false as const, error: "Failed to get dashboard summary." };
      }
    },
  }),

  navigateTo: tool({
    description:
      "Navigate the user to a specific page in the app. Use this to help users find information or after performing an action (e.g., navigate to the plant detail page after adding a new plant).",
    inputSchema: z.object({
      page: z
        .enum(["dashboard", "plants", "seeds", "garden", "calendar", "chat"])
        .describe("The page to navigate to"),
      plantId: z
        .string()
        .optional()
        .describe("If provided, navigate to the detail page for this specific plant"),
      seedId: z
        .string()
        .optional()
        .describe("If provided, navigate to the detail page for this specific seed"),
    }),
    execute: async ({ page, plantId, seedId }) => {
      log.info("navigateTo tool called", { page, plantId, seedId });
      return {
        success: true as const,
        navigateTo: { page, plantId, seedId },
      };
    },
  }),
};
