import MemoEmptyState from "./MemoEmptyState";

// Added empty string at the beginning for the Checkbox column
const columns = [
  "", 
  "Memo Date",
  "Memo No",
  "Truck",
  "City",
  "Freight",
  "Weight",
];

export default function MemoTable() {
  const data = [];

  return (
    // UPDATED: Added identical wrapper classes as LrTable
    <div className="bg-white border rounded overflow-auto h-[calc(100vh-220px)]">
      <table className="min-w-[1000px] w-full text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-3 text-left font-medium text-gray-700 ${col === "" ? "w-12 text-center" : ""}`}>
                {col === "" ? <input type="checkbox" /> : col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <MemoEmptyState colSpan={columns.length} />
          )}
          {/* We will map over rows here later */}
        </tbody>
      </table>
    </div>
  );
}