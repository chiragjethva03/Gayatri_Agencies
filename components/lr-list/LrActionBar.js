"use client";

export default function LrActionBar({ onAdd }) {
  return (
    <div className="bg-white border rounded p-2 mb-2 flex gap-2">
      <button
        onClick={onAdd}
        className="btn-primary"
      >
        + Add
      </button>

      <button className="btn">✏️ Edit</button>
      <button className="btn">👁 View</button>
      <button className="btn">🗑 Delete</button>
      <button className="btn">🔄 Refresh</button>
      <button className="btn">🖨 Print</button>
      <button className="btn">📋 Copy</button>
    </div>
  );
}
