import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock server actions (they can't run in jsdom)
vi.mock("@/actions/plants", () => ({
  getPlants: vi.fn(),
  getPlantById: vi.fn(),
  createPlant: vi.fn(),
  updatePlant: vi.fn(),
  deletePlant: vi.fn(),
}));

vi.mock("@/actions/seeds", () => ({
  getSeeds: vi.fn(),
  createSeed: vi.fn(),
  updateSeed: vi.fn(),
  deleteSeed: vi.fn(),
}));

vi.mock("@/actions/locations", () => ({
  getLocations: vi.fn(),
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn(),
}));

vi.mock("@/actions/plantings", () => ({
  getPlantings: vi.fn(),
  createPlanting: vi.fn(),
  updatePlanting: vi.fn(),
  deletePlanting: vi.fn(),
}));

vi.mock("@/actions/dashboard", () => ({
  getDashboardSummary: vi.fn(),
}));

vi.mock("@/actions/chat", () => ({
  createSession: vi.fn(),
  getLatestSession: vi.fn(),
  saveMessage: vi.fn(),
  getSessionContext: vi.fn(),
  summarizeMessages: vi.fn(),
  updateSessionSummary: vi.fn(),
}));
