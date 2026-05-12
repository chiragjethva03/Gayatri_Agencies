"use client";

import { useRouter } from "next/navigation";
import { LogOut, Wallet, Users, BarChart3 } from "lucide-react";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-slate-200 py-4 px-6 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-xl font-semibold text-slate-800">ERP Dashboard</h1>

      <div className="flex items-center gap-3">

        {/* EOD Dashboard Button */}
        <button
          onClick={() => router.push("/eod-dashboard")}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg bg-[#1e73be] text-white text-sm font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <BarChart3 size={16} />
          Financials
        </button>

        {/* Employee Corner Button */}
        <button
          onClick={() => router.push("/dashboard/employees")}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition shadow-sm"
        >
          <Users size={16} />
          Employee Corner
        </button>

        {/* Daily Expense Button */}
        <button
          onClick={() => router.push("/dashboard/expense")}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition shadow-sm"
        >
          <Wallet size={16} />
          Daily Expense
        </button>

        {/* Add Transport Button */}
        <button
          onClick={() => router.push("/add-transport")}
          className="px-4 py-2 cursor-pointer rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-sm"
        >
          Add Transport
        </button>

        {/* Logout Button (Minimal Red Text + Icon) */}
        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 text-red-600 text-sm font-medium hover:text-red-700 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}
