"use client";

import { Printer } from "lucide-react";

export default function LrFooterActions({
  onSave,
  onSaveClose,
  onCancel,
  onPrint // NEW: Added this prop
}) {
  return (
    <div className="bg-white px-6 py-4 flex justify-between items-center shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] border-t border-gray-100 relative z-20">
      
      {/* LEFT : PRINT */}
      <button 
        onClick={onPrint} // NEW: Attached the function
        type="button" // Prevents accidental form submission
        className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors flex items-center gap-2 shadow-sm"
      >
        <Printer size={16} />
        Print
      </button>

      {/* RIGHT : ACTIONS */}
      <div className="flex gap-3">
        

        <button onClick={onSaveClose} className="px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 shadow-sm transition-all active:scale-95">
          Save & Close (F4)
        </button>

        <button onClick={onCancel} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-50 shadow-sm transition-all active:scale-95">
          Cancel (Esc)
        </button>
      </div>
    </div>
  );
}