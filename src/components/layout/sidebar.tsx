"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sprout,
  Package,
  MapPin,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plants", label: "Plants", icon: Sprout },
  { href: "/seeds", label: "Seeds", icon: Package },
  { href: "/garden", label: "Garden", icon: MapPin },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

interface SidebarProps {
  onNavigate?: () => void;
  onOpenChat?: () => void;
}

export function Sidebar({ onNavigate, onOpenChat }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Sprout className="h-6 w-6 text-green-600" />
        <span className="text-lg font-semibold">Garden Agent</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => {
            onNavigate?.();
            onOpenChat?.();
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </button>
      </nav>
    </aside>
  );
}

export { navItems };
