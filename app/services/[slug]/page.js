"use client";

import { useParams } from "next/navigation";
import { useTransports } from "@/context/TransportContext"; 
import DashboardStats from "@/components/dashboard/DashboardStats";
import TruckReminder from "@/components/dashboard/TruckReminder";
import GeneralReminder from "@/components/dashboard/GeneralReminder";
import BookingAnalysis from "@/components/dashboard/BookingAnalysis";
import GodownStatus from "@/components/dashboard/GodownStatus";

export default function TransportPage() {
  const { slug } = useParams();
  const { transports } = useTransports();
  
const transport = transports.find(
    (t) => t.name.toLowerCase().replace(/\s+/g, "-") === slug
) || null;


  const authorized = true;

  return (
    <div className="relative">
      {/* DASHBOARD CONTENT */}
      <div className="transition">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Dashboard –{" "}
            {slug ? slug.replace(/-/g, " ").toUpperCase() : "LOADING..."}
          </h1>
          {transport?.transportCode && (
            <span className="text-xl font-bold text-blue-600 bg-blue-50 border-l-4 border-blue-500 px-3 py-1.5 rounded-r-md tracking-widest uppercase">
              {transport.transportCode}
            </span>
          )}
        </div>

        {authorized && (
          <div className="space-y-6">
            <DashboardStats />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TruckReminder />
              <GeneralReminder />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* <BookingAnalysis /> */}
              {/* <GodownStatus /> */}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
