"use client";
import { useMemo } from "react";
import { calcDemurrage } from "@/utils/calcDemurrage";
export default function DeliveryTableRow({ delivery, isSelected, onToggle, onDemurrageClick }) {

  const d = useMemo(() => calcDemurrage(delivery), [
    delivery.date,
    delivery.demurrageRatePerDay,
    delivery.demurrageFreeDays,
    delivery.demurrageStatus,
  ]);

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
      <td className="td">
        {delivery.freightBy ? (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${delivery.freightBy.toLowerCase() === "to pay"
              ? "bg-orange-100 text-orange-700"
              : delivery.freightBy.toLowerCase() === "paid"
                ? "bg-green-100 text-green-700"
                : delivery.freightBy.toLowerCase() === "tbb"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600"
            }`}>
            {delivery.freightBy}
          </span>
        ) : "-"}
      </td>
      <td className="td text-gray-700">{delivery.kasar || "0"}</td>

       <td
        className="td text-center"
        onClick={(e) => {
          e.stopPropagation();
          onDemurrageClick && onDemurrageClick();
        }}
      >
        {/* No rate set */}
        {!d && (
          <span
            className="text-gray-300 text-base cursor-pointer hover:text-orange-400 transition-colors"
            title="Click to set demurrage"
          >
            ＋
          </span>
        )}

        {/* Paid */}
        {d && delivery.demurrageStatus === "paid" && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 cursor-pointer hover:opacity-80">
            ✓ Paid
          </span>
        )}

        {/* Waived */}
        {d && delivery.demurrageStatus === "waived" && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 cursor-pointer hover:opacity-80">
            Waived
          </span>
        )}

        {/* Within free period — warning (≤2 days left) */}
        {d && !d.isOverdue && d.isWarning &&
          delivery.demurrageStatus !== "paid" &&
          delivery.demurrageStatus !== "waived" && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 cursor-pointer hover:opacity-80">
            ⚠ {d.daysUntilCharge}d left
          </span>
        )}

        {/* Within free period — safe */}
        {d && !d.isOverdue && !d.isWarning &&
          delivery.demurrageStatus !== "paid" &&
          delivery.demurrageStatus !== "waived" && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 cursor-pointer hover:opacity-80">
            {d.daysTotal}d ✓
          </span>
        )}

        {/* Overdue */}
        {d && d.isOverdue &&
          delivery.demurrageStatus !== "paid" &&
          delivery.demurrageStatus !== "waived" && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 cursor-pointer hover:opacity-80">
            +{d.chargeDays}d • ₹{d.totalCharge}
          </span>
        )}
      </td>
    </tr>
  );
}