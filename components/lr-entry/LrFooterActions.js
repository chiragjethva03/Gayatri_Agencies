"use client";

import { Printer } from "lucide-react";

export default function LrFooterActions({
  onSave,
  onSaveClose,
  onCancel,
}) {
  return (
    <div className="bg-blue-100 px-4 py-2 flex justify-between items-center border-t">
      
      {/* LEFT : PRINT */}
      <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-2">
        <Printer size={16} />
        Print
      </button>

      {/* RIGHT : ACTIONS */}
      <div className="flex gap-2">
        <button onClick={onSave} className="btn-primary">
          Save (F3)
        </button>

        <button onClick={onSaveClose} className="btn-primary">
          Save & Close (F4)
        </button>

        <button onClick={onCancel} className="btn">
          Cancel (Esc)
        </button>
      </div>
    </div>
  );
}
