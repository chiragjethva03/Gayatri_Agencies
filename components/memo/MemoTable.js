"use client";

import { useRef } from "react";
import MemoEmptyState from "./MemoEmptyState";
import MemoTableRow from "./MemoTableRow";

const columns = ["", "Memo Date", "Memo No", "Truck", "City", "Freight", "Weight"];

export default function MemoTable({ memos = [], selectedIds = [], onToggle }) { 
  const tableRef = useRef(null);
  const footerRef = useRef(null);

  const handleScroll = () => {
    if (tableRef.current && footerRef.current) {
      footerRef.current.scrollLeft = tableRef.current.scrollLeft;
    }
  };

  const totalEntries = memos.length;

  return (
    // MODERNIZED: Rounded corners, soft shadow, hidden overflow
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-220px)] relative overflow-hidden">
      
      <div 
        ref={tableRef} 
        onScroll={handleScroll} 
        className="overflow-auto flex-1 custom-scrollbar"
      >
        {/* Main Table */}
        <table className="min-w-[1000px] w-full text-sm table-fixed">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-4 py-3 text-left font-medium text-gray-700 ${col === "" ? "w-12 text-center" : ""}`}>
                  {col === "" ? <input type="checkbox" /> : col}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {memos.length === 0 ? (
              <MemoEmptyState colSpan={columns.length} />
            ) : (
              memos.map((memo) => (
                <MemoTableRow 
                  key={memo._id} 
                  memo={memo} 
                  isSelected={selectedIds.includes(memo._id)}
                  onToggle={() => onToggle(memo._id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER: Exact clone of the LR logic using a separate synced table */}
      {memos.length > 0 && (
        <div 
          ref={footerRef} 
          className="bg-blue-50/50 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] overflow-hidden pointer-events-none relative z-10"
        >
          <table className="min-w-[1000px] w-full text-sm font-bold text-gray-800 table-fixed">
            <tbody>
              <tr>
                <td className="px-4 py-3 w-12 border-none"></td>
                {/* Floating pill design for the entry count */}
                <td className="px-4 py-3 text-blue-700 text-base border-none tracking-wide">
                  <span className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 text-blue-800">
                    {totalEntries} Entries
                  </span>
                </td>
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 border-none"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}