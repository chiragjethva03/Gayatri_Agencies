export default function LrTableRow({ lr, isSelected, onToggle }) {
  return (
    <tr className={`border-t transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      <td className="td text-center">
        <input 
          type="checkbox" 
          checked={isSelected || false}
          onChange={onToggle}
          className="cursor-pointer w-4 h-4"
        />
      </td>
      <td className="td">{lr.lrDate}</td>
      <td className="td font-medium text-blue-600">
        {lr.lrNo}
      </td>
      <td className="td">{lr.fromCity || "-"}</td>
      <td className="td">{lr.toCity || "-"}</td>
      <td className="td">{lr.center || "-"}</td>
      <td className="td">{lr.consignor || "-"}</td> 
      
      {/* NEW: Pulls the Consignee data from the database */}
      <td className="td">{lr.consignee || "-"}</td>

      <td className="td">
        {lr.subTotal ? `₹ ${lr.subTotal}` : "-"}
      </td>
      <td className="td">
        {lr.freightBy || "-"}
      </td>
    </tr>
  );
}