"use client";
import { useRef } from "react";
import { calcDemurrage } from "@/utils/calcDemurrage";
import DeliveryTableHeader from "./DeliveryTableHeader";
import DeliveryTableRow from "./DeliveryTableRow";

export default function DeliveryTable({ deliveries, loading, selectedIds, onToggle, freightByFilter, onFreightByFilterChange, onDemurrageClick }) {
  const tableRef = useRef(null);
  const footerRef = useRef(null);

  const handleScroll = () => {
    if (tableRef.current && footerRef.current) {
      footerRef.current.scrollLeft = tableRef.current.scrollLeft;
    }
  };

  const grandTotal = deliveries.reduce((sum, d) => sum + (Number(d.delSubTotal) || 0), 0);
  const totalEntries = deliveries.length;

  const overdueList = deliveries.filter(d => {
    const calc = calcDemurrage(d);
    return calc?.isOverdue &&
      d.demurrageStatus !== "paid" &&
      d.demurrageStatus !== "waived";
  });
  const totalPending = overdueList.reduce((sum, d) => {
    const calc = calcDemurrage(d);
    return sum + (calc?.totalCharge || 0);
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-220px)] relative overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Freight By:</span>
        {["All", "To Pay", "Paid", "TBB"].map((option) => (
          <button
            key={option}
            onClick={() => onFreightByFilterChange(option)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${freightByFilter === option
              ? option === "To Pay"
                ? "bg-orange-500 text-white border-orange-500"
                : option === "Paid"
                  ? "bg-green-500 text-white border-green-500"
                  : option === "TBB"
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
          >
            {option}
            {option !== "All" && (
              <span className="ml-1 opacity-75">
                ({deliveries.filter(d => d.freightBy?.toLowerCase() === option.toLowerCase()).length})
              </span>
            )}
          </button>
        ))}

        {freightByFilter !== "All" && (
          <button
            onClick={() => onFreightByFilterChange("All")}
            className="ml-2 px-2 py-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {!loading && overdueList.length > 0 && (
        <div className="mx-4 mt-2 mb-1 px-4 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-red-700">
            {overdueList.length} {overdueList.length === 1 ? "delivery" : "deliveries"} overdue on demurrage
          </span>
          <span className="text-xs font-bold text-red-600">
            ₹{totalPending.toLocaleString()} pending
          </span>
        </div>
      )}
      <div ref={tableRef} onScroll={handleScroll} className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-[1500px] w-full text-sm table-fixed">
          <DeliveryTableHeader />
          <tbody>
            {loading && (
              <tr><td colSpan="14" className="p-6 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && deliveries.length === 0 && (
              <tr><td colSpan="14" className="p-12 text-center text-gray-500">No deliveries found.</td></tr>
            )}
            {!loading && deliveries.map((delivery) => (
              <DeliveryTableRow
                key={delivery._id || delivery.id}
                delivery={delivery}
                isSelected={selectedIds?.includes(delivery._id || delivery.id)}
                onToggle={() => onToggle(delivery._id || delivery.id)}
                onDemurrageClick={() => onDemurrageClick && onDemurrageClick(delivery)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!loading && deliveries.length > 0 && (
        <div ref={footerRef} className="bg-blue-50/50 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] overflow-hidden pointer-events-none relative z-10">
          <table className="min-w-[1500px] w-full text-sm font-bold text-gray-800 table-fixed">
            <tbody>
              <tr>
                <td className="td w-8 border-none"></td>
                <td className="td py-3 text-blue-700 text-base border-none tracking-wide" colSpan={9}>
                  <span className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 text-blue-800">
                    {totalEntries} Entries
                  </span>
                </td>
                <td className="td py-3 text-blue-700 text-base border-none tracking-wide">
                  <span className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-blue-100 text-blue-800">
                    ₹ {grandTotal.toLocaleString()}
                  </span>
                </td>
                <td className="td border-none" colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}