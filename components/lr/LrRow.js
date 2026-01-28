export default function LrRow({ lr, checked, onToggle }) {
  return (
    <tr className="border-t">
      <td className="text-center">
        <input type="checkbox" checked={checked} onChange={onToggle} />
      </td>
      <td>{lr.lrNo}</td>
      <td>{lr.fromCity}</td>
      <td>{lr.toCity}</td>
      <td>{lr.weight}</td>
    </tr>
  );
}
