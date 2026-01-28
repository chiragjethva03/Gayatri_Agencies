"use client";

import { useState } from "react";

export default function AddItemModal({ title, fields, onSave, onClose }) {
  const [data, setData] = useState({});

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-96 rounded shadow-lg">
        <div className="bg-blue-600 text-white px-3 py-2 font-semibold">
          {title}
        </div>

        <div className="p-4 space-y-3">
          {fields.map((field) => (
            <input
              key={field.name}
              placeholder={field.label}
              className="w-full border px-2 py-1 rounded"
              onChange={(e) =>
                setData({ ...data, [field.name]: e.target.value })
              }
            />
          ))}
        </div>

        <div className="flex justify-end gap-2 p-3 border-t">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={() => onSave(data)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
