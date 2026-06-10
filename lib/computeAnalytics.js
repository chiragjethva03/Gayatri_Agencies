import connectDB from "@/lib/mongodb";
import { bulkCalcRange, dateRange, shiftDate } from "@/lib/calcDailySnapshot";
import Transport from "@/models/Transport";
import InwardOutward from "@/models/InwardOutward";

function periodDays(period) {
  return { week: 7, month: 30, "6month": 180, year: 365 }[period] ?? 30;
}

async function getAllSlugs() {
  const ts = await Transport.find({}).lean();
  return ts.map(t => t.name.toLowerCase().replace(/\s+/g, "-"));
}

// Server-side result cache — all clients share one DB query per 60s per transport+period.
const _cache = new Map();
const CACHE_TTL = 60_000;

export function invalidateAnalyticsCache() {
  _cache.clear();
}

export async function computeAnalytics(transport = "all", period = "month") {
  const key = `${transport}:${period}`;
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;

  await connectDB();

  const days     = periodDays(period);
  const today    = new Date().toISOString().split("T")[0];
  const toCur    = today;
  const fromCur  = shiftDate(toCur,   -(days - 1));
  const toPrev   = shiftDate(fromCur, -1);
  const fromPrev = shiftDate(toPrev,  -(days - 1));

  const slugs       = transport === "all" ? await getAllSlugs() : [transport];
  const allExpenses = transport === "all";

  const [curMap, prevMap] = await Promise.all([
    bulkCalcRange(slugs, fromCur,  toCur,  allExpenses),
    bulkCalcRange(slugs, fromPrev, toPrev, allExpenses),
  ]);

  const curDates  = dateRange(fromCur,  toCur);
  const prevDates = dateRange(fromPrev, toPrev);

  const curData  = curDates.map(d  => curMap.get(d)  || { date: d, income: 0, expense: 0, closing: 0 });
  const prevData = prevDates.map(d => prevMap.get(d) || { date: d, income: 0, expense: 0, closing: 0 });

  const sum = (arr, k) => arr.reduce((s, r) => s + (r[k] || 0), 0);

  const curIncome   = sum(curData,  "income");
  const curExpense  = sum(curData,  "expense");
  const prevIncome  = sum(prevData, "income");
  const prevExpense = sum(prevData, "expense");

  const pct   = (cur, prev) => prev ? +(((cur - prev) / prev) * 100).toFixed(1) : 0;
  const best  = curData.reduce((a, b) => (b.income  > a.income  ? b : a), curData[0]  || {});
  const worst = curData.reduce((a, b) => (b.expense > a.expense ? b : a), curData[0] || {});

  const rollingAvg = curData.map((_, i) => {
    const w = curData.slice(Math.max(0, i - 6), i + 1);
    return { date: curData[i].date, avg: Math.round(sum(w, "income") / w.length) };
  });

  const totals = [...curMap.values()].reduce((acc, r) => ({
    deliveryGross:       acc.deliveryGross       + (r.deliveryGross       || 0),
    kasarTotal:          acc.kasarTotal          + (r.kasarTotal          || 0),
    deliveryIncome:      acc.deliveryIncome      + (r.deliveryIncome      || 0),
    paidLrIncome:        acc.paidLrIncome        + (r.paidLrIncome        || 0),
    serviceChargeIncome: acc.serviceChargeIncome + (r.serviceChargeIncome || 0),
    demurrageIncome:     acc.demurrageIncome     + (r.demurrageIncome     || 0),
    dailyExpenses:       acc.dailyExpenses       + (r.dailyExpenses       || 0),
    salaryAdvances:      acc.salaryAdvances      + (r.salaryAdvances      || 0),
    hamaliExpense:       acc.hamaliExpense       + (r.hamaliExpense       || 0),
    crossingExpense:     acc.crossingExpense     + (r.crossingExpense     || 0),
    memoAdvance:         acc.memoAdvance         + (r.memoAdvance         || 0),
    vehicleHire:         acc.vehicleHire         + (r.vehicleHire         || 0),
    ioHamaliExpense:     acc.ioHamaliExpense     + (r.ioHamaliExpense     || 0),
  }), {
    deliveryGross: 0, kasarTotal: 0, deliveryIncome: 0,
    paidLrIncome: 0, serviceChargeIncome: 0, demurrageIncome: 0,
    dailyExpenses: 0, salaryAdvances: 0,
    hamaliExpense: 0, crossingExpense: 0, memoAdvance: 0, vehicleHire: 0,
    ioHamaliExpense: 0,
  });

  // Live demurrage: ₹10/article/day after 7 free days.
  // Query the current period's Inward records and compute from createdAt.
  // deliveryData.article can be "" on older records — fall back to io.goods sum.
  // Delivered records freeze at their delivery date; undelivered accumulate to today.
  const RATE      = 10;
  const FREE_DAYS = 7;
  const todayMs   = new Date().setHours(0, 0, 0, 0);

  const ioPeriod = await InwardOutward.find({
    type: { $ne: "Outward" },
    ...(transport !== "all" ? { transportSlug: transport } : {}),
    createdAt: {
      $gte: new Date(fromCur + "T00:00:00.000Z"),
      $lte: new Date(toCur   + "T23:59:59.999Z"),
    },
  }).lean();

  totals.demurrageIncome = ioPeriod.reduce((s, io) => {
    const dlv      = io.deliveryData || {};
    const articles = Number(dlv.article) ||
      (Array.isArray(io.goods) ? io.goods.reduce((a, g) => a + (Number(g.article) || 0), 0) : 0);
    if (!articles) return s;
    const arrivalMs = new Date(io.createdAt).setHours(0, 0, 0, 0);
    let endMs = todayMs;
    const ds = dlv.deliveryDate;
    if (ds && ds !== "") {
      const d = ds.includes("/")
        ? (() => { const [dd, mm, yyyy] = ds.split("/"); return new Date(`${yyyy}-${mm}-${dd}`); })()
        : new Date(ds);
      if (!isNaN(d.getTime())) endMs = d.setHours(0, 0, 0, 0);
    }
    const chargeDays = Math.max(0, Math.floor((endMs - arrivalMs) / 86400000) - FREE_DAYS);
    return s + chargeDays * RATE * articles;
  }, 0);

  // totalIncome = direct sum of period slices so donut total always matches its slices
  const liveIncome = totals.paidLrIncome + totals.serviceChargeIncome +
                     totals.demurrageIncome + totals.deliveryIncome;

  const data = {
    totalIncome:          liveIncome,
    totalExpenses:        curExpense,
    netBalance:           liveIncome - curExpense,
    growthPercent:        pct(curIncome,  prevIncome),
    expenseGrowthPercent: pct(curExpense, prevExpense),
    avgDailyIncome:       Math.round(liveIncome / Math.max(1, curDates.length)),
    avgDailyExpense:      Math.round(curExpense  / Math.max(1, curDates.length)),
    bestDay:  { date: best?.date,  amount: best?.income  },
    worstDay: { date: worst?.date, amount: worst?.expense },
    dailyData:     curData,
    prevDailyData: prevData,
    rollingAvg,
    periodTotals:  totals,
    period,
    dateRange:     { from: fromCur,  to: toCur  },
    prevDateRange: { from: fromPrev, to: toPrev },
  };

  _cache.set(key, { data, ts: Date.now() });
  return data;
}
