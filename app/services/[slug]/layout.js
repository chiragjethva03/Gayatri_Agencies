"use client";

import SidebarNavigation from "@/components/transport/SidebarNavigation";

export default function TransportLayout({ children }) {
  return (
    // UPDATED: Changed min-h-screen to h-screen and added overflow-hidden
    <div className="flex h-screen overflow-hidden bg-[#F4F6FA]">
      
      {/* LEFT SIDEBAR */}
      <SidebarNavigation />

      {/* RIGHT CONTENT (Dashboard / Memo / etc.) */}
      {/* The overflow-y-auto here ensures only this section scrolls */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
      
    </div>
  );
}