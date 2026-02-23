export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import { format, getMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { StatusBadge } from "@/components/calendar/status-badge";
import { PlantingTimeline } from "@/components/calendar/planting-timeline";
import { YearSelector } from "@/components/calendar/year-selector";

const log = createLogger("page:calendar");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type PlantingWithRelations = Awaited<
  ReturnType<typeof db.planting.findMany<{
    include: { plant: true; location: true };
  }>>
>[number];

function getEarliestDate(planting: PlantingWithRelations): Date | null {
  return (
    planting.sowIndoorDate ??
    planting.sowOutdoorDate ??
    planting.transplantDate ??
    planting.harvestStart ??
    null
  );
}

function groupByMonth(plantings: PlantingWithRelations[]): Map<number, PlantingWithRelations[]> {
  const groups = new Map<number, PlantingWithRelations[]>();

  for (const planting of plantings) {
    const earliest = getEarliestDate(planting);
    const month = earliest ? getMonth(earliest) : 0; // default to January if no dates
    if (!groups.has(month)) {
      groups.set(month, []);
    }
    groups.get(month)!.push(planting);
  }

  return groups;
}

interface CalendarPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const currentYear = params.year ? parseInt(params.year, 10) : new Date().getFullYear();

  log.debug("CalendarPage rendering", { year: currentYear });

  const plantings = await db.planting.findMany({
    where: { year: currentYear },
    include: { plant: true, location: true },
    orderBy: [{ sowIndoorDate: "asc" }, { sowOutdoorDate: "asc" }, { transplantDate: "asc" }],
  });

  log.info("CalendarPage loaded plantings", { year: currentYear, count: plantings.length });

  const monthGroups = groupByMonth(plantings);
  const sortedMonths = Array.from(monthGroups.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Planting Calendar</h1>
        <YearSelector currentYear={currentYear} />
      </div>

      {plantings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-lg">
              No plantings for {currentYear}.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Ask the AI assistant to help plan your growing season!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map((monthIndex) => {
            const monthPlantings = monthGroups.get(monthIndex)!;
            return (
              <section key={monthIndex} className="space-y-3">
                <h2 className="text-xl font-semibold text-muted-foreground border-b pb-2">
                  {MONTH_NAMES[monthIndex]}
                </h2>

                <div className="grid gap-3">
                  {monthPlantings.map((planting) => (
                    <Card key={planting.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">
                            {planting.plant.name}
                            {planting.plant.variety && (
                              <span className="font-normal text-muted-foreground ml-1">
                                ({planting.plant.variety})
                              </span>
                            )}
                          </CardTitle>
                          <StatusBadge status={planting.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Date fields */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                          <DateField label="Sow Indoor" date={planting.sowIndoorDate} />
                          <DateField label="Sow Outdoor" date={planting.sowOutdoorDate} />
                          <DateField label="Transplant" date={planting.transplantDate} />
                          <DateField label="Harvest Start" date={planting.harvestStart} />
                          <DateField label="Harvest End" date={planting.harvestEnd} />
                        </div>

                        {/* Timeline visualization */}
                        <PlantingTimeline
                          sowIndoorDate={planting.sowIndoorDate}
                          sowOutdoorDate={planting.sowOutdoorDate}
                          transplantDate={planting.transplantDate}
                          harvestStart={planting.harvestStart}
                          harvestEnd={planting.harvestEnd}
                          year={currentYear}
                        />

                        {/* Location and notes */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {planting.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {planting.location.name}
                            </span>
                          )}
                          {!planting.location && <span>No location</span>}
                          {planting.notes && (
                            <>
                              <span>&middot;</span>
                              <span className="truncate max-w-sm">{planting.notes}</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DateField({ label, date }: { label: string; date: Date | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">
        {date ? format(date, "MMM d") : "\u2014"}
      </p>
    </div>
  );
}
