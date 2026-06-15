"use client";
import { useState, useRef, useEffect } from "react";
import { ListFilter, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function ColumnMultiFilter({ label, options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = selected.length > 0;

  const filtered = options.filter(o =>
    o.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(x => x !== val) : [...selected, val]);
  };

  const clearAll = () => { onChange([]); };

  return (
    <div className="flex items-center gap-1" ref={ref}>
      {label}

      {/* Filter trigger button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`relative p-1 rounded transition-colors ${
          isActive ? "text-blue-600 bg-blue-100" : "text-gray-500 hover:bg-gray-300 hover:text-gray-800"
        }`}
        title={`Filter by ${label}`}
      >
        <ListFilter size={15} strokeWidth={2.5} />
        {isActive && (
          <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {selected.length}
          </span>
        )}
      </button>

      {/* Inline clear button when active */}
      {isActive && (
        <button
          onClick={clearAll}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Clear filter"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-200 shadow-xl rounded-lg z-50 overflow-hidden font-normal text-gray-700">

          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Filter · {label}
            </span>
            {isActive && (
              <button
                onClick={clearAll}
                className="text-[11px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-0.5 transition-colors"
              >
                <X size={10} /> Clear all
              </button>
            )}
          </div>

          {/* Search */}
          <div className="px-2.5 py-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-blue-400 bg-white"
            />
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">No results found</div>
            ) : (
              filtered.map((opt, idx) => {
                const isChecked = selected.includes(opt);
                const isCashParti = opt === "Cash Parti";
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors select-none
                      ${isChecked ? "bg-blue-50" : "hover:bg-gray-50"}
                      ${isCashParti ? "border-b border-dashed border-gray-200" : ""}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(opt)}
                      className="accent-blue-600 w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span
                      className={`text-xs truncate ${
                        isChecked ? "font-semibold text-blue-700" : "text-gray-700"
                      } ${isCashParti ? "italic text-amber-700" : ""}`}
                      title={opt}
                    >
                      {opt}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Footer status */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-[11px] text-gray-400">
              {filtered.length} option{filtered.length !== 1 ? "s" : ""}
            </span>
            {isActive && (
              <span className="text-[11px] font-semibold text-blue-600">
                {selected.length} selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
