"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SidebarNavigation() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`
        bg-[#0B1220] text-gray-200
        transition-all duration-300 ease-in-out
        ${open ? "w-64" : "w-20"}
        hidden md:flex flex-col
        border-r border-white/10
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {open && (
          <span className="text-sm font-semibold tracking-wide">
            Gayatri ERP
          </span>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="p-1 rounded-md hover:bg-white/10 transition"
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <SidebarItem
          href="/dashboard"
          label="Dashboard"
          icon={<LayoutDashboard size={18} />}
          open={open}
        />

        <SidebarItem
          href="/transport"
          label="Transport"
          icon={<Truck size={18} />}
          open={open}
        />
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 text-xs text-gray-400 border-t border-white/10">
        {open ? "© 2026 Gayatri ERP" : "©"}
      </div>
    </aside>
  );
}

/* ---------------- Sidebar Item ---------------- */

function SidebarItem({ href, icon, label, open }) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-3
        px-3 py-2.5 rounded-lg
        text-sm font-medium
        hover:bg-white/10
        transition-all
      "
    >
      <span className="text-gray-300">{icon}</span>
      {open && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  );
}
