-- CreateEnum
CREATE TYPE "PlantType" AS ENUM ('VEGETABLE', 'HERB', 'FLOWER', 'FRUIT', 'OTHER');

-- CreateEnum
CREATE TYPE "SunRequirement" AS ENUM ('FULL_SUN', 'PARTIAL_SUN', 'SHADE');

-- CreateEnum
CREATE TYPE "WaterNeeds" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('BED', 'POT', 'CONTAINER', 'ROW', 'GREENHOUSE', 'INDOOR', 'OTHER');

-- CreateEnum
CREATE TYPE "PlantingStatus" AS ENUM ('PLANNED', 'SOWN', 'GERMINATED', 'TRANSPLANTED', 'GROWING', 'HARVESTING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variety" TEXT,
    "type" "PlantType" NOT NULL DEFAULT 'OTHER',
    "photoUrl" TEXT,
    "growingNotes" TEXT,
    "daysToMaturity" INTEGER,
    "sunRequirement" "SunRequirement",
    "waterNeeds" "WaterNeeds",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seed" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "quantityUnit" TEXT NOT NULL DEFAULT 'packets',
    "supplier" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "viability" INTEGER,
    "lotNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GardenLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationType" "LocationType" NOT NULL DEFAULT 'BED',
    "description" TEXT,
    "sunExposure" "SunRequirement",
    "soilType" TEXT,
    "climateZone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GardenLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Planting" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "locationId" TEXT,
    "year" INTEGER NOT NULL DEFAULT 2026,
    "sowIndoorDate" TIMESTAMP(3),
    "sowOutdoorDate" TIMESTAMP(3),
    "transplantDate" TIMESTAMP(3),
    "harvestStart" TIMESTAMP(3),
    "harvestEnd" TIMESTAMP(3),
    "status" "PlantingStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Planting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompanionPlants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompanionPlants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plant_name_variety_key" ON "Plant"("name", "variety");

-- CreateIndex
CREATE UNIQUE INDEX "GardenLocation_name_key" ON "GardenLocation"("name");

-- CreateIndex
CREATE INDEX "_CompanionPlants_B_index" ON "_CompanionPlants"("B");

-- AddForeignKey
ALTER TABLE "Seed" ADD CONSTRAINT "Seed_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planting" ADD CONSTRAINT "Planting_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planting" ADD CONSTRAINT "Planting_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "GardenLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanionPlants" ADD CONSTRAINT "_CompanionPlants_A_fkey" FOREIGN KEY ("A") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanionPlants" ADD CONSTRAINT "_CompanionPlants_B_fkey" FOREIGN KEY ("B") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
