"use client";
import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Download } from "lucide-react";

const fmt = n => Number(n ?? 0).toLocaleString("en-IN");
const PAGE_SIZE = 10;

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
}

export default function DailyLogTable({ data = [], loading }) {
  const [sort, setSort]   = useState({ key: "date", dir: "desc" });
  const [page, setPage]   = useState(1);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sort.key] ?? 0;
      const bv = b[sort.key] ?? 0;
      if (typeof av === "string") return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    return copy;
  }, [data, sort.key, sort.dir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData   = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setSort2(key) {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
    setPage(1);
  }

  function exportCSV() {
    const header = ["Date", "Income", "Expenses", "Net", "Opening", "Closing", "Change%"];
    const rows   = sorted.map(r => [
      r.date,
      r.income  ?? 0,
      r.expense ?? 0,
      (r.income ?? 0) - (r.expense ?? 0),
      r.opening ?? 0,
      r.closing ?? 0,
      r.opening ? (((r.closing - r.opening) / r.opening) * 100).toFixed(1) + "%" : "—",
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "eod_daily_log.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const SortIcon = ({ k }) => {
    if (sort.key !== k) return <ChevronDown size={10} className="text-gray-300" />;
    return sort.dir === "asc"
      ? <ChevronUp size={10} className="text-[#1e73be]" />
      : <ChevronDown size={10} className="text-[#1e73be]" />;
  };

  const headerCls = "px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none";

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded mb-2 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Daily Financial Log</h3>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 text-xs text-[#1e73be] hover:text-blue-700 font-semibold transition-colors"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>
      {!data.length ? (
        <div className="p-10 text-center text-gray-400 text-sm">No data for selected period</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    { key: "date",    label: "Date"      },
                    { key: "income",  label: "Income"    },
                    { key: "expense", label: "Expenses"  },
                    { key: "net",     label: "Net"       },
                    { key: "closing", label: "Closing"   },
                    { key: "changePct", label: "Change %" },
                  ].map(col => (
                    <th key={col.key} className={headerCls} onClick={() => setSort2(col.key)}>
                      <div className="flex items-center gap-1">
                        {col.label} <SortIcon k={col.key} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageData.map(row => {
                  const net       = (row.income || 0) - (row.expense || 0);
                  const opening   = (row.closing || 0) - net;
                  const changePct = opening !== 0
                    ? ((net / Math.abs(opening)) * 100).toFixed(1)
                    : net > 0 ? "100.0" : net < 0 ? "-100.0" : "0.0";
                  const isGood    = net >= 0;

                  return (
                    <tr key={row.date} className={`${isGood ? "" : "bg-red-50/30"} hover:bg-gray-50/60 transition-colors`}>
                      <td className="px-4 py-3 text-xs font-medium text-gray-600">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 text-xs text-green-700 font-semibold tabular-nums">₹{fmt(row.income)}</td>
                      <td className="px-4 py-3 text-xs text-red-600 font-semibold tabular-nums">₹{fmt(row.expense)}</td>
                      <td className={`px-4 py-3 text-xs font-bold tabular-nums ${net >= 0 ? "text-green-700" : "text-red-600"}`}>
                        {net < 0 ? "-" : ""}₹{fmt(Math.abs(net))}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-800 font-semibold tabular-nums">₹{fmt(row.closing)}</td>
                      <td className={`px-4 py-3 text-xs font-semibold ${Number(changePct) >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {Number(changePct) >= 0 ? "▲" : "▼"} {Math.abs(Number(changePct)).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">{sorted.length} records • Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:border-gray-300 transition"
                >
                  Prev
                </button>
                {(() => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const end   = Math.min(start + 4, totalPages);
                  return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(pg => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 text-xs font-medium rounded-lg transition ${
                        page === pg ? "bg-[#1e73be] text-white" : "border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {pg}
                    </button>
                  ));
                })()}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:border-gray-300 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
