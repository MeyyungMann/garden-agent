import { Badge } from "@/components/ui/badge";
import type { PlantingStatus } from "@/generated/prisma/enums";

const STATUS_CONFIG: Record<
  PlantingStatus,
  { label: string; className: string }
> = {
  PLANNED: {
    label: "Planned",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  SOWN: {
    label: "Sown",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  GERMINATED: {
    label: "Germinated",
    className: "bg-lime-100 text-lime-800 hover:bg-lime-100",
  },
  TRANSPLANTED: {
    label: "Transplanted",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  GROWING: {
    label: "Growing",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  },
  HARVESTING: {
    label: "Harvesting",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  DONE: {
    label: "Done",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

interface StatusBadgeProps {
  status: PlantingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="secondary" className={`${config.className} ${className ?? ""}`}>
      {config.label}
    </Badge>
  );
}

export { STATUS_CONFIG };
