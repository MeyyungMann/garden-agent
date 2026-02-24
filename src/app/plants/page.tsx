export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Droplets } from "lucide-react";
import Link from "next/link";
import { AddPlantButton } from "@/components/crud/plant-actions";

export default async function PlantsPage() {
  const plants = await db.plant.findMany({
    include: { _count: { select: { seeds: true, plantings: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Plants</h1>
        <AddPlantButton />
      </div>

      {plants.length === 0 ? (
        <p className="text-muted-foreground">
          No plants yet. Ask the AI assistant to add some!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <Link key={plant.id} href={`/plants/${plant.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {plant.name}
                      {plant.variety && (
                        <span className="text-muted-foreground font-normal text-sm ml-2">
                          {plant.variety}
                        </span>
                      )}
                    </CardTitle>
                    <Badge variant="secondary">{plant.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {plant.sunRequirement && (
                      <span className="flex items-center gap-1">
                        <Sun className="h-3 w-3" />
                        {plant.sunRequirement.replace("_", " ")}
                      </span>
                    )}
                    {plant.waterNeeds && (
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {plant.waterNeeds}
                      </span>
                    )}
                    {plant.daysToMaturity && (
                      <span>{plant.daysToMaturity} days</span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                    <span>{plant._count.seeds} seed lots</span>
                    <span>{plant._count.plantings} plantings</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
