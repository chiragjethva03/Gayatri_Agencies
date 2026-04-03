"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  LayoutDashboard, 
  Truck, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ArrowRightLeft 
} from "lucide-react";

import { BackIcon } from "@/components/ui/icons";



export default function SidebarNavigation() {
  const [open, setOpen] = useState(true);
  const [lrOpen, setLrOpen] = useState(false);

  const { slug } = useParams();

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

        {/* Dashboard */}
        <SidebarItem
          href={`/services/${slug}`}
          label="Dashboard"
          icon={<LayoutDashboard size={18} />}
          open={open}
        />


        {/* LR ENTRY (Expandable) */}
        {/* LR Entry */}
        <SidebarItem
          href={`/services/${slug}/lr`}
          label="LR. Entry"
          icon={<Truck size={18} />}
          open={open}
        />


        {/* LR SUB MENU */}
        {/* {lrOpen && open && (
          <div className="ml-8 space-y-1">
            <SubItem href="/lr/add" label="Add LR" />
            <SubItem href="/lr/view" label="View LR" />
          </div>
        )} */}

        {/* Memo Entry */}
        <SidebarItem
          href={`/services/${slug}/memo`}
          label="Memo Entry"
          icon={<FileText size={18} />}
          open={open}
        />

        {/* Delivery Of LR */}
        <SidebarItem
          href={`/services/${slug}/delivery`} 
          label="Delivery Of L.R."
          icon={<FileText size={18} />}
          open={open}
        />

{/* Inward / Outward */}
<SidebarItem
  href={`/services/${slug}/inward-outward`}
  label="Inward / Outward"
  icon={<ArrowRightLeft size={18} />}
  open={open}
/>

      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-white/10 px-3 py-3 space-y-2">

        {/* Back to Dashboard */}
        <Link
          href={`/dashboard`}
          className="
      flex items-center gap-3
      px-3 py-2 rounded-lg
      text-sm font-medium
      text-gray-300
      hover:bg-white/10
      transition
    "
        >
          <BackIcon size={16} />
          {open && <span>Back to Dashboard</span>}
        </Link>
      </div>
    </aside>
  );
}

/* ---------------- COMPONENTS ---------------- */

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
      {open && <span>{label}</span>}
    </Link>
  );
}

function SubItem({ href, label }) {
  return (
    <Link
      href={href}
      className="
        block px-3 py-2 rounded-md
        text-sm text-gray-300
        hover:bg-white/10
      "
    >
      {label}
    </Link>
  );
}
