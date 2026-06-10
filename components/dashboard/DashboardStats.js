"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function DashboardStats() {
  const { slug } = useParams();
  const [counts, setCounts] = useState({ lrCount: 0, memoCount: 0, inwardOutwardCount: 0 });

  useEffect(() => {
    if (!slug) return;
    const fetchStats = async () => {
      try {
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

  const stats = [
    { label: "LR",              value: counts.lrCount             || 0, bg: "bg-cyan-100",   href: `/services/${slug}/lr` },
    { label: "Inward / Outward", value: counts.inwardOutwardCount || 0, bg: "bg-orange-100", href: `/services/${slug}/inward-outward` },
    { label: "Memo",            value: counts.memoCount            || 0, bg: "bg-blue-100",   href: `/services/${slug}/memo` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((item) => {
        const inner = (
          <div className={`rounded-xl p-6 text-center ${item.bg} transition-all hover:shadow-md ${item.href ? "cursor-pointer hover:scale-[1.02]" : ""}`}>
            <div className="text-3xl font-bold text-slate-900">{item.value}</div>
            <div className="mt-1 text-sm font-medium text-slate-600">{item.label}</div>
          </div>
        );
        return item.href ? (
          <Link key={item.label} href={item.href}>{inner}</Link>
        ) : (
          <div key={item.label}>{inner}</div>
        );
      })}
    </div>
  );
}