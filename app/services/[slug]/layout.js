"use client";

import SidebarNavigation from "@/components/transport/SidebarNavigation";

export default function TransportLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F4F6FA]">
      {/* LEFT SIDEBAR */}
      <SidebarNavigation />

      {/* RIGHT CONTENT (Dashboard / Memo / etc.) */}
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}
