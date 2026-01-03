export default function MemoEmptyState({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center text-gray-400">
        No records available
      </td>
    </tr>
  );
}
