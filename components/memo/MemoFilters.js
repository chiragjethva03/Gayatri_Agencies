export default function MemoFilters() {
  return (
    <div className="px-6 py-4 border-b bg-gray-50 flex gap-3 flex-wrap items-center">

      <input
        type="date"
        required
        className="
          input
          text-slate-900
          [&::-webkit-datetime-edit]:text-slate-900
          [&::-webkit-datetime-edit-year-field]:text-slate-900
          [&::-webkit-datetime-edit-month-field]:text-slate-900
          [&::-webkit-datetime-edit-day-field]:text-slate-900
        "
      />

      <input
        type="date"
        required
        className="
          input
          text-slate-900
          [&::-webkit-datetime-edit]:text-slate-900
          [&::-webkit-datetime-edit-year-field]:text-slate-900
          [&::-webkit-datetime-edit-month-field]:text-slate-900
          [&::-webkit-datetime-edit-day-field]:text-slate-900
        "
      />

      <input
  type="text"
  placeholder="Fast Search (F1)"
  className="
    input
    flex-1
    min-w-[220px]
    text-slate-900
    placeholder:text-slate-400
  "
/>


      <button className="btn-primary px-5 py-2 rounded-md">
        Go
      </button>
    </div>
  );
}
