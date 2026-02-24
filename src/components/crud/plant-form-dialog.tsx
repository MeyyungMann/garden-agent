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
import { createPlant, updatePlant } from "@/actions/plants";
import { formatEnum } from "@/lib/format";

const PLANT_TYPES = ["VEGETABLE", "HERB", "FLOWER", "FRUIT", "OTHER"] as const;
const SUN_REQUIREMENTS = ["FULL_SUN", "PARTIAL_SUN", "SHADE"] as const;
const WATER_NEEDS = ["LOW", "MODERATE", "HIGH"] as const;

interface PlantData {
  id: string;
  name: string;
  variety: string | null;
  type: string;
  daysToMaturity: number | null;
  sunRequirement: string | null;
  waterNeeds: string | null;
  growingNotes: string | null;
}

interface PlantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plant?: PlantData;
}

export function PlantFormDialog({ open, onOpenChange, plant }: PlantFormDialogProps) {
  const router = useRouter();
  const isEdit = !!plant;

  const [name, setName] = useState(plant?.name ?? "");
  const [variety, setVariety] = useState(plant?.variety ?? "");
  const [type, setType] = useState(plant?.type ?? "VEGETABLE");
  const [daysToMaturity, setDaysToMaturity] = useState(plant?.daysToMaturity?.toString() ?? "");
  const [sunRequirement, setSunRequirement] = useState(plant?.sunRequirement ?? "");
  const [waterNeeds, setWaterNeeds] = useState(plant?.waterNeeds ?? "");
  const [growingNotes, setGrowingNotes] = useState(plant?.growingNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      name: name.trim(),
      variety: variety.trim() || undefined,
      type,
      daysToMaturity: daysToMaturity ? parseInt(daysToMaturity, 10) : undefined,
      sunRequirement: sunRequirement || undefined,
      waterNeeds: waterNeeds || undefined,
      growingNotes: growingNotes.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updatePlant(plant.id, data);
      } else {
        await createPlant(data);
      }
      router.refresh();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Plant" : "Add Plant"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="variety">Variety</Label>
            <Input id="variety" value={variety} onChange={(e) => setVariety(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLANT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{formatEnum(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daysToMaturity">Days to Maturity</Label>
            <Input
              id="daysToMaturity"
              type="number"
              min={0}
              value={daysToMaturity}
              onChange={(e) => setDaysToMaturity(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sun Requirement</Label>
              <Select value={sunRequirement} onValueChange={setSunRequirement}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {SUN_REQUIREMENTS.map((s) => (
                    <SelectItem key={s} value={s}>{formatEnum(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Water Needs</Label>
              <Select value={waterNeeds} onValueChange={setWaterNeeds}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {WATER_NEEDS.map((w) => (
                    <SelectItem key={w} value={w}>{formatEnum(w)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="growingNotes">Growing Notes</Label>
            <Textarea
              id="growingNotes"
              value={growingNotes}
              onChange={(e) => setGrowingNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Plant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
