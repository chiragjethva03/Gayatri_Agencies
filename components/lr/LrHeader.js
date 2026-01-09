export default function LrHeader() {
  return (
    <div className="p-3 border-b flex gap-3 items-center">
      <input
        placeholder="Fast Search (F1)"
        className="border px-3 py-1 rounded w-64"
      />

      <label className="flex items-center gap-1">
        <input type="checkbox" /> All City
      </label>

      <label className="flex items-center gap-1">
        <input type="checkbox" /> Show Inward LR
      </label>
    </div>
  );
}
