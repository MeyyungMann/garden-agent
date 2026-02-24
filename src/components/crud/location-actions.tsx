"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { LocationFormDialog } from "./location-form-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { deleteLocation } from "@/actions/locations";

interface LocationData {
  id: string;
  name: string;
  locationType: string;
  description: string | null;
  sunExposure: string | null;
  soilType: string | null;
  climateZone: string | null;
}

export function AddLocationButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-1" /> Add Location
      </Button>
      <LocationFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function LocationActions({ location }: { location: LocationData }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    await deleteLocation(location.id);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-1 mt-2">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>
      <LocationFormDialog open={editOpen} onOpenChange={setEditOpen} location={location} />
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${location.name}"?`}
        description="This will permanently delete this location. Plantings at this location will lose their location reference."
        onConfirm={handleDelete}
      />
    </>
  );
}
