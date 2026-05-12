"use client";
import { useEffect, useState, useRef } from "react";

function useCountUp(target, duration = 700) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (target === from) return;

    const range = target - from;
    const steps = Math.ceil(duration / 16);
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(from + range * eased);
      if (step >= steps) { setVal(target); clearInterval(timer); }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return val;
}

const fmtINR = n => Math.abs(n).toLocaleString("en-IN");

export default function KPICard({
  title, value, icon, color,
  subLabel, subValue, subPct,
  loading,
  prefix = "₹",
  suffix = "",
  isCount = false,
  decimalPlaces = 0,
}) {
  const numVal   = typeof value === "number" ? value : 0;
  const isNeg    = numVal < 0;
  const animated = useCountUp(Math.abs(numVal));

  const colorMap = {
    green:  { border: "border-l-green-500",  bg: "bg-green-50",  icon: "text-green-600"  },
    red:    { border: "border-l-red-500",    bg: "bg-red-50",    icon: "text-red-600"    },
    blue:   { border: "border-l-[#1e73be]",  bg: "bg-blue-50",   icon: "text-[#1e73be]"  },
    purple: { border: "border-l-purple-500", bg: "bg-purple-50", icon: "text-purple-600" },
    orange: { border: "border-l-orange-500", bg: "bg-orange-50", icon: "text-orange-600" },
    yellow: { border: "border-l-yellow-500", bg: "bg-yellow-50", icon: "text-yellow-600" },
  };
  const c = colorMap[color] || colorMap.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-gray-200 p-5 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="w-9 h-9 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-7 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
    );
  }

  const displayVal = isCount
    ? Math.round(animated)
    : decimalPlaces > 0
      ? animated.toFixed(decimalPlaces)
      : fmtINR(animated);

  const pctColor = subPct > 0 ? "text-green-600" : subPct < 0 ? "text-red-500" : "text-gray-400";
  const pctArrow = subPct > 0 ? "▲" : subPct < 0 ? "▼" : "—";

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${c.border} p-5 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-default`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">{title}</p>
        <div className={`w-9 h-9 rounded-lg shrink-0 ml-2 ${c.bg} flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
      </div>

      <p className={`text-2xl font-bold tabular-nums ${isNeg ? "text-red-600" : "text-gray-900"}`}>
        {isNeg && "-"}
        {prefix}{displayVal}{suffix}
      </p>

      <div className="mt-2 flex items-center gap-2 flex-wrap min-h-[18px]">
        {subLabel && <span className="text-[11px] text-gray-500">{subLabel}</span>}
        {subValue !== undefined && (
          <span className="text-[11px] text-gray-600 font-medium tabular-nums">
            ₹{fmtINR(subValue)}
          </span>
        )}
        {subPct !== undefined && (
          <span className={`text-[11px] font-semibold ${pctColor}`}>
            {pctArrow} {Math.abs(subPct).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
