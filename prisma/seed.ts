import "dotenv/config";

async function main() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const { PrismaPg } = await import("@prisma/adapter-pg");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  // Plants
  const tomato = await prisma.plant.upsert({
    where: { name_variety: { name: "Tomato", variety: "Cherokee Purple" } },
    update: {},
    create: {
      name: "Tomato",
      variety: "Cherokee Purple",
      type: "VEGETABLE",
      daysToMaturity: 80,
      sunRequirement: "FULL_SUN",
      waterNeeds: "MODERATE",
      growingNotes: "Indeterminate heirloom. Stake or cage. Rich, well-drained soil.",
    },
  });

  const basil = await prisma.plant.upsert({
    where: { name_variety: { name: "Basil", variety: "Genovese" } },
    update: {},
    create: {
      name: "Basil",
      variety: "Genovese",
      type: "HERB",
      daysToMaturity: 60,
      sunRequirement: "FULL_SUN",
      waterNeeds: "MODERATE",
      growingNotes: "Pinch flowers to encourage leaf growth. Companion to tomatoes.",
    },
  });

  const marigold = await prisma.plant.upsert({
    where: { name_variety: { name: "Marigold", variety: "French Dwarf" } },
    update: {},
    create: {
      name: "Marigold",
      variety: "French Dwarf",
      type: "FLOWER",
      daysToMaturity: 50,
      sunRequirement: "FULL_SUN",
      waterNeeds: "LOW",
      growingNotes: "Great companion plant. Deters pests. Deadhead for continuous blooms.",
    },
  });

  const pepper = await prisma.plant.upsert({
    where: { name_variety: { name: "Pepper", variety: "Jalapeño" } },
    update: {},
    create: {
      name: "Pepper",
      variety: "Jalapeño",
      type: "VEGETABLE",
      daysToMaturity: 75,
      sunRequirement: "FULL_SUN",
      waterNeeds: "MODERATE",
      growingNotes: "Start indoors 8-10 weeks before last frost. Likes warm soil.",
    },
  });

  const lettuce = await prisma.plant.upsert({
    where: { name_variety: { name: "Lettuce", variety: "Buttercrunch" } },
    update: {},
    create: {
      name: "Lettuce",
      variety: "Buttercrunch",
      type: "VEGETABLE",
      daysToMaturity: 55,
      sunRequirement: "PARTIAL_SUN",
      waterNeeds: "HIGH",
      growingNotes: "Cool-season crop. Bolt-resistant. Succession sow every 2-3 weeks.",
    },
  });

  const strawberry = await prisma.plant.upsert({
    where: { name_variety: { name: "Strawberry", variety: "Everbearing" } },
    update: {},
    create: {
      name: "Strawberry",
      variety: "Everbearing",
      type: "FRUIT",
      daysToMaturity: 90,
      sunRequirement: "FULL_SUN",
      waterNeeds: "MODERATE",
      growingNotes: "Remove first-year flowers for stronger plants. Mulch well.",
    },
  });

  // Seeds
  await prisma.seed.createMany({
    data: [
      { plantId: tomato.id, quantity: 3, quantityUnit: "packets", supplier: "Baker Creek", viability: 90 },
      { plantId: basil.id, quantity: 2, quantityUnit: "packets", supplier: "Johnny's Seeds", viability: 85 },
      { plantId: marigold.id, quantity: 5, quantityUnit: "packets", supplier: "Burpee", viability: 95 },
      { plantId: pepper.id, quantity: 1, quantityUnit: "packets", supplier: "Baker Creek", viability: 88 },
      { plantId: lettuce.id, quantity: 4, quantityUnit: "grams", supplier: "Territorial Seed", viability: 80 },
      { plantId: strawberry.id, quantity: 10, quantityUnit: "runners", supplier: "Local Nursery", viability: 100 },
    ],
    skipDuplicates: true,
  });

  // Garden Locations
  const raisedBed = await prisma.gardenLocation.upsert({
    where: { name: "Raised Bed A" },
    update: {},
    create: {
      name: "Raised Bed A",
      locationType: "BED",
      description: "4x8 raised bed, south-facing",
      sunExposure: "FULL_SUN",
      soilType: "Amended loam",
    },
  });

  const herbs = await prisma.gardenLocation.upsert({
    where: { name: "Herb Pots" },
    update: {},
    create: {
      name: "Herb Pots",
      locationType: "POT",
      description: "Collection of terracotta pots on back patio",
      sunExposure: "PARTIAL_SUN",
      soilType: "Potting mix",
    },
  });

  const greenhouse = await prisma.gardenLocation.upsert({
    where: { name: "Small Greenhouse" },
    update: {},
    create: {
      name: "Small Greenhouse",
      locationType: "GREENHOUSE",
      description: "6x8 polycarbonate greenhouse",
      sunExposure: "FULL_SUN",
      soilType: "Seed starting mix",
    },
  });

  // Plantings
  await prisma.planting.createMany({
    data: [
      {
        plantId: tomato.id,
        locationId: raisedBed.id,
        year: 2026,
        sowIndoorDate: new Date("2026-03-01"),
        transplantDate: new Date("2026-05-15"),
        harvestStart: new Date("2026-07-15"),
        harvestEnd: new Date("2026-09-30"),
        status: "PLANNED",
        notes: "Start indoors in greenhouse, transplant after last frost",
      },
      {
        plantId: basil.id,
        locationId: herbs.id,
        year: 2026,
        sowIndoorDate: new Date("2026-04-01"),
        transplantDate: new Date("2026-05-20"),
        status: "PLANNED",
        notes: "Direct sow some in herb pots too",
      },
      {
        plantId: lettuce.id,
        locationId: raisedBed.id,
        year: 2026,
        sowOutdoorDate: new Date("2026-03-15"),
        harvestStart: new Date("2026-05-01"),
        harvestEnd: new Date("2026-06-15"),
        status: "PLANNED",
        notes: "Early spring succession planting",
      },
      {
        plantId: pepper.id,
        locationId: greenhouse.id,
        year: 2026,
        sowIndoorDate: new Date("2026-02-15"),
        transplantDate: new Date("2026-05-25"),
        status: "SOWN",
        notes: "Started seeds in greenhouse",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data created successfully!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
