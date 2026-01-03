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
    // FIX 1: Flex column layout ensures footer stays at bottom
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      {/* FIX 2: flex-1 makes this section take all available space, pushing footer down */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
             <p className="text-slate-500 animate-pulse">Loading transports...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && transports.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-500">No transports found.</p>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && transports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {transports.map((t) => {
              const slug = t.name.toLowerCase().replace(/\s+/g, "-");

              return (
                <Link
                  key={t._id}
                  href={`/services/${slug}`}
                  className="group block h-full" // FIX 3: h-full makes the link fill the grid cell
                >
                  {/* FIX 4: Card Design 
                      - h-full: Stretches card to match neighbors height
                      - flex flex-col: Allows spacing distribution
                  */}
                  <div className="flex flex-col h-full bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200">
                    
                    {/* Card Header */}
                    <div className="mb-4 pb-3 border-b border-slate-100">
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors capitalize">
                        {t.name}
                      </h4>
                    </div>

                    {/* Card Body */}
                    <div className="flex-1">
                      <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Available Locations
                      </h5>
                      
                      {/* Styled List */}
                      <ul className="space-y-2">
                        {t.locations.map((loc, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-600">
                            {/* Custom bullet point */}
                            <span className="mt-1.5 w-1.5 h-1.5 min-w-[6px] rounded-full bg-blue-400 mr-2.5"></span>
                            <span className="capitalize">{loc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Optional: 'View Details' indicator at bottom */}
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