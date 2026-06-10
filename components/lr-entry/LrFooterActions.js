"use client";

export default function LrFooterActions({
  onSaveAndPrint,
  onF4,
  isSaved,
  isAddMode,
  isSaving,
  onCancel,
}) {
  // Edit mode: button disabled once saved (re-enables on change)
  // Add mode:  button disabled only while actively saving
  const f4Disabled = isAddMode ? isSaving : isSaved;

  const f4Label = isSaving
    ? "Saving..."
    : isAddMode
      ? "Save & Next (F4)"
      : isSaved
        ? "Saved"
        : "Save (F4)";

  return (
    <div className="bg-white px-6 py-4 flex justify-end items-center shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] border-t border-gray-100 relative z-20">
      <div className="flex gap-3">

        <button
          onClick={onSaveAndPrint}
          type="button"
          className="px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 shadow-sm transition-all active:scale-95"
        >
          Save &amp; Print (F3)
        </button>

        <button
          onClick={onF4}
          disabled={f4Disabled}
          type="button"
          className="px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2"
        >
          {isSaving && (
            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {f4Label}
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
