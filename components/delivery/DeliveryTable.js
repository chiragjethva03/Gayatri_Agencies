"use client";
import { useRef } from "react";
import DeliveryTableHeader from "./DeliveryTableHeader";
import DeliveryTableRow from "./DeliveryTableRow";

export default function DeliveryTable({ deliveries, loading, selectedIds, onToggle }) {
  const tableRef = useRef(null);
  const footerRef = useRef(null);

  const handleScroll = () => {
    if (tableRef.current && footerRef.current) {
      footerRef.current.scrollLeft = tableRef.current.scrollLeft;
    }
  };

  const grandTotal = deliveries.reduce((sum, d) => sum + (Number(d.delSubTotal) || 0), 0);
  const totalEntries = deliveries.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-220px)] relative overflow-hidden">
      <div ref={tableRef} onScroll={handleScroll} className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-[1500px] w-full text-sm table-fixed">
          <DeliveryTableHeader />
          <tbody>
            {loading && (
              <tr><td colSpan="13" className="p-6 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && deliveries.length === 0 && (
               <tr><td colSpan="13" className="p-12 text-center text-gray-500">No deliveries found.</td></tr>
            )}
            {!loading && deliveries.map((delivery) => (
              <DeliveryTableRow 
                key={delivery._id || delivery.id} 
                delivery={delivery} 
                isSelected={selectedIds?.includes(delivery._id || delivery.id)} 
                onToggle={() => onToggle(delivery._id || delivery.id)} 
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