"use client";

import SidebarNavigation from "@/components/transport/SidebarNavigation";

export default function MemoLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      {/* <SidebarNavigation /> */}

      {/* Page Content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
