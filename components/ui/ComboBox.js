"use client";
import { useEffect, useState, useRef } from "react";

export default function ComboBox({
  label,
  value,
  onChange,
  fetchUrl,
  options = [], // Added to support local arrays without an API
  displayKey,
  onAdd,
  onEdit,
  onRefresh,
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (fetchUrl) {
      fetch(fetchUrl).then((res) => res.json()).then(setItems);
    } else if (options.length > 0) {
      setItems(options);
    }
  }, [fetchUrl, options]);

  const filtered = items.filter((item) => {
    const itemStr = typeof item === "string" ? item : item[displayKey];
    return itemStr?.toLowerCase().includes(search.toLowerCase());
  });

  const handleKeyDown = (e) => {
    if (e.key === "F2") {
      e.preventDefault();
      setOpen(false);
      if (onAdd) onAdd();
    }
    if (e.key === "F6") {
      e.preventDefault();
      setOpen(false);
      if (onEdit) onEdit(value || search); // Pass selected value or searched text
    }
  };

  return (
    <div className="relative flex flex-col w-full" ref={dropdownRef}>
      <label className="text-gray-600 mb-0.5 text-xs">{label}</label>

      <div
        onClick={() => setOpen(!open)}
        className="border border-gray-300 rounded p-1 bg-white cursor-pointer text-xs flex justify-between items-center"
      >
        <span className={value ? "text-black" : "text-gray-400"}>
          {value || `Select`}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="text-gray-400">
          <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
        </svg>
      </div>

      {open && (
        <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 rounded shadow-lg w-full mt-1 overflow-hidden">
          
          {/* Search Input */}
          <div className="p-1 border-b bg-gray-50">
            <input
              autoFocus
              placeholder="Search Name (F2 Add / F6 Edit)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-xs border border-blue-400 rounded outline-none"
            />
          </div>

          {/* List Area */}
          <div className="max-h-48 overflow-y-auto bg-white">
            {filtered.length === 0 ? (
              <div className="px-2 py-2 text-xs text-gray-500 text-center">No results found</div>
            ) : (
              filtered.map((item, idx) => {
                const itemStr = typeof item === "string" ? item : item[displayKey];
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => {
                      onChange(itemStr);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="px-2 py-1.5 text-xs hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    {itemStr}
                  </div>
                );
              })
            )}
          </div>

          {/* Action Footer (Matches your screenshot) */}
          <div className="bg-[#e6f0fa] p-1.5 flex gap-1 border-t border-blue-200">
            <button
              onClick={() => { setOpen(false); if (onAdd) onAdd(); }}
              className="bg-[#1a56db] text-white text-[10px] font-semibold px-2 py-1 rounded hover:bg-blue-700 flex items-center"
            >
              + (F2)
            </button>
            <button
              onClick={() => { setOpen(false); if (onEdit) onEdit(value || search); }}
              className="bg-[#1a56db] text-white text-[10px] font-semibold px-2 py-1 rounded hover:bg-blue-700 flex items-center"
            >
              ✎ (F6)
            </button>
            <button
              onClick={() => { if (onRefresh) onRefresh(); }}
              className="bg-[#1a56db] text-white text-[10px] font-semibold px-2 py-1 rounded hover:bg-blue-700 flex items-center"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}