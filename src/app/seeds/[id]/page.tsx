import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function SeedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seed = await db.seed.findUnique({
    where: { id },
    include: { plant: true },
  });

  if (!seed) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/seeds" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to Seeds
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {seed.plant.name}
          {seed.plant.variety && (
            <span className="text-muted-foreground font-normal text-xl ml-2">
              {seed.plant.variety}
            </span>
          )}
        </h1>
        <Badge className="mt-2">{seed.plant.type}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seed Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Quantity:</strong> {seed.quantity} {seed.quantityUnit}</p>
          {seed.supplier && <p><strong>Supplier:</strong> {seed.supplier}</p>}
          {seed.viability != null && <p><strong>Viability:</strong> {seed.viability}%</p>}
          {seed.lotNumber && <p><strong>Lot Number:</strong> {seed.lotNumber}</p>}
          {seed.purchaseDate && <p><strong>Purchase Date:</strong> {seed.purchaseDate.toLocaleDateString()}</p>}
          {seed.expiryDate && <p><strong>Expiry Date:</strong> {seed.expiryDate.toLocaleDateString()}</p>}
          {seed.notes && <p><strong>Notes:</strong> {seed.notes}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
