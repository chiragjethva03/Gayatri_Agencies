"use client";

const fmt = n => Number(n ?? 0).toLocaleString("en-IN");

function MetricBar({ label, current, previous, color }) {
  const max = Math.max(current, previous, 1);
  const curPct  = (current  / max) * 100;
  const prevPct = (previous / max) * 100;
  const diff    = current - previous;
  const pct     = previous ? +(((diff) / previous) * 100).toFixed(1) : 0;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-800 tabular-nums">₹{fmt(current)}</span>
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
            diff > 0 ? "bg-green-100 text-green-700" : diff < 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
          }`}>
            {diff > 0 ? "▲" : diff < 0 ? "▼" : "—"} {Math.abs(pct)}%
          </span>
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${curPct}%` }}
        />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-1.5 rounded-full bg-gray-200 transition-all duration-700" style={{ width: `${prevPct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-gray-400">Previous: ₹{fmt(previous)}</span>
      </div>
    </div>
  );
}

export default function PeriodComparison({ analytics, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="h-5 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg mb-3 animate-pulse" />)}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Period Comparison</h3>
        <div className="text-gray-400 text-sm text-center py-8">No data</div>
      </div>
    );
  }

  const curIncome   = analytics.totalIncome    || 0;
  const curExpense  = analytics.totalExpenses  || 0;
  const curNet      = analytics.netBalance     || 0;
  const prevIncome  = analytics.prevDailyData?.reduce((s, r) => s + (r.income  || 0), 0) || 0;
  const prevExpense = analytics.prevDailyData?.reduce((s, r) => s + (r.expense || 0), 0) || 0;
  const prevNet     = prevIncome - prevExpense;

  const periodLabel = {
    week:    "This Week vs Last Week",
    month:   "This Month vs Last Month",
    "6month":"Last 6 Months vs Previous 6 Months",
    year:    "This Year vs Last Year",
  }[analytics.period] || "Current vs Previous Period";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-700">Period Comparison</h3>
        <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{periodLabel}</span>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-4">
        <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-blue-500 inline-block" /> Current</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-gray-200 inline-block" /> Previous</span>
      </div>

      <MetricBar label="Total Income"   current={curIncome}  previous={prevIncome}  color="bg-[#1e73be]" />
      <MetricBar label="Total Expenses" current={curExpense} previous={prevExpense} color="bg-red-400"   />
      <MetricBar label="Net Balance"    current={Math.max(0, curNet)} previous={Math.max(0, prevNet)} color="bg-green-500" />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
        {[
          { label: "Income Growth",  val: analytics.growthPercent        ?? 0 },
          { label: "Expense Change", val: analytics.expenseGrowthPercent ?? 0 },
          { label: "Net Change",     val: prevNet ? +(((curNet - prevNet) / Math.abs(prevNet)) * 100).toFixed(1) : 0 },
        ].map(({ label, val }) => (
          <div key={label} className="text-center">
            <p className={`text-base font-bold ${val > 0 ? "text-green-600" : val < 0 ? "text-red-500" : "text-gray-400"}`}>
              {val > 0 ? "+" : ""}{val}%
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
