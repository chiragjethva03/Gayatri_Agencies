export default function LrTableRow({ lr }) {
  return (
    <tr className="border-t hover:bg-blue-50 transition">
      <td className="td text-center">
        <input type="checkbox" />
      </td>
      <td className="td">{lr.lrDate}</td>
      <td className="td font-medium text-blue-600">
        {lr.lrNo}
      </td>
      <td className="td">{lr.fromCity}</td>
      <td className="td">{lr.toCity}</td>
      <td className="td">{lr.center}</td>
      <td className="td">{lr.consigner}</td>
      <td className="td">{lr.cashConsigner}</td>
      <td className="td">{lr.cashConsignee}</td>
    </tr>
  );
}
