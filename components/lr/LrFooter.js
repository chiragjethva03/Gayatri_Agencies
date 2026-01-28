export default function LrFooter({ onClose, onSelect }) {
  return (
    <div className="p-3 border-t flex justify-end gap-3">
      <button onClick={onClose} className="px-4 py-1 border rounded">
        Close
      </button>
      <button
        onClick={onSelect}
        className="px-4 py-1 bg-blue-600 text-white rounded"
      >
        Select
      </button>
    </div>
  );
}
