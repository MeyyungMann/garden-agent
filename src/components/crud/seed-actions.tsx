"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SeedFormDialog } from "./seed-form-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { deleteSeed } from "@/actions/seeds";

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

export function AddSeedButton({ plants }: { plants: PlantOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-1" /> Add Seed
      </Button>
      <SeedFormDialog open={open} onOpenChange={setOpen} plants={plants} />
    </>
  );
}

export function SeedActions({ seed, plants }: { seed: SeedData; plants: PlantOption[] }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    await deleteSeed(seed.id);
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
      <SeedFormDialog open={editOpen} onOpenChange={setEditOpen} plants={plants} seed={seed} />
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this seed record?"
        description="This will permanently remove this seed from your inventory."
        onConfirm={handleDelete}
      />
    </>
  );
}
