export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { bulkCalcRange, dateRange, shiftDate } from "@/lib/calcDailySnapshot";
import Transport from "@/models/Transport";

function periodDays(period) {
  return { week: 7, month: 30, "6month": 180, year: 365 }[period] ?? 30;
}

async function getAllSlugs() {
  const ts = await Transport.find({}).lean();
  return ts.map(t => t.name.toLowerCase().replace(/\s+/g, "-"));
}

// GET /api/dashboard/analytics?transport=slug|all&period=week|month|6month|year
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const transport = searchParams.get("transport") || "all";
  const period    = searchParams.get("period")    || "month";

  try {
    const days   = periodDays(period);
    const today  = new Date().toISOString().split("T")[0];

    // Current period: last N days ending today (inclusive)
    const toCur   = today;
    const fromCur = shiftDate(toCur, -(days - 1));

    // Previous period: same length immediately before current
    const toPrev  = shiftDate(fromCur, -1);
    const fromPrev = shiftDate(toPrev, -(days - 1));

    const slugs = transport === "all" ? await getAllSlugs() : [transport];

    // ── 10 total queries for BOTH periods (5 per period) ──────────────────────
    const [curMap, prevMap] = await Promise.all([
      bulkCalcRange(slugs, fromCur,  toCur),
      bulkCalcRange(slugs, fromPrev, toPrev),
    ]);

    const curDates  = dateRange(fromCur,  toCur);
    const prevDates = dateRange(fromPrev, toPrev);

    const curData  = curDates.map(d  => curMap.get(d)  || { date: d,  income: 0, expense: 0, closing: 0 });
    const prevData = prevDates.map(d => prevMap.get(d) || { date: d,  income: 0, expense: 0, closing: 0 });

    const sum = (arr, k) => arr.reduce((s, r) => s + (r[k] || 0), 0);

    const curIncome   = sum(curData,  "income");
    const curExpense  = sum(curData,  "expense");
    const prevIncome  = sum(prevData, "income");
    const prevExpense = sum(prevData, "expense");

    const pct = (cur, prev) => prev ? +(((cur - prev) / prev) * 100).toFixed(1) : 0;

    const best  = curData.reduce((a, b) => (b.income  > a.income  ? b : a), curData[0]  || {});
    const worst = curData.reduce((a, b) => (b.expense > a.expense ? b : a), curData[0] || {});

    // 7-day rolling average
    const rollingAvg = curData.map((_, i) => {
      const window = curData.slice(Math.max(0, i - 6), i + 1);
      return { date: curData[i].date, avg: Math.round(sum(window, "income") / window.length) };
    });

    // Aggregate totals from curMap for donut charts
    const totals = [...curMap.values()].reduce((acc, r) => ({
      deliveryGross:   acc.deliveryGross   + (r.deliveryGross   || 0),
      kasarTotal:      acc.kasarTotal      + (r.kasarTotal      || 0),
      deliveryIncome:  acc.deliveryIncome  + (r.deliveryIncome  || 0),
      paidLrIncome:    acc.paidLrIncome    + (r.paidLrIncome    || 0),
      demurrageIncome: acc.demurrageIncome + (r.demurrageIncome || 0),
      dailyExpenses:   acc.dailyExpenses   + (r.dailyExpenses   || 0),
      salaryAdvances:  acc.salaryAdvances  + (r.salaryAdvances  || 0),
      hamaliExpense:   acc.hamaliExpense   + (r.hamaliExpense   || 0),
      crossingExpense: acc.crossingExpense + (r.crossingExpense || 0),
      memoAdvance:     acc.memoAdvance     + (r.memoAdvance     || 0),
      vehicleHire:     acc.vehicleHire     + (r.vehicleHire     || 0),
    }), {
      deliveryGross: 0, kasarTotal: 0, deliveryIncome: 0,
      paidLrIncome: 0, demurrageIncome: 0,
      dailyExpenses: 0, salaryAdvances: 0,
      hamaliExpense: 0, crossingExpense: 0, memoAdvance: 0, vehicleHire: 0,
    });

    return Response.json({
      totalIncome:          curIncome,
      totalExpenses:        curExpense,
      netBalance:           curIncome - curExpense,
      growthPercent:        pct(curIncome,  prevIncome),
      expenseGrowthPercent: pct(curExpense, prevExpense),
      avgDailyIncome:       Math.round(curIncome  / Math.max(1, curDates.length)),
      avgDailyExpense:      Math.round(curExpense / Math.max(1, curDates.length)),
      bestDay:  { date: best?.date,  amount: best?.income  },
      worstDay: { date: worst?.date, amount: worst?.expense },
      dailyData:    curData,
      prevDailyData: prevData,
      rollingAvg,
      periodTotals: totals,
      period,
      dateRange:     { from: fromCur,  to: toCur  },
      prevDateRange: { from: fromPrev, to: toPrev },
    });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
