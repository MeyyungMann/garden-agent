import { afterEach } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/plant_organizer_test?schema=public";

const adapter = new PrismaPg({ connectionString: testDatabaseUrl });
export const testDb = new PrismaClient({ adapter });

// Override the db module to use the test database
import { vi } from "vitest";
vi.mock("@/lib/db", () => ({
  db: testDb,
}));

// Clean up after each test in dependency order
afterEach(async () => {
  await testDb.chatMessage.deleteMany();
  await testDb.chatSession.deleteMany();
  await testDb.planting.deleteMany();
  await testDb.seed.deleteMany();
  await testDb.plant.deleteMany();
  await testDb.gardenLocation.deleteMany();
});
