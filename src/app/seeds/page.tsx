export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AddSeedButton, SeedActions } from "@/components/crud/seed-actions";

export default async function SeedsPage() {
  const [seeds, plants] = await Promise.all([
    db.seed.findMany({
      include: { plant: true },
      orderBy: { createdAt: "desc" },
    }),
    db.plant.findMany({
      select: { id: true, name: true, variety: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Seed Inventory</h1>
        <AddSeedButton plants={plants} />
      </div>

      {seeds.length === 0 ? (
        <p className="text-muted-foreground">
          No seeds yet. Ask the AI assistant to add some!
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Viability</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seeds.map((seed) => (
                <TableRow key={seed.id}>
                  <TableCell>
                    <Link
                      href={`/plants/${seed.plantId}`}
                      className="font-medium hover:underline"
                    >
                      {seed.plant.name}
                      {seed.plant.variety && ` (${seed.plant.variety})`}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{seed.plant.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {seed.quantity} {seed.quantityUnit}
                  </TableCell>
                  <TableCell>{seed.supplier ?? "—"}</TableCell>
                  <TableCell>
                    {seed.viability != null ? `${seed.viability}%` : "—"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {seed.notes ?? "—"}
                  </TableCell>
                  <TableCell>
                    <SeedActions
                      seed={{
                        id: seed.id,
                        plantId: seed.plantId,
                        quantity: seed.quantity,
                        quantityUnit: seed.quantityUnit,
                        supplier: seed.supplier,
                        purchaseDate: seed.purchaseDate,
                        expiryDate: seed.expiryDate,
                        viability: seed.viability,
                        lotNumber: seed.lotNumber,
                        notes: seed.notes,
                      }}
                      plants={plants}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
