"use client";
import { useEffect, useState } from "react";

export default function ComboBox({
  label,
  value,
  onChange,
  fetchUrl,
  displayKey,
  onAdd,
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(fetchUrl)
      .then(res => res.json())
      .then(setItems);
  }, [fetchUrl]);

  const filtered = items.filter(item =>
    item[displayKey]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="text-gray-600 mb-1 block">{label}</label>

      <div
        onClick={() => setOpen(!open)}
        className="border border-gray-300 rounded px-2 py-1 bg-white cursor-pointer"
      >
        {value || `Select ${label}`}
      </div>

      {open && (
        <div className="absolute z-50 bg-white border rounded shadow-lg w-full mt-1">
          
          {/* Search */}
          <input
            autoFocus
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 border-b outline-none"
          />

          {/* List */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onChange(item[displayKey]);
                  setOpen(false);
                }}
                className="px-2 py-1 hover:bg-blue-50 cursor-pointer"
              >
                {item[displayKey]}
              </div>
            ))}
          </div>

          {/* Add */}
          <div
            onClick={onAdd}
            className="px-2 py-1 border-t text-blue-600 hover:bg-blue-50 cursor-pointer text-sm"
          >
            + Add {label} (F2)
          </div>
        </div>
      )}
    </div>
  );
}
