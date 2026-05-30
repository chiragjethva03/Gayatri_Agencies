"use client";
import { ArrowLeft } from "lucide-react";
import AccountsPanel from "@/components/financial/AccountsPanel";

export default function AccountsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal back nav */}
      <div className="px-6 pt-4 pb-1 max-w-screen-xl mx-auto">
        <a
          href="/eod-dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={13} /> Financial Dashboard
        </a>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pb-6">
        <AccountsPanel />
      </div>
    </div>
  );
}
