"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // NEW: Import this to read the URL

export default function DashboardStats() {
  const { slug } = useParams(); // Get "demo-transport" from the URL
  const [counts, setCounts] = useState({ lrCount: 0, memoCount: 0 });

  useEffect(() => {
    // Only fetch if we know the slug
    if (!slug) return;

    const fetchStats = async () => {
      try {
        // Ask the API for stats specific to THIS transport
        const res = await fetch(`/api/stats?transport=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, [slug]);

  // Update the array to use our dynamic state variables
  const stats = [
    { label: "LR", value: counts.lrCount || 0, bg: "bg-cyan-100" },
    { label: "Full Load", value: 0, bg: "bg-orange-100" },
    { label: "Delivery",  value: counts.deliveryCount || 0, bg: "bg-yellow-100" },
    { label: "Memo", value: counts.memoCount || 0, bg: "bg-blue-100" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl p-6 text-center ${item.bg} transition-all hover:shadow-sm`}
        >
          <div className="text-3xl font-bold text-slate-900">
            {item.value}
          </div>
          <div className="mt-1 text-sm font-medium text-slate-600">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}