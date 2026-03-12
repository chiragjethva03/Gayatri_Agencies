"use client";

export default function DeliveryTableRow({ delivery, isSelected, onToggle }) {
  return (
    <tr className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer ${isSelected ? "bg-blue-50/80" : "bg-white"}`} onClick={onToggle}>
      <td className="td w-8 text-center" onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={onToggle}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
      </td>
      <td className="td text-gray-600">{delivery.date || "-"}</td>
      <td className="td font-medium text-blue-600">{delivery.dNo || "-"}</td>
      <td className="td text-gray-700">{delivery.type || "-"}</td>
      <td className="td text-gray-700">{delivery.lrNo || "-"}</td>
      <td className="td text-gray-700">{delivery.consignee || "-"}</td>
      <td className="td text-gray-700">{delivery.fromBranch || "-"}</td>
      <td className="td text-gray-700">{delivery.art || "-"}</td>
      <td className="td text-gray-700">{delivery.labourName || "-"}</td>
      <td className="td text-gray-700">{delivery.packName || "-"}</td>
      <td className="td font-semibold text-gray-800">{delivery.delSubTotal || "0"}</td>
      <td className="td text-gray-700">{delivery.freightBy || "-"}</td>
      <td className="td text-gray-700">{delivery.kasar || "0"}</td>
    </tr>
  );
}