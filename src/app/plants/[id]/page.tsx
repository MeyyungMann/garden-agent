import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlantActions } from "@/components/crud/plant-actions";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plant = await db.plant.findUnique({
    where: { id },
    include: {
      seeds: true,
      plantings: { include: { location: true } },
      companions: true,
    },
  });

  if (!plant) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/plants" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to Plants
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {plant.name}
          {plant.variety && (
            <span className="text-muted-foreground font-normal text-xl ml-2">
              {plant.variety}
            </span>
          )}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge>{plant.type}</Badge>
          <PlantActions
            plant={{
              id: plant.id,
              name: plant.name,
              variety: plant.variety,
              type: plant.type,
              daysToMaturity: plant.daysToMaturity,
              sunRequirement: plant.sunRequirement,
              waterNeeds: plant.waterNeeds,
              growingNotes: plant.growingNotes,
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {plant.daysToMaturity && <p><strong>Days to Maturity:</strong> {plant.daysToMaturity}</p>}
            {plant.sunRequirement && <p><strong>Sun:</strong> {plant.sunRequirement.replace("_", " ")}</p>}
            {plant.waterNeeds && <p><strong>Water:</strong> {plant.waterNeeds}</p>}
            {plant.growingNotes && <p><strong>Notes:</strong> {plant.growingNotes}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seeds ({plant.seeds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {plant.seeds.length === 0 ? (
              <p className="text-muted-foreground text-sm">No seeds recorded</p>
            ) : (
              <div className="space-y-2">
                {plant.seeds.map((seed) => (
                  <div key={seed.id} className="rounded border p-2 text-sm">
                    <p>
                      {seed.quantity} {seed.quantityUnit}
                      {seed.supplier && ` from ${seed.supplier}`}
                    </p>
                    {seed.viability != null && (
                      <p className="text-muted-foreground">{seed.viability}% viability</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plantings ({plant.plantings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {plant.plantings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No plantings yet</p>
          ) : (
            <div className="space-y-2">
              {plant.plantings.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{p.location?.name ?? "No location"}</p>
                    <p className="text-sm text-muted-foreground">{p.year}</p>
                  </div>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
