"use client";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Wallet, BarChart2,
  Truck, Trophy, RefreshCw, AlertTriangle,
} from "lucide-react";
import KPICard          from "./components/KPICard";
import TransportTable   from "./components/TransportTable";
import IncomeExpenseChart from "./components/IncomeExpenseChart";
import ClosingBalanceTrend from "./components/ClosingBalanceTrend";
import ExpenseDonut     from "./components/ExpenseDonut";
import IncomeDonut      from "./components/IncomeDonut";
import PeriodComparison from "./components/PeriodComparison";
import DailyLogTable    from "./components/DailyLogTable";
import TransportDrillDown from "./components/TransportDrillDown";

const PERIODS = [
  { key: "week",    label: "Week"    },
  { key: "month",   label: "Month"   },
  { key: "6month",  label: "6 Months"},
  { key: "year",    label: "Year"    },
];

const todayStr = () => new Date().toISOString().split("T")[0];

export default function EODDashboard() {
  const [date,       setDate]       = useState(todayStr());
  const [transport,  setTransport]  = useState("all");
  const [period,     setPeriod]     = useState("month");
  const [transports, setTransports] = useState([]);

  const [summary,   setSummary]   = useState(null);
  const [snapshot,  setSnapshot]  = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [loadingKpi,   setLoadingKpi]   = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [drillTransport, setDrillTransport] = useState(null);
  const [drillTrend,     setDrillTrend]     = useState([]);

  // Load transport list
  useEffect(() => {
    fetch("/api/transports").then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : [];
      setTransports(list.map(t => ({
        name: t.name,
        slug: t.name.toLowerCase().replace(/\s+/g, "-"),
      })));
    }).catch(() => {});
  }, []);

  const fetchSummary = useCallback(async () => {
    setLoadingKpi(true);
    try {
      const res = await fetch(`/api/dashboard/summary?transport=${transport}`);
      if (res.ok) setSummary(await res.json());
    } catch {}
    finally { setLoadingKpi(false); }
  }, [transport]);

  const fetchSnapshot = useCallback(async () => {
    setLoadingTable(true);
    try {
      const res = await fetch(`/api/dashboard/snapshot?date=${date}&transport=${transport}`);
      if (res.ok) setSnapshot(await res.json());
    } catch {}
    finally { setLoadingTable(false); }
  }, [date, transport]);

  const fetchAnalytics = useCallback(async () => {
    setLoadingChart(true);
    try {
      const res = await fetch(`/api/dashboard/analytics?transport=${transport}&period=${period}`);
      if (res.ok) setAnalytics(await res.json());
    } catch {}
    finally { setLoadingChart(false); }
  }, [transport, period]);

  useEffect(() => { fetchSummary();   }, [fetchSummary]);
  useEffect(() => { fetchSnapshot();  }, [fetchSnapshot]);
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  async function handleRecalculate() {
    setRecalcLoading(true);
    try {
      await fetch("/api/dashboard/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, transportSlug: transport }),
      });
      await Promise.all([fetchSummary(), fetchSnapshot(), fetchAnalytics()]);
    } catch {}
    finally { setRecalcLoading(false); }
  }

  async function handleDrillDown(row) {
    setDrillTransport(row);
    // fetch 7-day trend for this transport
    const end   = date;
    const start = new Date(date + "T00:00:00Z");
    start.setDate(start.getDate() - 6);
    const startStr = start.toISOString().split("T")[0];
    try {
      const res = await fetch(`/api/dashboard/snapshot?from=${startStr}&to=${end}&transport=${row.transportSlug}`);
      if (res.ok) setDrillTrend(await res.json());
    } catch { setDrillTrend([]); }
  }

  const kpi = summary?.kpi;
  const negative = summary?.negativeTransports || [];

  // Merge snapshot rows with vs-yesterday data from summary
  const tableRows = (snapshot?.rows || []).map(r => {
    const summaryRow = summary?.transportRows?.find(s => s.transportSlug === r.transportSlug);
    return {
      ...r,
      vsYesterdayPct: summaryRow?.vsYesterdayPct ?? 0,
      ydClosing:      summaryRow?.ydClosing       ?? 0,
    };
  });

  // Period totals for donut charts (from analytics — covers the full selected period)
  const periodTotals = analytics?.periodTotals;

  // Daily log from analytics
  const dailyLog = (analytics?.dailyData || []).map(d => ({
    date:    d.date,
    income:  d.income,
    expense: d.expense,
    closing: d.closing,
  }));

  const growthPct = analytics?.growthPercent ?? 0;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="w-9 h-9 bg-[#1e73be] rounded-xl flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800 leading-none">EOD Financial Dashboard</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">End of Day Closing Balance & Analytics</p>
            </div>
          </div>

          {/* Date picker */}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1e73be] transition"
          />

          {/* Transport filter */}
          <select
            value={transport}
            onChange={e => setTransport(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 focus:outline-none focus:border-[#1e73be] transition min-w-[140px]"
          >
            <option value="all">All Transports</option>
            {transports.map(t => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>

          {/* Period tabs */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  period === p.key
                    ? "bg-white text-[#1e73be] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Recalculate */}
          <button
            onClick={handleRecalculate}
            disabled={recalcLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1e73be] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            <RefreshCw size={13} className={recalcLoading ? "animate-spin" : ""} />
            {recalcLoading ? "Recalculating…" : "Recalculate"}
          </button>

          {/* Back link */}
          <a href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Dashboard
          </a>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-5 py-5 space-y-5">

        {/* Negative balance alert */}
        {negative.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <span className="text-red-700 font-medium">
              Negative closing balance for: <strong>{negative.join(", ")}</strong>
            </span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Today's Income"
            value={kpi?.totalIncome?.value}
            icon={<TrendingUp size={16} />}
            color="green"
            subLabel="vs yesterday"
            subPct={kpi?.totalIncome?.vsYesterday}
            loading={loadingKpi}
          />
          <KPICard
            title="Today's Expenses"
            value={kpi?.totalExpenses?.value}
            icon={<TrendingDown size={16} />}
            color="red"
            subLabel="vs yesterday"
            subPct={kpi?.totalExpenses?.vsYesterday}
            loading={loadingKpi}
          />
          <KPICard
            title="Closing Balance"
            value={kpi?.closingBalance?.value}
            icon={<Wallet size={16} />}
            color="blue"
            subLabel="Opening"
            subValue={kpi?.closingBalance?.openingBalance}
            loading={loadingKpi}
          />
          <KPICard
            title={`${period === "week" ? "Weekly" : period === "month" ? "Monthly" : period === "6month" ? "6-Month" : "Yearly"} Growth`}
            value={growthPct}
            icon={<BarChart2 size={16} />}
            color="purple"
            prefix={growthPct >= 0 ? "+" : ""}
            suffix="%"
            decimalPlaces={1}
            subLabel="vs prev period"
            loading={loadingChart}
          />
          <KPICard
            title="Net P&L Today"
            value={kpi?.netPL?.value ?? 0}
            icon={<Truck size={16} />}
            color={(kpi?.netPL?.value ?? 0) >= 0 ? "green" : "red"}
            subLabel="vs yesterday"
            subPct={kpi?.netPL?.vsYesterday}
            loading={loadingKpi}
          />
          <KPICard
            title="Best Transport"
            value={kpi?.bestTransport?.closing ?? 0}
            icon={<Trophy size={16} />}
            color="yellow"
            subLabel={kpi?.bestTransport?.name}
            loading={loadingKpi}
          />
        </div>

        {/* Transport Table */}
        <TransportTable
          rows={tableRows}
          total={snapshot?.total}
          loading={loadingTable}
          onRowClick={handleDrillDown}
        />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <IncomeExpenseChart
            data={analytics?.dailyData || []}
            rollingAvg={analytics?.rollingAvg || []}
            loading={loadingChart}
          />
          <ClosingBalanceTrend
            data={analytics?.dailyData || []}
            loading={loadingChart}
          />
        </div>

        {/* Analytics: donuts + stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <IncomeDonut
            data={periodTotals}
            total={analytics?.totalIncome}
            loading={loadingChart}
          />
          <ExpenseDonut
            data={periodTotals}
            total={analytics?.totalExpenses}
            loading={loadingChart}
          />
          <div className="space-y-3">
            {/* Best day */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Best Day</p>
              <p className="text-xl font-bold text-green-600 tabular-nums">
                {analytics?.bestDay?.amount ? `₹${analytics.bestDay.amount.toLocaleString("en-IN")}` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">{analytics?.bestDay?.date || "—"}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Highest Expense Day</p>
              <p className="text-xl font-bold text-red-500 tabular-nums">
                {analytics?.worstDay?.amount ? `₹${analytics.worstDay.amount.toLocaleString("en-IN")}` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">{analytics?.worstDay?.date || "—"}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Avg Daily Income</p>
              <p className="text-xl font-bold text-[#1e73be] tabular-nums">
                {analytics?.avgDailyIncome ? `₹${analytics.avgDailyIncome.toLocaleString("en-IN")}` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per day average over period</p>
            </div>
          </div>
        </div>

        {/* Period comparison + Daily log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <PeriodComparison analytics={analytics} loading={loadingChart} />
          </div>
          <div className="lg:col-span-2">
            <DailyLogTable data={dailyLog} loading={loadingChart} />
          </div>
        </div>

      </div>

      {/* Drill-down side panel */}
      {drillTransport && (
        <TransportDrillDown
          transport={drillTransport}
          trendData={drillTrend}
          onClose={() => { setDrillTransport(null); setDrillTrend([]); }}
        />
      )}
    </div>
  );
}
