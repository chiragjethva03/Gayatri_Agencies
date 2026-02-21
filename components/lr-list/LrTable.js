"use client";

import LrTableHeader from "./LrTableHeader";
import LrTableRow from "./LrTableRow";
import LrEmptyState from "./LrEmptyState";

export default function LrTable({ lrs, loading, selectedIds, onToggle }) {
  return (
    <div className="bg-white border rounded overflow-auto h-[calc(100vh-220px)]">
      <table className="min-w-[1400px] w-full text-sm">
        <LrTableHeader />

        <tbody>
          {loading && (
            <tr>
              <td colSpan="10" className="p-6 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          )}

          {!loading && lrs.length === 0 && <LrEmptyState />}

          {!loading &&
            lrs.map((lr) => (
            <LrTableRow 
              key={lr._id} 
              lr={lr} 
              isSelected={selectedIds?.includes(lr._id)} // Check if selected
              onToggle={() => onToggle(lr._id)} // Pass toggle function
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}