"use client";
import { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

// ── formatters ────────────────────────────────────────────────────────────────
const fmtFull = n => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;

const fmtY = n => {
  const abs  = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000)    return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000)       return `${sign}${(abs / 1_000).toFixed(0)}K`;
  return `${sign}₹${abs}`;
};

const fmtCompact = n => {
  const abs  = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000)    return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return `${sign}₹${abs}`;
};

const fmtDate = dateStr => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

// ── Custom elements ───────────────────────────────────────────────────────────
const CustomDot = ({ cx, cy, payload, dataLength }) => {
  if (!cx || !cy || dataLength > 60) return null;
  const pos = (payload?.closing ?? 0) >= 0;
  return <circle cx={cx} cy={cy} r={dataLength > 30 ? 2 : 3} fill={pos ? "#22c55e" : "#ef4444"} />;
};

const ActiveDot = ({ cx, cy, payload }) => {
  if (!cx || !cy) return null;
  const pos = (payload?.closing ?? 0) >= 0;
  return <circle cx={cx} cy={cy} r={5} fill={pos ? "#22c55e" : "#ef4444"} stroke="white" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const pos = val >= 0;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 text-xs min-w-[160px]">
      <p className="font-bold text-gray-600 mb-2 text-[13px]">{fmtDate(label)}</p>
      <p className={`font-bold text-base tabular-nums ${pos ? "text-emerald-600" : "text-red-600"}`}>
        {val < 0 ? "-" : ""}{fmtFull(Math.abs(val))}
      </p>
      <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold
        ${pos ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
        {pos ? "Surplus" : "Deficit"}
      </span>
    </div>
  );
};

// ── Stat mini card ────────────────────────────────────────────────────────────
function StatCard({ label, value, date, positive }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${positive ? "bg-emerald-50" : "bg-red-50"}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wide ${positive ? "text-emerald-600" : "text-red-500"}`}>
        {label}
      </p>
      <p className={`text-sm font-bold tabular-nums ${positive ? "text-emerald-700" : "text-red-600"}`}>
        {fmtCompact(value)}
      </p>
      {date && (
        <p className={`text-[10px] ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {fmtDate(date)}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ClosingBalanceTrend({ data = [], loading }) {

  const stats = useMemo(() => {
    if (!data.length) return null;
    const vals    = data.map(d => d.closing ?? 0);
    const maxVal  = Math.max(...vals);
    const minVal  = Math.min(...vals);
    const hasNeg  = minVal < 0;
    const hasPos  = maxVal > 0;
    const range   = maxVal - minVal || 1;
    // % from top where y=0 sits (for gradient split)
    const zeroOff = `${((maxVal / range) * 100).toFixed(2)}%`;
    const lastVal = vals[vals.length - 1];
    const peakIdx = vals.indexOf(maxVal);
    const troughIdx = vals.indexOf(minVal);
    return {
      maxVal, minVal, hasNeg, hasPos, zeroOff, lastVal,
      peakDay:   data[peakIdx]?.date,
      troughDay: data[troughIdx]?.date,
      n: data.length,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="h-5 bg-gray-200 rounded w-52 mb-4 animate-pulse" />
        <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data.length || !stats) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Closing Balance Trend</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
          No data for selected period
        </div>
      </div>
    );
  }

  const { maxVal, minVal, hasNeg, hasPos, zeroOff, lastVal, peakDay, troughDay, n } = stats;

  // Line + fill colour logic
  const lineColor  = hasNeg && hasPos ? "#6366f1" : hasNeg ? "#ef4444" : "#22c55e";
  const fillId     = hasNeg && hasPos ? "mixGrad"  : hasNeg ? "negGrad" : "posGrad";

  const statusLabel = hasNeg && hasPos ? "Mixed"       : hasNeg ? "All Deficit" : "All Surplus";
  const statusCls   = hasNeg          ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700";

  const interval = n <= 7 ? 0 : n <= 14 ? 1 : n <= 31 ? 3 : n <= 90 ? 6 : 14;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Closing Balance Trend</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Cumulative balance over period</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCls}`}>
            {statusLabel}
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap
            ${lastVal >= 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"}`}>
            Latest: {fmtCompact(lastVal)}
          </span>
        </div>
      </div>

      {/* Mini stat cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatCard label="Peak"                   value={maxVal} date={peakDay}   positive={true} />
        <StatCard label={hasNeg ? "Trough" : "Min"} value={minVal} date={troughDay} positive={!hasNeg} />
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
          <defs>
            {/* All positive */}
            <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.03} />
            </linearGradient>
            {/* All negative */}
            <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.35} />
            </linearGradient>
            {/* Mixed: green above 0, red below 0 */}
            <linearGradient id="mixGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"    stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset={zeroOff} stopColor="#22c55e" stopOpacity={0.05} />
              <stop offset={zeroOff} stopColor="#ef4444" stopOpacity={0.05} />
              <stop offset="100%"  stopColor="#ef4444" stopOpacity={0.35} />
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

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1.5 }} />

          {/* Zero baseline — only meaningful when there are negatives */}
          {hasNeg && (
            <ReferenceLine
              y={0}
              stroke="#d1d5db"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              label={{ value: "₹0", position: "insideTopRight", fontSize: 9, fill: "#9ca3af", dy: -4 }}
            />
          )}

          <Area
            type="monotone"
            dataKey="closing"
            stroke={lineColor}
            strokeWidth={2.5}
            fill={`url(#${fillId})`}
            dot={<CustomDot dataLength={n} />}
            activeDot={<ActiveDot />}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
