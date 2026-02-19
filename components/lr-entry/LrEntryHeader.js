"use client";

import { X } from "lucide-react";

export default function LrEntryHeader({ onClose, isViewMode, lrNo }) {
  return (
    <div className="bg-blue-700 text-white px-4 py-2 flex justify-between items-center">
      <div className="font-semibold text-sm">
        {/* Change Title based on mode */}
        {isViewMode ? "View / Edit L.R. Entry" : "+ Add L.R. Entry"}
      </div>

      <div className="flex items-center gap-4 text-sm">
        {/* Show Actual LR No if available, else Auto */}
        <span>LR No : {lrNo || "Auto"}</span>

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