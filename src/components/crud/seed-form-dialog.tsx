"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSeed, updateSeed } from "@/actions/seeds";
import { toDateInputValue, parseDateInput } from "@/lib/format";

interface PlantOption {
  id: string;
  name: string;
  variety: string | null;
}

interface SeedData {
  id: string;
  plantId: string;
  quantity: number;
  quantityUnit: string | null;
  supplier: string | null;
  purchaseDate: Date | null;
  expiryDate: Date | null;
  viability: number | null;
  lotNumber: string | null;
  notes: string | null;
}

interface SeedFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plants: PlantOption[];
  seed?: SeedData;
}

export function SeedFormDialog({ open, onOpenChange, plants, seed }: SeedFormDialogProps) {
  const router = useRouter();
  const isEdit = !!seed;

  const [plantId, setPlantId] = useState(seed?.plantId ?? "");
  const [quantity, setQuantity] = useState(seed?.quantity?.toString() ?? "");
  const [quantityUnit, setQuantityUnit] = useState(seed?.quantityUnit ?? "seeds");
  const [supplier, setSupplier] = useState(seed?.supplier ?? "");
  const [purchaseDate, setPurchaseDate] = useState(toDateInputValue(seed?.purchaseDate));
  const [expiryDate, setExpiryDate] = useState(toDateInputValue(seed?.expiryDate));
  const [viability, setViability] = useState(seed?.viability?.toString() ?? "");
  const [lotNumber, setLotNumber] = useState(seed?.lotNumber ?? "");
  const [notes, setNotes] = useState(seed?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      plantId,
      quantity: parseInt(quantity, 10),
      quantityUnit: quantityUnit.trim() || undefined,
      supplier: supplier.trim() || undefined,
      purchaseDate: parseDateInput(purchaseDate),
      expiryDate: parseDateInput(expiryDate),
      viability: viability ? parseInt(viability, 10) : undefined,
      lotNumber: lotNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updateSeed(seed.id, data);
      } else {
        await createSeed(data);
      }
      router.refresh();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save seed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Seed" : "Add Seed"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Plant *</Label>
            <Select value={plantId} onValueChange={setPlantId}>
              <SelectTrigger><SelectValue placeholder="Select a plant..." /></SelectTrigger>
              <SelectContent>
                {plants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}{p.variety ? ` (${p.variety})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantityUnit">Unit</Label>
              <Input
                id="quantityUnit"
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                placeholder="seeds"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="viability">Viability (%)</Label>
              <Input
                id="viability"
                type="number"
                min={0}
                max={100}
                value={viability}
                onChange={(e) => setViability(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lotNumber">Lot Number</Label>
              <Input id="lotNumber" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !plantId || !quantity}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Seed"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
