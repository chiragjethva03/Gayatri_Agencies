"use client";

import { useParams } from "next/navigation";
// import { useState } from "react"; // 🔕 temporarily not needed

import DashboardStats from "@/components/dashboard/DashboardStats";
import TruckReminder from "@/components/dashboard/TruckReminder";
import GeneralReminder from "@/components/dashboard/GeneralReminder";
import BookingAnalysis from "@/components/dashboard/BookingAnalysis";
import GodownStatus from "@/components/dashboard/GodownStatus";

export default function TransportPage() {
  const { slug } = useParams();

  /* 🔕 TEMPORARILY DISABLED AUTH LOGIC
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const CORRECT_PASSWORD = "12345";

  const handleSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setAuthorized(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };
  */

  // ✅ TEMP: always authorized
  const authorized = true;

  return (
    <div className="relative">
      {/* DASHBOARD CONTENT */}
      <div className="transition">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">
          Dashboard –{" "}
          {slug ? slug.replace(/-/g, " ").toUpperCase() : "LOADING..."}
        </h1>

        {authorized && (
          <div className="space-y-6">
            <DashboardStats />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TruckReminder />
              <GeneralReminder />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <BookingAnalysis />
              <GodownStatus />
            </div>
          </div>
        )}
      </div>

      {/* 🔕 PASSWORD MODAL TEMPORARILY DISABLED */}
      {/*
      {!authorized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-center text-slate-900">
              Enter Password
            </h2>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full mt-5 px-4 py-3 rounded-xl border border-slate-300"
            />

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              className="w-full mt-6 py-3 rounded-xl bg-blue-600 text-white"
            >
              Unlock
            </button>
          </div>
        </div>
      )}
      */}
    </div>
  );
}
