"use client";
import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

// ── formatters ────────────────────────────────────────────────────────────────
const fmtFull = n => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;

const fmtY = n => {
  const abs  = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000)    return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000)       return `${sign}₹${(abs / 1_000).toFixed(0)}K`;
  return `${sign}₹${abs}`;
};

const fmtPill = n => {
  const abs  = Math.abs(n);
  const sign = n < 0 ? "-" : "+";
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000)    return `${sign}₹${(abs / 1_000).toFixed(0)}K`;
  return `${sign}₹${abs}`;
};

const fmtDate = dateStr => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

// ── Tooltip ───────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const income  = payload.find(p => p.dataKey === "income")?.value  ?? 0;
  const expense = payload.find(p => p.dataKey === "expense")?.value ?? 0;
  const rolling = payload.find(p => p.dataKey === "rolling")?.value;
  const net     = income - expense;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 text-xs min-w-[190px]">
      <p className="font-bold text-gray-700 text-[13px] pb-2 mb-2 border-b border-gray-100">
        {fmtDate(label)}
      </p>
      <div className="space-y-1.5">
        <Row dot="bg-blue-500"   label="Income"   value={fmtFull(income)}   color="text-blue-600"  />
        <Row dot="bg-red-400"    label="Expense"  value={fmtFull(expense)}  color="text-red-500"   />
        {rolling != null && (
          <Row dot="bg-amber-400" label="7d Avg"  value={fmtFull(rolling)}  color="text-gray-500"  />
        )}
        <div className={`flex justify-between items-center pt-2 mt-1 border-t border-gray-100 font-bold text-[12px]
          ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          <span>Net P&L</span>
          <span>{net >= 0 ? "+" : "-"}{fmtFull(Math.abs(net))}</span>
        </div>
      </div>
    </div>
  );
};

function Row({ dot, label, value, color }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="flex items-center gap-1.5 text-gray-500">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        {label}
      </span>
      <span className={`font-semibold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function IncomeExpenseChart({ data = [], rollingAvg = [], loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="h-5 bg-gray-200 rounded w-44 mb-4 animate-pulse" />
        <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const merged = data.map((d, i) => ({
    ...d,
    rolling: rollingAvg[i]?.avg ?? null,
  }));

  const totalIncome  = merged.reduce((s, d) => s + (d.income  || 0), 0);
  const totalExpense = merged.reduce((s, d) => s + (d.expense || 0), 0);
  const totalNet     = totalIncome - totalExpense;

  if (!merged.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Income vs Expense</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
          No data for selected period
        </div>
      </div>
    );
  }

  // Scale bar size and tick density to data length
  const n        = merged.length;
  const barSize  = n <= 7 ? 28 : n <= 14 ? 20 : n <= 31 ? 12 : n <= 90 ? 6 : 3;
  const interval = n <= 7 ? 0 : n <= 14 ? 1 : n <= 31 ? 3 : n <= 90 ? 6 : 14;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Income vs Expense</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Period totals with 7-day rolling avg</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold whitespace-nowrap">
            In {fmtPill(totalIncome).replace("+", "")}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-semibold whitespace-nowrap">
            Ex {fmtPill(totalExpense).replace("+", "")}
          </span>
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
            totalNet >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}>
            {fmtPill(totalNet)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-4">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-400" /> Expense
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-5 border-t-2 border-dashed border-amber-400" /> 7d Avg
        </span>
      </div>

      <ResponsiveContainer width="100%" height={265}>
        <ComposedChart data={merged} margin={{ top: 6, right: 6, left: 0, bottom: 0 }} barGap={2} barCategoryGap="35%">
          <defs>
            <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.6}  />
            </linearGradient>
            <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f87171" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.6}  />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            interval={interval}
          />
          <YAxis
            tickFormatter={fmtY}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={54}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc", radius: 4 }} />
          <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />

          <Bar dataKey="income"  name="Income"  fill="url(#ig)" radius={[4, 4, 0, 0]} maxBarSize={barSize} />
          <Bar dataKey="expense" name="Expense" fill="url(#eg)" radius={[4, 4, 0, 0]} maxBarSize={barSize} />

          <Line
            type="monotone"
            dataKey="rolling"
            name="7d Avg"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 3"
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
