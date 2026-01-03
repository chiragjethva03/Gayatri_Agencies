export default function MemoFilters() {
  return (
    <div className="px-6 py-4 border-b bg-gray-50 flex gap-3 flex-wrap">
      <input type="date" className="input" />
      <input type="date" className="input" />
      <input
        type="text"
        placeholder="Fast Search (F1)"
        className="input flex-1 min-w-[220px]"
      />
      <button className="btn-primary">Go</button>
    </div>
  );
}
