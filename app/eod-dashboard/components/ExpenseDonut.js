"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"];
const fmt = n => Number(n ?? 0).toLocaleString("en-IN");

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700">{name}</p>
      <p className="text-red-600 font-bold text-sm mt-0.5">₹{fmt(value)}</p>
    </div>
  );
};

const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold">
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

export default function ExpenseDonut({ data, total, loading }) {
  const items = [
    { name: "Daily Expenses",   value: data?.dailyExpenses   || 0 },
    { name: "Salary Advances",  value: data?.salaryAdvances  || 0 },
    { name: "Hamali",           value: data?.hamaliExpense   || 0 },
    { name: "Crossing",         value: data?.crossingExpense || 0 },
    { name: "Driver Advance",   value: data?.memoAdvance     || 0 },
    { name: "Vehicle Hire",     value: data?.vehicleHire     || 0 },
  ].filter(i => i.value > 0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <div className="h-[220px] bg-gray-100 rounded-full mx-auto w-[220px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Expense Breakdown</h3>
        <span className="text-xs font-bold text-red-600">₹{fmt(total || 0)}</span>
      </div>

      {!items.length ? (
        <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No expenses</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={items}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={CustomLabel}
              >
                {items.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {items.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800 tabular-nums">₹{fmt(item.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
