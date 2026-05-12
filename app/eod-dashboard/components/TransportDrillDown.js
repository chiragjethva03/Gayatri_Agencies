"use client";
import { X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fmt = n => Number(n ?? 0).toLocaleString("en-IN");

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function StatRow({ label, value, color = "text-gray-800" }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-bold tabular-nums ${color}`}>₹{fmt(value)}</span>
    </div>
  );
}

export default function TransportDrillDown({ transport, trendData = [], onClose }) {
  if (!transport) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white h-full w-full max-w-md shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-[#1e73be] text-white px-5 py-4 flex items-start justify-between shrink-0">
          <div>
            <p className="text-[11px] text-blue-200 uppercase tracking-widest font-semibold">Transport Detail</p>
            <h2 className="text-lg font-bold mt-0.5">{transport.transportName}</h2>
            <p className="text-sm text-blue-200 mt-0.5">{transport.date}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Closing balance hero */}
          <div className={`rounded-xl p-4 text-center ${
            transport.closingBalance >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Closing Balance</p>
            <p className={`text-3xl font-bold tabular-nums ${
              transport.closingBalance >= 0 ? "text-green-700" : "text-red-600"
            }`}>
              {transport.closingBalance < 0 ? "-" : ""}₹{fmt(Math.abs(transport.closingBalance))}
            </p>
            <p className="text-xs text-gray-400 mt-1">Opening: ₹{fmt(transport.openingBalance)}</p>
          </div>

          {/* Income section */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Income Sources</p>
            <div className="bg-green-50/50 rounded-xl border border-green-100 px-4 py-1">
              <StatRow label="LR Freight"        value={transport.lrFreight}       color="text-green-700" />
              <StatRow label="Memo Freight"       value={transport.memoFreight}     color="text-green-700" />
              <StatRow label="Delivery Freight"   value={transport.deliveryFreight} color="text-green-700" />
              {transport.otherIncome > 0 &&
                <StatRow label="Other Income"     value={transport.otherIncome}     color="text-green-700" />
              }
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-bold text-green-800">Total Income</span>
                <span className="text-sm font-bold text-green-800 tabular-nums">₹{fmt(transport.totalIncome)}</span>
              </div>
            </div>
          </div>

          {/* Expense section */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Expense Sources</p>
            <div className="bg-red-50/50 rounded-xl border border-red-100 px-4 py-1">
              <StatRow label="Daily Expenses"  value={transport.dailyExpenses}  color="text-red-600" />
              <StatRow label="Driver Advances" value={transport.driverAdvances} color="text-red-600" />
              <StatRow label="Salary Advances" value={transport.salaryAdvances} color="text-red-600" />
              <StatRow label="Hamali"          value={transport.hamali}         color="text-red-600" />
              <StatRow label="Service Charges" value={transport.serviceCharges} color="text-red-600" />
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-bold text-red-700">Total Expenses</span>
                <span className="text-sm font-bold text-red-700 tabular-nums">₹{fmt(transport.totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* 7-day trend chart */}
          {trendData.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">7-Day Closing Balance</p>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="drill-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1e73be" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1e73be" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={v => `₹${fmt(v)}`} labelFormatter={formatDate} />
                  <Area type="monotone" dataKey="closing" stroke="#1e73be" strokeWidth={2} fill="url(#drill-grad)" dot={{ r: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
