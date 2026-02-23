export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Package, MapPin, CalendarDays, Clock, AlertCircle } from "lucide-react";
import { db } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import { format, isWithinInterval, addDays } from "date-fns";
import { StatusBadge } from "@/components/calendar/status-badge";
import type { PlantingStatus } from "@/generated/prisma/enums";

const log = createLogger("page:dashboard");

type PlantingWithRelations = Awaited<
  ReturnType<typeof db.planting.findMany<{
    include: { plant: true; location: true };
  }>>
>[number];

interface UpcomingTask {
  planting: PlantingWithRelations;
  suggestion: string;
  urgency: "high" | "medium" | "low";
}

function getUpcomingTasks(plantings: PlantingWithRelations[]): UpcomingTask[] {
  const now = new Date();
  const tasks: UpcomingTask[] = [];

  for (const planting of plantings) {
    const status = planting.status as PlantingStatus;

    // PLANNED plantings with sowIndoorDate within next 14 days
    if (status === "PLANNED" && planting.sowIndoorDate) {
      try {
        if (
          isWithinInterval(planting.sowIndoorDate, {
            start: now,
            end: addDays(now, 14),
          })
        ) {
          tasks.push({
            planting,
            suggestion: `Time to start seeds indoors (${format(planting.sowIndoorDate, "MMM d")})`,
            urgency: "high",
          });
          continue;
        }
      } catch {
        // isWithinInterval can throw if dates are invalid
      }
    }

    // PLANNED plantings with sowOutdoorDate within next 14 days
    if (status === "PLANNED" && planting.sowOutdoorDate) {
      try {
        if (
          isWithinInterval(planting.sowOutdoorDate, {
            start: now,
            end: addDays(now, 14),
          })
        ) {
          tasks.push({
            planting,
            suggestion: `Time to sow outdoors (${format(planting.sowOutdoorDate, "MMM d")})`,
            urgency: "high",
          });
          continue;
        }
      } catch {
        // isWithinInterval can throw if dates are invalid
      }
    }

    // SOWN plantings: remind to check for germination
    if (status === "SOWN") {
      tasks.push({
        planting,
        suggestion: "Check for germination and update status",
        urgency: "medium",
      });
      continue;
    }

    // GERMINATED: remind to prepare for transplant
    if (status === "GERMINATED" && planting.transplantDate) {
      try {
        if (
          isWithinInterval(planting.transplantDate, {
            start: now,
            end: addDays(now, 14),
          })
        ) {
          tasks.push({
            planting,
            suggestion: `Prepare for transplanting (${format(planting.transplantDate, "MMM d")})`,
            urgency: "medium",
          });
          continue;
        }
      } catch {
        // isWithinInterval can throw if dates are invalid
      }
    }

    // GROWING: remind when harvest window approaches
    if (status === "GROWING" && planting.harvestStart) {
      try {
        if (
          isWithinInterval(planting.harvestStart, {
            start: now,
            end: addDays(now, 14),
          })
        ) {
          tasks.push({
            planting,
            suggestion: `Harvest window opening soon (${format(planting.harvestStart, "MMM d")})`,
            urgency: "low",
          });
          continue;
        }
      } catch {
        // isWithinInterval can throw if dates are invalid
      }
    }
  }

  // Sort by urgency
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return tasks;
}

const URGENCY_STYLES = {
  high: "border-l-red-500",
  medium: "border-l-yellow-500",
  low: "border-l-blue-500",
};

export default async function DashboardPage() {
  log.debug("DashboardPage rendering");

  const [plantCount, seedCount, locationCount, plantingCount] =
    await Promise.all([
      db.plant.count(),
      db.seed.count(),
      db.gardenLocation.count(),
      db.planting.count({ where: { status: { not: "DONE" } } }),
    ]);

  const stats = [
    { label: "Plants", value: plantCount, icon: Sprout, color: "text-green-600" },
    { label: "Seeds", value: seedCount, icon: Package, color: "text-amber-600" },
    { label: "Locations", value: locationCount, icon: MapPin, color: "text-blue-600" },
    { label: "Active Plantings", value: plantingCount, icon: CalendarDays, color: "text-purple-600" },
  ];

  // Fetch active plantings for upcoming tasks
  const activePlantings = await db.planting.findMany({
    where: {
      status: { in: ["PLANNED", "SOWN", "GERMINATED", "TRANSPLANTED", "GROWING"] },
    },
    include: { plant: true, location: true },
    orderBy: { sowIndoorDate: "asc" },
  });

  const upcomingTasks = getUpcomingTasks(activePlantings);

  // Also fetch general upcoming plantings for the second section
  const upcomingPlantings = await db.planting.findMany({
    where: { status: { in: ["PLANNED", "SOWN"] } },
    include: { plant: true, location: true },
    orderBy: { sowIndoorDate: "asc" },
    take: 5,
  });

  log.info("DashboardPage loaded", {
    plantCount,
    seedCount,
    locationCount,
    plantingCount,
    upcomingTaskCount: upcomingTasks.length,
    upcomingPlantingCount: upcomingPlantings.length,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Tasks section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <p className="text-muted-foreground">
              No upcoming tasks. Your garden is on track!
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 8).map((task) => (
                <div
                  key={task.planting.id}
                  className={`flex items-start justify-between rounded-md border border-l-4 p-3 ${URGENCY_STYLES[task.urgency]}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {task.planting.plant.name}
                        {task.planting.plant.variety && (
                          <span className="font-normal text-muted-foreground ml-1">
                            ({task.planting.plant.variety})
                          </span>
                        )}
                      </p>
                      <StatusBadge status={task.planting.status} />
                    </div>
                    <p className="text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      {task.suggestion}
                    </p>
                    {task.planting.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {task.planting.location.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Plantings section */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Plantings</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingPlantings.length === 0 ? (
            <p className="text-muted-foreground">No upcoming plantings. Ask the AI assistant to help plan your garden!</p>
          ) : (
            <div className="space-y-3">
              {upcomingPlantings.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {p.plant.name} {p.plant.variety && `(${p.plant.variety})`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {p.location?.name ?? "No location"} &middot; {p.status}
                    </p>
                  </div>
                  {p.notes && (
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      {p.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
