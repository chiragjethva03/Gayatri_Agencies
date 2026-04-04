"use client";

import { useRef } from "react";
import LrTableHeader from "./LrTableHeader";
import LrTableRow from "./LrTableRow";
import LrEmptyState from "./LrEmptyState";

// --- FIXED: ADDED NEW PROPS ---
export default function LrTable({ lrs, loading, selectedIds, onToggle, toCityFilter, setToCityFilter, uniqueToCities }) {
  
  const tableRef = useRef(null);
  const footerRef = useRef(null);

  const handleScroll = () => {
    if (tableRef.current && footerRef.current) {
      footerRef.current.scrollLeft = tableRef.current.scrollLeft;
    }
  };

  const grandTotalFreight = lrs.reduce((sum, lr) => sum + (Number(lr.subTotal) || 0), 0);
  const totalEntries = lrs.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-220px)] relative overflow-hidden">

      <div 
        ref={tableRef} 
        onScroll={handleScroll} 
        className="overflow-auto flex-1 custom-scrollbar"
      >
        <table className="min-w-[1400px] w-full text-sm table-fixed">
          {/* --- FIXED: PASS PROPS TO HEADER --- */}
          <LrTableHeader 
            toCityFilter={toCityFilter}
            setToCityFilter={setToCityFilter}
            uniqueToCities={uniqueToCities}
          />
          <tbody>
            {loading && (
              <tr>
                <td colSpan="10" className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && lrs.length === 0 && <LrEmptyState />}

            {!loading &&
              lrs.map((lr) => (
              <LrTableRow 
                key={lr._id} 
                lr={lr} 
                isSelected={selectedIds?.includes(lr._id)} 
                onToggle={() => onToggle(lr._id)} 
              />
            ))}
          </tbody>
        </table>
      </div>

      {!loading && lrs.length > 0 && (
        <div 
          ref={footerRef} 
          className="bg-blue-50/50 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] overflow-hidden pointer-events-none relative z-10 flex justify-between"
        >
          <table className="min-w-[1400px] w-full text-sm font-bold text-gray-800 table-fixed">
            <tbody>
              <tr>
                <td className="td w-8 border-none"></td>
                <td className="td py-3 text-blue-700 text-base border-none tracking-wide">
                  <span className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 text-blue-800 mr-2">
                    {totalEntries} Entries
                  </span>
                  
                  {/* --- NEW: VISUAL INDICATOR FOR FILTER --- */}
                  {toCityFilter !== "All" && (
                     <span className="text-gray-500 font-medium text-xs">
                       Filtered by: <span className="ml-1 text-gray-800 font-bold">{toCityFilter}</span>
                     </span>
                  )}
                </td>
                <td className="td border-none"></td>
                <td className="td border-none"></td>
                <td className="td border-none"></td>
                <td className="td border-none"></td>
                <td className="td border-none"></td>
                <td className="td border-none"></td>
                <td className="td py-3 text-blue-700 text-base border-none tracking-wide">
                  <span className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 text-blue-800">
                    ₹ {grandTotalFreight.toLocaleString()}
                  </span>
                </td>
                <td className="td border-none"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}