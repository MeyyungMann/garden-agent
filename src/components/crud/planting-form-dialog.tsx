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
import { createPlanting, updatePlanting } from "@/actions/plantings";
import { formatEnum, toDateInputValue, parseDateInput } from "@/lib/format";

const PLANTING_STATUSES = [
  "PLANNED", "SOWN", "GERMINATED", "TRANSPLANTED", "GROWING", "HARVESTING", "DONE", "FAILED",
] as const;

interface PlantOption {
  id: string;
  name: string;
  variety: string | null;
}

interface LocationOption {
  id: string;
  name: string;
}

interface PlantingData {
  id: string;
  plantId: string;
  locationId: string | null;
  year: number;
  sowIndoorDate: Date | null;
  sowOutdoorDate: Date | null;
  transplantDate: Date | null;
  harvestStart: Date | null;
  harvestEnd: Date | null;
  status: string;
  notes: string | null;
}

interface PlantingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plants: PlantOption[];
  locations: LocationOption[];
  planting?: PlantingData;
}

export function PlantingFormDialog({
  open,
  onOpenChange,
  plants,
  locations,
  planting,
}: PlantingFormDialogProps) {
  const router = useRouter();
  const isEdit = !!planting;

  const [plantId, setPlantId] = useState(planting?.plantId ?? "");
  const [locationId, setLocationId] = useState(planting?.locationId ?? "none");
  const [year, setYear] = useState((planting?.year ?? new Date().getFullYear()).toString());
  const [sowIndoorDate, setSowIndoorDate] = useState(toDateInputValue(planting?.sowIndoorDate));
  const [sowOutdoorDate, setSowOutdoorDate] = useState(toDateInputValue(planting?.sowOutdoorDate));
  const [transplantDate, setTransplantDate] = useState(toDateInputValue(planting?.transplantDate));
  const [harvestStart, setHarvestStart] = useState(toDateInputValue(planting?.harvestStart));
  const [harvestEnd, setHarvestEnd] = useState(toDateInputValue(planting?.harvestEnd));
  const [status, setStatus] = useState(planting?.status ?? "PLANNED");
  const [notes, setNotes] = useState(planting?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      plantId,
      locationId: locationId === "none" ? undefined : locationId,
      year: parseInt(year, 10),
      sowIndoorDate: parseDateInput(sowIndoorDate),
      sowOutdoorDate: parseDateInput(sowOutdoorDate),
      transplantDate: parseDateInput(transplantDate),
      harvestStart: parseDateInput(harvestStart),
      harvestEnd: parseDateInput(harvestEnd),
      status,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updatePlanting(planting.id, data);
      } else {
        await createPlanting(data);
      }
      router.refresh();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save planting");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Planting" : "Add Planting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No location</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANTING_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{formatEnum(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sowIndoorDate">Sow Indoor</Label>
              <Input
                id="sowIndoorDate"
                type="date"
                value={sowIndoorDate}
                onChange={(e) => setSowIndoorDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sowOutdoorDate">Sow Outdoor</Label>
              <Input
                id="sowOutdoorDate"
                type="date"
                value={sowOutdoorDate}
                onChange={(e) => setSowOutdoorDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transplantDate">Transplant Date</Label>
            <Input
              id="transplantDate"
              type="date"
              value={transplantDate}
              onChange={(e) => setTransplantDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="harvestStart">Harvest Start</Label>
              <Input
                id="harvestStart"
                type="date"
                value={harvestStart}
                onChange={(e) => setHarvestStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="harvestEnd">Harvest End</Label>
              <Input
                id="harvestEnd"
                type="date"
                value={harvestEnd}
                onChange={(e) => setHarvestEnd(e.target.value)}
              />
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
            <Button type="submit" disabled={loading || !plantId}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Planting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
