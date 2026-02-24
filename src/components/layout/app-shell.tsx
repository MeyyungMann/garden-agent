"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ChatPanel } from "@/components/chat/chat-panel";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block h-full">
        <Sidebar onOpenChat={() => setChatOpen(true)} />
      </div>

      {/* Mobile sidebar - Sheet overlay */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <Sidebar onNavigate={() => setSidebarOpen(false)} onOpenChat={() => { setSidebarOpen(false); setChatOpen(true); }} />
        </SheetContent>
      </Sheet>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Header
          onToggleChat={() => setChatOpen(true)}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        <ChatPanel open={chatOpen} onOpenChange={setChatOpen} />
      </div>
    </div>
  );
}
