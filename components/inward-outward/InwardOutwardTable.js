"use client";
import { useState, useRef, useEffect } from "react";
import { ListFilter } from "lucide-react";

// --- ADDED totalStock PROP ---
export default function InwardOutwardTable({ records, loading, selectedIds, onToggle, typeFilter, setTypeFilter, totalStock }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-220px)] relative overflow-hidden">
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-[1000px] w-full text-left border-collapse whitespace-nowrap text-sm table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-medium">
            <tr>
              <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="p-3">Date</th>
              <th className="p-3">No</th>
              
              <th className="p-3">
                <div className="flex items-center gap-1 relative" ref={filterRef}>
                  Type
                  <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-1 rounded transition-colors ${typeFilter !== "All" ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"}`}>
                    <ListFilter size={15} strokeWidth={2.5} />
                  </button>

                  {isFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-gray-200 shadow-lg rounded-md z-50 py-1 font-normal text-gray-700">
                      <div className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${typeFilter === 'All' ? 'bg-blue-50 font-bold text-blue-600' : ''}`} onClick={() => { setTypeFilter('All'); setIsFilterOpen(false); }}>All</div>
                      <div className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${typeFilter === 'Inward' ? 'bg-blue-50 font-bold text-blue-600' : ''}`} onClick={() => { setTypeFilter('Inward'); setIsFilterOpen(false); }}>Inward</div>
                      <div className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${typeFilter === 'Outward' ? 'bg-blue-50 font-bold text-blue-600' : ''}`} onClick={() => { setTypeFilter('Outward'); setIsFilterOpen(false); }}>Outward</div>
                    </div>
                  )}
                </div>
              </th>

              <th className="p-3">From City</th>
              <th className="p-3">To City</th>
              <th className="p-3">Consignor</th>
              <th className="p-3">Consignee</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">No records available.</td></tr>
            ) : (
              records.map((record) => (
                <tr key={record._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="p-3 text-center">
                    <input type="checkbox" className="rounded border-gray-300" checked={selectedIds.includes(record._id)} onChange={() => onToggle(record._id)}/>
                  </td>
                  <td className="p-3 text-gray-700">{record.date}</td>
                  <td className="p-3 text-blue-600 font-medium">{record.no}</td>
                  <td className="p-3 text-gray-700">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${record.type === 'Inward' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">{record.fromCity}</td>
                  <td className="p-3 text-gray-700">{record.toCity}</td>
                  <td className="p-3 text-gray-700">{record.consignor}</td>
                  <td className="p-3 text-gray-700">{record.consignee}</td>
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
        
        {typeFilter !== "All" && (
          <span className="text-gray-500 font-medium text-sm flex items-center">
            Filtered by: <span className="ml-1 text-gray-800 font-bold">{typeFilter}</span>
          </span>
        )}
      </div>
    </div>
  );
}