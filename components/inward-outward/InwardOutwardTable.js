"use client";
import { useState, useRef, useEffect } from "react";
import { ListFilter } from "lucide-react";

// --- ADDED totalStock PROP ---
export default function InwardOutwardTable({ records, loading, selectedIds, onToggle, typeFilter, setTypeFilter, fromCityFilter, setFromCityFilter, uniqueFromCities = [], totalStock }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFromFilterOpen, setIsFromFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const fromFilterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (fromFilterRef.current && !fromFilterRef.current.contains(event.target)) {
        setIsFromFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-220px)] relative overflow-hidden">
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse text-sm table-fixed" style={{ minWidth: 900 }}>
          <colgroup>
            <col style={{ width: 44 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
          </colgroup>
          <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-center">
                <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
              </th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">No</th>
              <th className="px-3 py-3">LR No</th>
              <th className="px-3 py-3">
                <div className="flex items-center gap-1 relative" ref={filterRef}>
                  Type
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`p-1 rounded transition-colors ${typeFilter !== "All" ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"}`}
                  >
                    <ListFilter size={13} strokeWidth={2.5} />
                  </button>
                  {isFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-gray-200 shadow-lg rounded-md z-50 py-1 font-normal text-gray-700 normal-case tracking-normal">
                      {["All", "Inward", "Outward"].map(opt => (
                        <div key={opt}
                          className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 text-sm ${typeFilter === opt ? "bg-blue-50 font-bold text-blue-600" : ""}`}
                          onClick={() => { setTypeFilter(opt); setIsFilterOpen(false); }}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </th>
              <th className="px-3 py-3">
                <div className="flex items-center gap-1 relative" ref={fromFilterRef}>
                  From City
                  <button
                    onClick={() => setIsFromFilterOpen(!isFromFilterOpen)}
                    className={`p-1 rounded transition-colors ${fromCityFilter !== "All" ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"}`}
                  >
                    <ListFilter size={13} strokeWidth={2.5} />
                  </button>
                  {isFromFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-40 max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md z-50 py-1 font-normal text-gray-700 normal-case tracking-normal">
                      {["All", ...uniqueFromCities].map((opt, idx) => (
                        <div key={idx}
                          className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 text-sm truncate ${fromCityFilter === opt ? "bg-blue-50 font-bold text-blue-600" : ""}`}
                          title={opt}
                          onClick={() => { setFromCityFilter(opt); setIsFromFilterOpen(false); }}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </th>
              <th className="px-3 py-3">To City</th>
              <th className="px-3 py-3">Consignor</th>
              <th className="px-3 py-3">Consignee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={9} className="p-10 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={9} className="p-10 text-center text-gray-400 text-sm">No records found.</td></tr>
            ) : (
              records.map((record) => (
                <tr key={record._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-3 py-3 text-center">
                    <input type="checkbox" className="rounded border-gray-300 cursor-pointer" checked={selectedIds.includes(record._id)} onChange={() => onToggle(record._id)} />
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs tabular-nums">{record.date}</td>
                  <td className="px-3 py-3">
                    <span className="text-blue-600 font-semibold text-sm">{record.no}</span>
                  </td>
                  <td className="px-3 py-3">
                    {record.lrNo
                      ? <span className="text-gray-700 font-medium text-sm">{record.lrNo}</span>
                      : <span className="text-gray-300 text-sm">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${record.type === "Inward" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"}`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 max-w-0">
                    <span className="block truncate text-gray-700 text-sm" title={record.fromCity}>{record.fromCity || "—"}</span>
                  </td>
                  <td className="px-3 py-3 max-w-0">
                    <span className="block truncate text-gray-700 text-sm" title={record.toCity}>{record.toCity || "—"}</span>
                  </td>
                  <td className="px-3 py-3 max-w-0">
                    <span className="block truncate text-gray-700 text-sm font-medium" title={record.consignor}>{record.consignor || "—"}</span>
                  </td>
                  <td className="px-3 py-3 max-w-0">
                    <span className="block truncate text-gray-700 text-sm" title={record.consignee}>{record.consignee || "—"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50 border-t border-gray-200 p-3 flex gap-4 items-center shrink-0">
        <span className="text-blue-700 font-bold text-sm bg-white px-4 py-1.5 rounded-lg border border-blue-100 shadow-sm">
          {records.length} Entries
        </span>
        
        {/* --- NEW: TOTAL STOCK BADGE --- */}
        <span className="text-emerald-700 font-bold text-sm bg-white px-4 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
          Total Stock: {totalStock}
        </span>
        
        {fromCityFilter !== "All" && (
          <span className="text-gray-500 font-medium text-sm flex items-center">
            From: <span className="ml-1 text-gray-800 font-bold">{fromCityFilter}</span>
          </span>
        )}
        {typeFilter !== "All" && (
          <span className="text-gray-500 font-medium text-sm flex items-center">
            Type: <span className="ml-1 text-gray-800 font-bold">{typeFilter}</span>
          </span>
        )}
      </div>
    </div>
  );
}