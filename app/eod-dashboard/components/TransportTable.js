"use client";
import { useState, Fragment } from "react";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

const fmt = n => (n ?? 0).toLocaleString("en-IN");
const pctColor = p => p > 0 ? "text-green-600" : p < 0 ? "text-red-500" : "text-gray-400";
const pctArrow = p => p > 0 ? "▲" : p < 0 ? "▼" : "—";

function BreakdownRow({ label, value, isExpense }) {
  return (
    <tr className="bg-gray-50/50">
      <td className="pl-10 py-1.5 text-xs text-gray-500" colSpan={2}>{label}</td>
      <td className={`py-1.5 text-xs font-medium text-right pr-4 ${isExpense ? "text-red-500" : "text-green-600"}`}>
        ₹{fmt(value)}
      </td>
      <td colSpan={5} />
    </tr>
  );
}

export default function TransportTable({ rows = [], total, loading, onRowClick }) {
  const [expanded, setExpanded] = useState(new Set());
  const toggle = slug => setExpanded(prev => {
    const next = new Set(prev);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    return next;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 h-10 animate-pulse bg-gray-50" />
        {[1,2,3].map(i => (
          <div key={i} className="px-5 py-4 border-b border-gray-50 animate-pulse flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24 ml-auto" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-400 text-sm">No transport data available</p>
      </div>
    );
  }

  const headerCls = "px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider";
  const cellCls   = "px-4 py-3.5 text-sm text-gray-700";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Transport-wise Closing Balance</h3>
        <span className="text-xs text-gray-400">{rows.length} transport{rows.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className={headerCls} style={{width:200}}>Transport</th>
              <th className={headerCls + " text-right"}>Opening</th>
              <th className={headerCls + " text-right"}>Income</th>
              <th className={headerCls + " text-right"}>Expenses</th>
              <th className={headerCls + " text-right"}>Net P&L</th>
              <th className={headerCls + " text-right"}>Closing</th>
              <th className={headerCls + " text-right"}>vs Yesterday</th>
              <th className={headerCls + " text-center"}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => {
              const isExpanded = expanded.has(row.transportSlug);
              const isProfit   = row.closingBalance >= row.openingBalance;

              return (
                <Fragment key={row.transportSlug}>
                  <tr
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={() => toggle(row.transportSlug)}
                  >
                    <td className={cellCls}>
                      <div className="flex items-center gap-2">
                        {isExpanded
                          ? <ChevronDown size={14} className="text-gray-400 shrink-0" />
                          : <ChevronRight size={14} className="text-gray-400 shrink-0" />
                        }
                        <button
                          onClick={e => { e.stopPropagation(); onRowClick?.(row); }}
                          className="font-semibold text-[#1e73be] hover:underline text-left"
                        >
                          {row.transportName}
                        </button>
                      </div>
                    </td>
                    <td className={cellCls + " text-right tabular-nums"}>₹{fmt(row.openingBalance)}</td>
                    <td className={cellCls + " text-right tabular-nums text-green-700 font-medium"}>₹{fmt(row.totalIncome)}</td>
                    <td className={cellCls + " text-right tabular-nums text-red-600 font-medium"}>₹{fmt(row.totalExpenses)}</td>
                    <td className={`${cellCls} text-right`}>
                      <span className={`text-sm font-bold tabular-nums ${(row.netPL ?? 0) >= 0 ? "text-green-700" : "text-red-600"}`}>
                        {(row.netPL ?? 0) < 0 ? "-" : "+"}₹{fmt(Math.abs(row.netPL ?? 0))}
                      </span>
                    </td>
                    <td className={cellCls + " text-right"}>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                        row.closingBalance >= 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        ₹{fmt(row.closingBalance)}
                      </span>
                    </td>
                    <td className={`${cellCls} text-right`}>
                      <span className={`text-xs font-semibold ${pctColor(row.vsYesterdayPct)}`}>
                        {pctArrow(row.vsYesterdayPct)} {Math.abs(row.vsYesterdayPct ?? 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className={cellCls + " text-center"}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {isProfit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {isProfit ? "Profit" : "Loss"}
                      </span>
                    </td>
                  </tr>

                  {isExpanded && (
                    <>
                      {/* Income breakdown */}
                      {row.deliveryIncome > 0       && <BreakdownRow label="Delivery Income (Net)" value={row.deliveryIncome}      isExpense={false} />}
                      {row.paidLrIncome > 0         && <BreakdownRow label="Paid LR Freight"       value={row.paidLrIncome}       isExpense={false} />}
                      {row.serviceChargeIncome > 0  && <BreakdownRow label="Service Charge"        value={row.serviceChargeIncome} isExpense={false} />}
                      {row.demurrageIncome > 0      && <BreakdownRow label="Demurrage"             value={row.demurrageIncome}     isExpense={false} />}
                      {/* Expense breakdown */}
                      {row.dailyExpenses > 0    && <BreakdownRow label="Daily Expenses"        value={row.dailyExpenses}  isExpense={true}  />}
                      {row.salaryAdvances > 0   && <BreakdownRow label="Salary Advances"       value={row.salaryAdvances} isExpense={true}  />}
                      {row.hamaliExpense > 0    && <BreakdownRow label="Hamali"                value={row.hamaliExpense}  isExpense={true}  />}
                      {row.crossingExpense > 0  && <BreakdownRow label="Crossing"              value={row.crossingExpense} isExpense={true} />}
                      {row.memoAdvance > 0      && <BreakdownRow label="Driver Advance"        value={row.memoAdvance}    isExpense={true}  />}
                      {row.vehicleHire > 0      && <BreakdownRow label="Vehicle Hire"          value={row.vehicleHire}    isExpense={true}  />}
                    </>
                  )}
                </Fragment>
              );
            })}

            {/* Total row */}
            {total && (
              <tr className="bg-blue-50 border-t-2 border-[#1e73be]/20">
                <td className="px-4 py-3.5 font-bold text-sm text-[#1e73be]">TOTAL</td>
                <td className="px-4 py-3.5 text-right font-bold text-sm tabular-nums text-gray-700">₹{fmt(total.openingBalance)}</td>
                <td className="px-4 py-3.5 text-right font-bold text-sm tabular-nums text-green-700">₹{fmt(total.totalIncome)}</td>
                <td className="px-4 py-3.5 text-right font-bold text-sm tabular-nums text-red-600">₹{fmt(total.totalExpenses)}</td>
                <td className="px-4 py-3.5 text-right font-bold text-sm tabular-nums">
                  <span className={(total.netPL ?? 0) >= 0 ? "text-green-700" : "text-red-600"}>
                    {(total.netPL ?? 0) < 0 ? "-" : "+"}₹{fmt(Math.abs(total.netPL ?? 0))}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                    total.closingBalance >= 0 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-700"
                  }`}>
                    ₹{fmt(total.closingBalance)}
                  </span>
                </td>
                <td colSpan={2} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
