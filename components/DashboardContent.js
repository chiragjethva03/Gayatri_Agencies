"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import Footer from "@/components/Footer";
import { TailChase } from "ldrs/react";
import "ldrs/react/TailChase.css";
import ServerError from "@/components/error/ServerError";

export default function DashboardContent() {
  const [transports, setTransports] = useState([]);
  
  // Now it holds an object of combined counts: { slug: { lrCount: 2, memoCount: 1 } }
  const [transportStats, setTransportStats] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [transRes, statsRes] = await Promise.all([
          fetch("/api/transports"),
          fetch("/api/stats") 
        ]);

        if (!transRes.ok) throw new Error("SERVER_ERROR");

        const transData = await transRes.json();
        const statsData = await statsRes.json();

        setTransports(transData);
        setTransportStats(statsData || {}); 
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("SERVER_ERROR");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {loading && (
          <div className="flex justify-center items-center h-64">
            <TailChase size="40" speed="1.75" color="#2563eb" />
          </div>
        )}

        {!loading && error === "SERVER_ERROR" && (
          <ServerError onRetry={() => window.location.reload()} />
        )}

        {!loading && transports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {transports.map((t) => {
              const slug = t.name.toLowerCase().replace(/\s+/g, "-");
              
              // Get the specific stats object for this transport card (defaults to 0)
              const currentStats = transportStats[slug] || { lrCount: 0, memoCount: 0 };

              return (
                <Link key={t._id} href={`/services/${slug}`} className="group block h-full">
                  <div className="flex flex-col h-full bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200">
                    
                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors capitalize">
                        {t.name}
                      </h4>
                      {/* UPDATED: Displays both badges side-by-side */}
                      <div className="flex gap-2">
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                          {currentStats.lrCount} LRs
                        </div>
                        <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                          {currentStats.memoCount} MMs
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Available Locations
                      </h5>
                      <ul className="space-y-2">
                        {t.locations.map((loc, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-600">
                            <span className="mt-1.5 w-1.5 h-1.5 min-w-[6px] rounded-full bg-blue-400 mr-2.5"></span>
                            <span className="capitalize">{loc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-50 text-right">
                      <span className="text-xs font-medium text-blue-600 group-hover:underline">View Dashboard &rarr;</span>
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