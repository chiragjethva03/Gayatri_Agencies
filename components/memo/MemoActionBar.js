"use client";

export default function MemoActionBar({ onAdd, onDelete, onView, selectedCount = 0 }) {
  return (
    <div className="bg-white border rounded p-2 mb-2 flex gap-2">
      <button onClick={onAdd} className="btn-primary">
        + Add
      </button>

      <button className="btn">✏️ Edit</button>
      
      <button 
        onClick={onView}
        className={`btn ${selectedCount === 1 ? 'text-blue-600' : 'opacity-50'}`}
      >
        👁 View
      </button>
      
      <button 
        onClick={onDelete}
        className={`btn ${selectedCount > 0 ? 'text-red-600' : 'opacity-50'}`}
      >
        🗑 Delete {selectedCount > 0 ? `(${selectedCount})` : ''}
      </button>

      <button className="btn">🔄 Refresh</button>
      <button className="btn">🖨 Print</button>
      <button className="btn">📋 Copy</button>
    </div>
  );
}