"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PlantFormDialog } from "./plant-form-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { deletePlant } from "@/actions/plants";

export function AddPlantButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-1" /> Add Plant
      </Button>
      <PlantFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

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

export function PlantActions({ plant }: { plant: PlantData }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    await deletePlant(plant.id);
    router.push("/plants");
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>
      <PlantFormDialog open={editOpen} onOpenChange={setEditOpen} plant={plant} />
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${plant.name}"?`}
        description="This will permanently delete this plant and all its associated data."
        onConfirm={handleDelete}
      />
    </>
  );
}
