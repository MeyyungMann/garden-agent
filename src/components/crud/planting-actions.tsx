"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PlantingFormDialog } from "./planting-form-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { deletePlanting } from "@/actions/plantings";

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

export function AddPlantingButton({
  plants,
  locations,
}: {
  plants: PlantOption[];
  locations: LocationOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-1" /> Add Planting
      </Button>
      <PlantingFormDialog open={open} onOpenChange={setOpen} plants={plants} locations={locations} />
    </>
  );
}

export function PlantingActions({
  planting,
  plants,
  locations,
}: {
  planting: PlantingData;
  plants: PlantOption[];
  locations: LocationOption[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    await deletePlanting(planting.id);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <PlantingFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        plants={plants}
        locations={locations}
        planting={planting}
      />
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this planting?"
        description="This will permanently remove this planting record."
        onConfirm={handleDelete}
      />
    </>
  );
}
