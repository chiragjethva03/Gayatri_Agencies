"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function DashboardContent() {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransports = async () => {
      try {
        const res = await fetch("/api/transports");
        const data = await res.json();
        setTransports(data);
      } catch (error) {
        console.error("Failed to fetch transports");
      } finally {
        setLoading(false);
      }
    };

    fetchTransports();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Loading */}
        {loading && (
          <p className="text-center text-slate-500">
            Loading transports...
          </p>
        )}

        {/* Empty State */}
        {!loading && transports.length === 0 && (
          <p className="text-center text-slate-500">
            No transports found.
          </p>
        )}

        {/* Cards */}
        {!loading && transports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {transports.map((t) => {
  const slug = t.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link
      key={t._id}
      href={`/services/${slug}`}
      className="block"
    >
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer">
        <h4 className="text-lg font-semibold text-slate-900">
          {t.name}
        </h4>

        <div className="mt-3">
          <h5 className="text-sm font-medium text-slate-700">
            Locations:
          </h5>
          <ul className="mt-1 text-sm text-slate-500 space-y-1">
            {t.locations.map((loc, i) => (
              <li key={i}>• {loc}</li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  );
})}

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
