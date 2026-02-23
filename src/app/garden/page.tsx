export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function GardenPage() {
  const locations = await db.gardenLocation.findMany({
    include: { _count: { select: { plantings: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Garden Locations</h1>
      </div>

      {locations.length === 0 ? (
        <p className="text-muted-foreground">
          No garden locations yet. Ask the AI assistant to set some up!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{loc.name}</CardTitle>
                  <Badge variant="secondary">{loc.locationType}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {loc.description && (
                  <p className="text-muted-foreground">{loc.description}</p>
                )}
                {loc.sunExposure && (
                  <p><strong>Sun:</strong> {loc.sunExposure.replace("_", " ")}</p>
                )}
                {loc.soilType && (
                  <p><strong>Soil:</strong> {loc.soilType}</p>
                )}
                <p className="text-muted-foreground">
                  {loc._count.plantings} plantings
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
