"use client";

import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Package,
  CalendarDays,
  MapPin,
  LayoutDashboard,
  Navigation,
  RefreshCw,
  Loader2,
} from "lucide-react";

const TOOL_ICONS: Record<string, React.ElementType> = {
  searchPlants: Search,
  addPlant: Plus,
  addSeed: Package,
  updateInventory: RefreshCw,
  getPlantingSchedule: CalendarDays,
  createPlanting: Plus,
  updatePlanting: RefreshCw,
  getLocations: MapPin,
  getDashboardSummary: LayoutDashboard,
  navigateTo: Navigation,
};

const TOOL_LABELS: Record<string, string> = {
  searchPlants: "Searching plants",
  addPlant: "Adding plant",
  addSeed: "Adding seed",
  updateInventory: "Updating inventory",
  getPlantingSchedule: "Getting schedule",
  createPlanting: "Creating planting",
  updatePlanting: "Updating planting",
  getLocations: "Getting locations",
  getDashboardSummary: "Getting summary",
  navigateTo: "Navigating",
};

interface ToolResultCardProps {
  toolName: string;
  state: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export function ToolResultCard({ toolName, state, args, result }: ToolResultCardProps) {
  const Icon = TOOL_ICONS[toolName] || RefreshCw;
  const label = TOOL_LABELS[toolName] || toolName;

  const isPending = state === "call" || state === "partial-call";

  return (
    <div className="my-1 rounded border bg-background p-2 text-xs">
      <div className="flex items-center gap-2">
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <Icon className="h-3 w-3 text-muted-foreground" />
        )}
        <span className="font-medium">{label}</span>
        <Badge variant="outline" className="text-[10px] px-1 py-0">
          {isPending ? "running" : "done"}
        </Badge>
      </div>
      {args && Object.keys(args).length > 0 && (
        <div className="mt-1 text-muted-foreground">
          {Object.entries(args).map(([key, value]) => (
            <span key={key} className="mr-2">
              {key}: {String(value)}
            </span>
          ))}
        </div>
      )}
      {result != null && !isPending ? (
        <ResultSummary toolName={toolName} result={result} />
      ) : null}
    </div>
  );
}

function ResultSummary({ toolName, result }: { toolName: string; result: unknown }) {
  const data = result as Record<string, unknown>;

  if (!data.success && data.error) {
    return <p className="mt-1 text-destructive">Error: {String(data.error)}</p>;
  }

  if (toolName === "searchPlants" && Array.isArray(data.plants)) {
    return (
      <p className="mt-1 text-muted-foreground">
        Found {data.plants.length} plant{data.plants.length !== 1 ? "s" : ""}
      </p>
    );
  }

  if (toolName === "getDashboardSummary" && data.success) {
    return (
      <p className="mt-1 text-muted-foreground">
        {String(data.plantCount)} plants, {String(data.seedCount)} seeds, {String(data.activePlantingCount)} active
      </p>
    );
  }

  if (toolName === "getLocations" && Array.isArray(data.locations)) {
    return (
      <p className="mt-1 text-muted-foreground">
        {data.locations.length} location{data.locations.length !== 1 ? "s" : ""}
      </p>
    );
  }

  if (toolName === "navigateTo") {
    return <p className="mt-1 text-muted-foreground">Navigated</p>;
  }

  if (data.success) {
    return <p className="mt-1 text-green-600">Success</p>;
  }

  return null;
}
