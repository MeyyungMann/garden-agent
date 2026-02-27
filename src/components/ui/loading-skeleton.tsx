import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Assistant message skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      {/* User message skeleton */}
      <div className="flex gap-2 justify-end">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
      </div>
      {/* Another assistant message */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  );
}
