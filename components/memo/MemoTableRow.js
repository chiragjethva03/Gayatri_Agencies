export default function MemoTableRow({ memo, isSelected, onToggle }) {
  // --- NEW: Calculate the total articles for this specific memo row ---
  const totalArticles = memo.lrList?.reduce((sum, lr) => sum + (Number(lr.article) || 0), 0) || 0;

  return (
    // Added a light blue background when the row is selected
    <tr className={`border-t hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={isSelected || false} // Is it checked?
          onChange={onToggle}           // What happens when clicked?
          className="cursor-pointer w-4 h-4"
        />
      </td>

      {/* --- NEW: Article Column inserted here --- */}
      <td className="px-4 py-2 font-medium text-gray-700">
        {totalArticles}
      </td>

      <td className="px-4 py-2">{memo.date}</td>
      <td className="px-4 py-2 font-medium text-blue-600">{memo.memoNo}</td>
      <td className="px-4 py-2">{memo.vehicle || "-"}</td>
      <td className="px-4 py-2">{memo.toCity || "-"}</td>
      <td className="px-4 py-2">{memo.hire || "-"}</td>
      <td className="px-4 py-2">
        {memo.lrList?.reduce((sum, lr) => sum + (Number(lr.weight) || 0), 0) || "-"}
      </td>
    </tr>
  );
}