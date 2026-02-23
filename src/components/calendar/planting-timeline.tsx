import { format, differenceInDays, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";

interface PlantingTimelineProps {
  sowIndoorDate: Date | null;
  sowOutdoorDate: Date | null;
  transplantDate: Date | null;
  harvestStart: Date | null;
  harvestEnd: Date | null;
  year: number;
}

interface Segment {
  label: string;
  start: Date;
  end: Date;
  color: string;
}

function buildSegments(props: PlantingTimelineProps): Segment[] {
  const { sowIndoorDate, sowOutdoorDate, transplantDate, harvestStart, harvestEnd } = props;

  const dates: { key: string; date: Date; color: string }[] = [];

  if (sowIndoorDate) dates.push({ key: "Indoor Sow", date: sowIndoorDate, color: "bg-blue-400" });
  if (sowOutdoorDate) dates.push({ key: "Outdoor Sow", date: sowOutdoorDate, color: "bg-yellow-400" });
  if (transplantDate) dates.push({ key: "Transplant", date: transplantDate, color: "bg-green-400" });
  if (harvestStart) dates.push({ key: "Harvest", date: harvestStart, color: "bg-orange-400" });
  if (harvestEnd) dates.push({ key: "Harvest End", date: harvestEnd, color: "bg-orange-400" });

  if (dates.length === 0) return [];

  // Sort by date
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());

  const segments: Segment[] = [];

  for (let i = 0; i < dates.length - 1; i++) {
    segments.push({
      label: dates[i].key,
      start: dates[i].date,
      end: dates[i + 1].date,
      color: dates[i].color,
    });
  }

  // Add a small segment for the last date point if only one date
  if (dates.length === 1) {
    segments.push({
      label: dates[0].key,
      start: dates[0].date,
      end: dates[0].date,
      color: dates[0].color,
    });
  }

  return segments;
}

export function PlantingTimeline(props: PlantingTimelineProps) {
  const { year } = props;
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const totalDays = differenceInDays(yearEnd, yearStart) + 1;

  const segments = buildSegments(props);
  const now = new Date();
  const showTodayMarker = isWithinInterval(now, { start: yearStart, end: yearEnd });
  const todayOffset = showTodayMarker
    ? (differenceInDays(now, yearStart) / totalDays) * 100
    : 0;

  if (segments.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">No dates set</div>
    );
  }

  // Calculate the overall range for display
  const allDates = segments.flatMap((s) => [s.start, s.end]);
  const minDate = allDates.reduce((a, b) => (a < b ? a : b));
  const maxDate = allDates.reduce((a, b) => (a > b ? a : b));

  const rangeStartOffset = (differenceInDays(minDate, yearStart) / totalDays) * 100;
  const rangeEndOffset = (differenceInDays(maxDate, yearStart) / totalDays) * 100;

  return (
    <div className="space-y-1">
      {/* Month markers */}
      <div className="relative h-4 text-[10px] text-muted-foreground">
        {Array.from({ length: 12 }, (_, i) => {
          const monthStart = new Date(year, i, 1);
          const offset = (differenceInDays(monthStart, yearStart) / totalDays) * 100;
          return (
            <span
              key={i}
              className="absolute"
              style={{ left: `${offset}%` }}
            >
              {format(monthStart, "MMM")}
            </span>
          );
        })}
      </div>

      {/* Timeline bar */}
      <div className="relative h-5 bg-muted rounded-full overflow-hidden">
        {segments.map((segment, i) => {
          const startPct = (differenceInDays(segment.start, yearStart) / totalDays) * 100;
          const endPct = (differenceInDays(segment.end, yearStart) / totalDays) * 100;
          // Minimum visible width of 0.5%
          const width = Math.max(endPct - startPct, 0.5);

          return (
            <div
              key={i}
              className={cn("absolute h-full rounded-sm", segment.color)}
              style={{
                left: `${startPct}%`,
                width: `${width}%`,
              }}
              title={`${segment.label}: ${format(segment.start, "MMM d")} - ${format(segment.end, "MMM d")}`}
            />
          );
        })}

        {/* Today marker */}
        {showTodayMarker && (
          <div
            className="absolute top-0 h-full w-0.5 bg-red-500 z-10"
            style={{ left: `${todayOffset}%` }}
            title={`Today: ${format(now, "MMM d, yyyy")}`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {rangeStartOffset >= 0 && (
          <span>
            {format(minDate, "MMM d")} &mdash; {format(maxDate, "MMM d")}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-blue-400" /> Indoor Sow
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-yellow-400" /> Outdoor Sow
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-green-400" /> Transplant
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-orange-400" /> Harvest
        </span>
        {showTodayMarker && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-0.5 bg-red-500" /> Today
          </span>
        )}
      </div>
    </div>
  );
}
