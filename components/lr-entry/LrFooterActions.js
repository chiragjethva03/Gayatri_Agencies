"use client";

export default function LrFooterActions({ onSaveOnly, isSaved, onSaveClose, onCancel }) {
  return (
    <div className="bg-white px-6 py-4 flex justify-end items-center shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] border-t border-gray-100 relative z-20">
      <div className="flex gap-3">

        <button
          onClick={onSaveOnly}
          type="button"
          className="px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 shadow-sm transition-all active:scale-95"
        >
          Save & Print (F3)
        </button>

        <button
          onClick={onSaveClose}
          disabled={isSaved}
          type="button"
          className="px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isSaved ? "Saved" : "Save (F4)"}
        </button>

        <button
          onClick={onCancel}
          type="button"
          className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-50 shadow-sm transition-all active:scale-95"
        >
          Cancel (Esc)
        </button>
      </div>
    </div>
  );
}
