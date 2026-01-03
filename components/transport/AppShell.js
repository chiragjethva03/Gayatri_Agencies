"use client";
import SidebarNavigation from "./SidebarNavigation";
import TopHeader from "./TopHeader";
import Footer from "./Footer";

export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F4F6FA]">
      <SidebarNavigation />

      <div className="flex flex-col flex-1">
        <TopHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
