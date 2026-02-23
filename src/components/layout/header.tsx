"use client";

import { Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onToggleChat?: () => void;
  onToggleSidebar?: () => void;
}

export function Header({ onToggleChat, onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <Button variant="outline" size="sm" onClick={onToggleChat} className="gap-2">
        <MessageCircle className="h-4 w-4" />
        Ask AI
      </Button>
    </header>
  );
}
