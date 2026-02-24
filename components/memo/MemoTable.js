import MemoEmptyState from "./MemoEmptyState";
import MemoTableRow from "./MemoTableRow";

const columns = ["", "Memo Date", "Memo No", "Truck", "City", "Freight", "Weight"];

// NEW: Accept selectedIds and onToggle as props
export default function MemoTable({ memos = [], selectedIds = [], onToggle }) { 
  return (
    <div className="bg-white border rounded overflow-auto h-[calc(100vh-220px)]">
      <table className="min-w-[1000px] w-full text-sm">
       <thead className="bg-gray-200 sticky top-0 z-10">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-3 text-left font-medium text-gray-700 ${col === "" ? "w-12 text-center" : ""}`}>
                {col === "" ? <input type="checkbox" /> : col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {memos.length === 0 ? (
            <MemoEmptyState colSpan={columns.length} />
          ) : (
            memos.map((memo) => (
              <MemoTableRow 
                key={memo._id} 
                memo={memo} 
                // NEW: Pass the state and function down to the row
                isSelected={selectedIds.includes(memo._id)}
                onToggle={() => onToggle(memo._id)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}