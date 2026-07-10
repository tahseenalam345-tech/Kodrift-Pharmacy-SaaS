"use client";

import { Menu } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

export function MobileMenuButton() {
  const { toggleSidebar } = useUIStore();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 bg-panel rounded-lg text-ink-dim hover:text-teal border border-border transition-colors"
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  );
}