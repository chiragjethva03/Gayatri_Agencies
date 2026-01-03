import MemoEmptyState from "./MemoEmptyState";

const columns = [
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <MemoEmptyState colSpan={columns.length} />
          )}
        </tbody>
      </table>
    </div>
  );
}
