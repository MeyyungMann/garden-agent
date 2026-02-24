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
import { createLocation, updateLocation } from "@/actions/locations";
import { formatEnum } from "@/lib/format";

const LOCATION_TYPES = ["BED", "POT", "CONTAINER", "ROW", "GREENHOUSE", "INDOOR", "OTHER"] as const;
const SUN_EXPOSURES = ["FULL_SUN", "PARTIAL_SUN", "SHADE"] as const;

interface LocationData {
  id: string;
  name: string;
  locationType: string;
  description: string | null;
  sunExposure: string | null;
  soilType: string | null;
  climateZone: string | null;
}

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: LocationData;
}

export function LocationFormDialog({ open, onOpenChange, location }: LocationFormDialogProps) {
  const router = useRouter();
  const isEdit = !!location;

  const [name, setName] = useState(location?.name ?? "");
  const [locationType, setLocationType] = useState(location?.locationType ?? "BED");
  const [description, setDescription] = useState(location?.description ?? "");
  const [sunExposure, setSunExposure] = useState(location?.sunExposure ?? "");
  const [soilType, setSoilType] = useState(location?.soilType ?? "");
  const [climateZone, setClimateZone] = useState(location?.climateZone ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      name: name.trim(),
      locationType,
      description: description.trim() || undefined,
      sunExposure: sunExposure || undefined,
      soilType: soilType.trim() || undefined,
      climateZone: climateZone.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updateLocation(location.id, data);
      } else {
        await createLocation(data);
      }
      router.refresh();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save location");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Location" : "Add Location"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Location Type</Label>
            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{formatEnum(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Sun Exposure</Label>
            <Select value={sunExposure} onValueChange={setSunExposure}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {SUN_EXPOSURES.map((s) => (
                  <SelectItem key={s} value={s}>{formatEnum(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type</Label>
              <Input id="soilType" value={soilType} onChange={(e) => setSoilType(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="climateZone">Climate Zone</Label>
              <Input id="climateZone" value={climateZone} onChange={(e) => setClimateZone(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Location"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
