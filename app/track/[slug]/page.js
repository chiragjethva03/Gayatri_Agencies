"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { RefreshCw, Truck, Package, MapPin, LinkIcon } from "lucide-react";

const fmtDate = (d) => {
  if (!d || d === "-") return "-";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const slugToName = (slug = "") =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

function TrackContent() {
  const { slug }     = useParams();
  const searchParams = useSearchParams();

  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [errorMsg,    setErrorMsg]    = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    const token = searchParams.get("t");

    if (!token) {
      setErrorMsg("No access token found. Please use the link provided by Gayatri Agency.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/track/${slug}?t=${encodeURIComponent(token)}`);
      if (res.status === 401) {
        const { error } = await res.json();
        setErrorMsg(error || "This link is invalid or has expired.");
        return;
      }
      if (!res.ok) throw new Error();
      setData(await res.json());
      setLastUpdated(new Date());
    } catch {
      setErrorMsg("Could not load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [slug, searchParams]);

  useEffect(() => { if (slug) fetchData(); }, [slug, fetchData]);

  const transportName = data?.transportName || slugToName(slug);
  const hasFilters    = data?.consignorFilter || data?.consigneeFilter;

  // ── Invalid / Expired link ──────────────────────────────────────────────
  if (!loading && errorMsg) {
    return (
      <div className="min-h-screen bg-[#0f2d35] flex flex-col items-center justify-center px-4">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-red-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <LinkIcon size={28} className="text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
          <p className="text-sm text-white/50 leading-relaxed mb-8">{errorMsg}</p>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 mb-8" />

          {/* Branding */}
          <div className="flex items-center gap-2.5 mb-1">
            <Truck size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white/80">Gayatri Agencies ERP</span>
          </div>
          <p className="text-xs text-white/35 mt-1">
            Contact Gayatri Agency for a new tracking link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-[#113741] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center gap-2.5 mb-1">
            <Truck size={20} className="text-cyan-300 shrink-0" />
            <h1 className="text-lg font-bold tracking-wide capitalize">{transportName}</h1>
          </div>
          <p className="text-sm text-white/55 ml-7">
            To Pay LRs — {fmtDate(data?.fromDate)} to {fmtDate(data?.toDate)}
          </p>
          {hasFilters && (
            <div className="flex flex-wrap gap-2 ml-7 mt-2">
              {data.consignorFilter && (
                <span className="text-[11px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                  Consignor: {data.consignorFilter}
                </span>
              )}
              {data.consigneeFilter && (
                <span className="text-[11px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                  Consignee: {data.consigneeFilter}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              To Pay Only
            </span>
            {data && !loading && (
              <span className="text-sm text-slate-500">
                {data.lrs.length} LR{data.lrs.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading LRs…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !errorMsg && data?.lrs.length === 0 && (
          <div className="text-center py-24">
            <Package size={44} className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500">No To Pay LRs found</p>
            <p className="text-sm text-slate-400 mt-1">All LRs may already be settled for this period.</p>
          </div>
        )}

        {/* ── Desktop table ── */}
        {!loading && !errorMsg && data?.lrs.length > 0 && (
          <>
            <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["LR No", "Date", "Consignor", "Consignee", "From", "To", "Packaging", "Goods", "Art."].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider last:text-center whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.lrs.map((lr, i) => (
                    <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">{lr.lrNo}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtDate(lr.date)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{lr.consignor}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{lr.consignee}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{lr.fromCity}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{lr.toCity}</td>
                      <td className="px-4 py-3 text-slate-500">{lr.packaging}</td>
                      <td className="px-4 py-3 text-slate-600">{lr.goodsContain}</td>
                      <td className="px-4 py-3 text-center text-slate-600 font-medium">{lr.articles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="sm:hidden space-y-3">
              {data.lrs.map((lr, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-blue-700 text-base">{lr.lrNo}</span>
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      {fmtDate(lr.date)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Consignor</p>
                      <p className="font-medium text-slate-800 mt-0.5">{lr.consignor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Consignee</p>
                      <p className="font-medium text-slate-800 mt-0.5">{lr.consignee}</p>
                    </div>
                    <div className="mt-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                        <MapPin size={9} /> Route
                      </p>
                      <p className="text-slate-600 mt-0.5">{lr.fromCity} → {lr.toCity}</p>
                    </div>
                    <div className="mt-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Articles</p>
                      <p className="text-slate-600 mt-0.5">{lr.articles}</p>
                    </div>
                    <div className="mt-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Packaging</p>
                      <p className="text-slate-600 mt-0.5">{lr.packaging}</p>
                    </div>
                    <div className="mt-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Goods</p>
                      <p className="text-slate-600 mt-0.5">{lr.goodsContain}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {lastUpdated && !loading && (
          <p className="text-center text-xs text-slate-400 mt-5">
            Updated at {lastUpdated.toLocaleTimeString("en-IN")}
          </p>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-slate-400">
        Powered by <span className="font-medium text-slate-500">Gayatri Agencies ERP</span>
      </footer>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  );
}
