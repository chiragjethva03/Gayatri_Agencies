"use client";
import { useState } from "react";

export default function LrTableRow({ lr, isSelected, onToggle }) {
  const [showPaidInfo, setShowPaidInfo] = useState(false);

  const isPaid = lr.freightBy?.toLowerCase() === "paid";

  return (
    <tr className={`border-t transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      <td className="td text-center">
        <input 
          type="checkbox" 
          checked={isSelected || false}
          onChange={onToggle}
          className="cursor-pointer w-4 h-4"
        />
      </td>
      <td className="td">{lr.lrDate}</td>
      <td className="td font-medium text-blue-600">
        {lr.lrNo}
      </td>
      <td className="td">{lr.fromCity || "-"}</td>
      <td className="td">{lr.toCity || "-"}</td>
      <td className="td">{lr.center || "-"}</td>
      <td className="td">{lr.consignor || "-"}</td> 
      <td className="td">{lr.consignee || "-"}</td>
      <td className="td">
        {lr.subTotal ? `₹ ${lr.subTotal}` : "-"}
      </td>
      
      {/* FINAL COLUMN */}
      <td className="td">
        <div className="flex items-center gap-2">
          <span>{lr.freightBy || "-"}</span>
          
          {/* UPDATED BUTTON: More professional text button instead of emoji */}
          {isPaid && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                setShowPaidInfo(true);
              }}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors shadow-sm"
            >
              View Info
            </button>
          )}
        </div>

        {/* FIXED HYDRATION ERROR: 
          The Modal is now INSIDE the <td> tag. 
          This keeps the HTML valid while the "fixed inset-0" class ensures 
          it still covers the whole screen when opened.
        */}
        {showPaidInfo && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()} // Prevents row selection when clicking the backdrop
          >
            <div className="bg-white rounded-lg shadow-2xl w-[400px] border border-gray-300 overflow-hidden cursor-default">
              {/* Header */}
              <div className="bg-[#1e73be] text-white px-4 py-2 font-semibold text-sm flex justify-between items-center">
                <span>Payment Information</span>
                <button onClick={() => setShowPaidInfo(false)} className="hover:text-red-300 font-bold text-lg leading-none">✕</button>
              </div>
              
              {/* Body */}
              <div className="p-6 text-center text-sm text-gray-700 leading-relaxed">
                <span className="font-bold text-blue-700">{lr.consignor || "Sender"}</span> had paid{" "}
                <span className="font-bold text-green-600">{lr.subTotal ? `${lr.subTotal} RS.` : "0 RS."}</span> to{" "}
                <span className="font-bold text-blue-700">{lr.consignee || "Receiver"}</span>.
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 flex justify-end border-t border-gray-200">
                <button 
                  onClick={() => setShowPaidInfo(false)} 
                  className="px-5 py-1.5 bg-[#1e73be] text-white rounded text-xs font-medium hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}