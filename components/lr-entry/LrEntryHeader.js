"use client";

import { X } from "lucide-react";

export default function LrEntryHeader({ onClose }) {
  return (
    <div className="bg-blue-700 text-white px-4 py-2 flex justify-between items-center">
      <div className="font-semibold text-sm">
        + Add L.R. Entry
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span>LR No : Auto</span>

        <button
          onClick={onClose}
          className="hover:bg-red-600 p-1 rounded"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
