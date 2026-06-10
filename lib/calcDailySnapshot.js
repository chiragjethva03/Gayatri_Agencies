import Expense from "@/models/Expense";
import SalaryAdvance from "@/models/SalaryAdvance";
import LR from "@/models/LR";
import Memo from "@/models/Memo";
import DailySnapshot from "@/models/DailySnapshot";
import InwardOutward from "@/models/InwardOutward";

// ── safe wrapper — one bad query never crashes the whole function ─────────────
async function safeAgg(model, pipeline) {
  try {
    return await model.aggregate(pipeline);
  } catch (err) {
    console.error(`[calcDailySnapshot] ${model.modelName} error:`, err.message);
    return [];
  }
}

// LR income condition: "Paid" freight type OR explicitly collected payment
const LR_INCOME = {
  $or: [
    { $eq: ["$freightBy",    "Paid"] },
    { $eq: ["$paymentStatus","Paid"] },
  ],
};

// ── Cumulative opening balance — sum of ALL historical P&L before dateStr ────
async function calcOpening(transportSlug, dateStr) {
  const before    = { $lt: dateStr };
  const ioBefore  = { $lt: new Date(dateStr + "T00:00:00.000Z") };

  const [expH, salH, lrH, memoH, ioH] = await Promise.all([
    safeAgg(Expense, [
      { $match: { transportSlug, date: before } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    safeAgg(SalaryAdvance, [
      { $match: { transportSlug, date: before } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    safeAgg(LR, [
      { $match: { transportSlug, lrDate: before } },
      { $group: {
        _id:      null,
        income:   { $sum: { $cond: [LR_INCOME, { $ifNull: ["$subTotal", 0] }, 0] } },
        hamali:   { $sum: { $ifNull: ["$hamali",   0] } },
        crossing: { $sum: { $ifNull: ["$crossing", 0] } },
      }},
    ]),
    safeAgg(Memo, [
      { $match: { transportSlug, date: before } },
      { $group: { _id: null, advance: { $sum: { $ifNull: ["$advanced", 0] } }, hire: { $sum: { $ifNull: ["$hire", 0] } } } },
    ]),
    safeAgg(InwardOutward, [
      { $match: { transportSlug, createdAt: ioBefore } },
      { $group: {
        _id: null,
        serviceChargeIncome: { $sum: { $convert: { input: "$deliveryData.serviceCharge", to: "double", onError: 0, onNull: 0 } } },
        demurrageIncome:     { $sum: { $ifNull: ["$deliveryData.demurrageAmt", 0] } },
        ioHamaliExpense:     { $sum: { $convert: { input: "$deliveryData.hamali",        to: "double", onError: 0, onNull: 0 } } },
      }},
    ]),
  ]);

  const histIncome   = (lrH[0]?.income || 0) + (ioH[0]?.serviceChargeIncome || 0) + (ioH[0]?.demurrageIncome || 0);
  const histExpenses =
    (expH[0]?.total    || 0) +
    (salH[0]?.total    || 0) +
    (lrH[0]?.hamali    || 0) +
    (lrH[0]?.crossing  || 0) +
    (memoH[0]?.advance || 0) +
    (memoH[0]?.hire    || 0) +
    (ioH[0]?.ioHamaliExpense || 0);

  return histIncome - histExpenses;
}

// ── Single-date, single-transport calc ───────────────────────────────────────
export async function calcSnapshot(transportSlug, dateStr) {
  const match = { transportSlug, date: dateStr };

  const ioDateRange = {
    $gte: new Date(dateStr + "T00:00:00.000Z"),
    $lte: new Date(dateStr + "T23:59:59.999Z"),
  };

  const [expenseAgg, salaryAgg, lrAgg, memoAgg, ioAgg, openingBalance] =
    await Promise.all([
      safeAgg(Expense, [
        { $match: match },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      safeAgg(SalaryAdvance, [
        { $match: match },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      safeAgg(LR, [
        { $match: { transportSlug, lrDate: dateStr } },
        { $group: {
          _id:             null,
          paidLrIncome:    { $sum: { $cond: [LR_INCOME, { $ifNull: ["$subTotal", 0] }, 0] } },
          hamaliExpense:   { $sum: { $ifNull: ["$hamali",   0] } },
          crossingExpense: { $sum: { $ifNull: ["$crossing", 0] } },
        }},
      ]),
      safeAgg(Memo, [
        { $match: match },
        { $group: { _id: null, memoAdvance: { $sum: { $ifNull: ["$advanced", 0] } }, vehicleHire: { $sum: { $ifNull: ["$hire", 0] } } } },
      ]),
      safeAgg(InwardOutward, [
        { $match: { transportSlug, createdAt: ioDateRange } },
        { $group: {
          _id: null,
          serviceChargeIncome: { $sum: { $convert: { input: "$deliveryData.serviceCharge", to: "double", onError: 0, onNull: 0 } } },
          demurrageIncome:     { $sum: { $ifNull: ["$deliveryData.demurrageAmt", 0] } },
          ioHamaliExpense:     { $sum: { $convert: { input: "$deliveryData.hamali",        to: "double", onError: 0, onNull: 0 } } },
        }},
      ]),
      calcOpening(transportSlug, dateStr),
    ]);

  const deliveryGross        = 0;
  const kasarTotal           = 0;
  const deliveryIncome       = 0;
  const paidLrIncome         = lrAgg[0]?.paidLrIncome        || 0;
  const serviceChargeIncome  = ioAgg[0]?.serviceChargeIncome || 0;
  const demurrageIncome      = ioAgg[0]?.demurrageIncome     || 0;
  const totalIncome          = paidLrIncome + serviceChargeIncome + demurrageIncome;

  const dailyExpenses   = expenseAgg[0]?.total       || 0;
  const salaryAdvances  = salaryAgg[0]?.total         || 0;
  const hamaliExpense   = lrAgg[0]?.hamaliExpense     || 0;
  const crossingExpense = lrAgg[0]?.crossingExpense   || 0;
  const memoAdvance     = memoAgg[0]?.memoAdvance     || 0;
  const vehicleHire     = memoAgg[0]?.vehicleHire     || 0;
  const ioHamaliExpense = ioAgg[0]?.ioHamaliExpense   || 0;
  const totalExpenses   = dailyExpenses + salaryAdvances + hamaliExpense + crossingExpense + memoAdvance + vehicleHire + ioHamaliExpense;

  const netPL = totalIncome - totalExpenses;

  return {
    deliveryGross, kasarTotal, deliveryIncome,
    paidLrIncome, serviceChargeIncome, demurrageIncome, totalIncome,
    dailyExpenses, salaryAdvances, hamaliExpense, crossingExpense, memoAdvance, vehicleHire, ioHamaliExpense, totalExpenses,
    netPL, openingBalance, closingBalance: openingBalance + netPL,
  };
}

// ── BULK range calc ───────────────────────────────────────────────────────────
export async function bulkCalcRange(slugs, from, to, allExpenses = false) {
  const slugList   = slugs.map(s => (typeof s === "string" ? s : s.slug));
  const dateFilter = { $gte: from, $lte: to };

  const expenseMatch = allExpenses
    ? { date: dateFilter }
    : { transportSlug: { $in: slugList }, date: dateFilter };

  const ioCreatedAtFilter = {
    $gte: new Date(from + "T00:00:00.000Z"),
    $lte: new Date(to   + "T23:59:59.999Z"),
  };
  const ioMatch = allExpenses
    ? { createdAt: ioCreatedAtFilter }
    : { transportSlug: { $in: slugList }, createdAt: ioCreatedAtFilter };

  const [expenseAgg, salaryAgg, lrAgg, memoAgg, ioAgg] = await Promise.all([
    safeAgg(Expense, [
      { $match: expenseMatch },
      { $group: { _id: "$date", total: { $sum: "$amount" } } },
    ]),
    safeAgg(SalaryAdvance, [
      { $match: { transportSlug: { $in: slugList }, date: dateFilter } },
      { $group: { _id: "$date", total: { $sum: "$amount" } } },
    ]),
    safeAgg(LR, [
      { $match: { transportSlug: { $in: slugList }, lrDate: dateFilter } },
      { $group: {
        _id:             "$lrDate",
        paidLrIncome:    { $sum: { $cond: [LR_INCOME, { $ifNull: ["$subTotal", 0] }, 0] } },
        hamaliExpense:   { $sum: { $ifNull: ["$hamali",   0] } },
        crossingExpense: { $sum: { $ifNull: ["$crossing", 0] } },
      }},
    ]),
    safeAgg(Memo, [
      { $match: { transportSlug: { $in: slugList }, date: dateFilter } },
      { $group: { _id: "$date", memoAdvance: { $sum: { $ifNull: ["$advanced", 0] } }, vehicleHire: { $sum: { $ifNull: ["$hire", 0] } } } },
    ]),
    safeAgg(InwardOutward, [
      { $match: ioMatch },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        // serviceCharge & hamali stored as strings from text inputs — use $convert to handle safely
        serviceChargeIncome: { $sum: { $convert: { input: "$deliveryData.serviceCharge", to: "double", onError: 0, onNull: 0 } } },
        demurrageIncome:     { $sum: { $ifNull: ["$deliveryData.demurrageAmt", 0] } },
        ioHamaliExpense:     { $sum: { $convert: { input: "$deliveryData.hamali",        to: "double", onError: 0, onNull: 0 } } },
      }},
    ]),
  ]);

  const byDate     = arr => Object.fromEntries(arr.map(r => [r._id, r]));
  const expenseMap = byDate(expenseAgg);
  const salaryMap  = byDate(salaryAgg);
  const lrMap      = byDate(lrAgg);
  const memoMap    = byDate(memoAgg);
  const ioMap      = byDate(ioAgg);

  const prevDayStr = shiftDate(from, -1);
  const prevSnap   = await DailySnapshot.findOne(
    { transportSlug: { $in: slugList }, date: prevDayStr }
  ).lean();

  let runningBalance = prevSnap?.closingBalance ?? null;

  if (runningBalance === null) {
    const beforeFilter = { $lt: from };
    const [expH, salH, lrH, memoH] = await Promise.all([
      safeAgg(Expense, [
        { $match: { transportSlug: { $in: slugList }, date: beforeFilter } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      safeAgg(SalaryAdvance, [
        { $match: { transportSlug: { $in: slugList }, date: beforeFilter } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      safeAgg(LR, [
        { $match: { transportSlug: { $in: slugList }, lrDate: beforeFilter } },
        { $group: {
          _id: null,
          income:   { $sum: { $cond: [LR_INCOME, { $ifNull: ["$subTotal", 0] }, 0] } },
          hamali:   { $sum: { $ifNull: ["$hamali",   0] } },
          crossing: { $sum: { $ifNull: ["$crossing", 0] } },
        }},
      ]),
      safeAgg(Memo, [
        { $match: { transportSlug: { $in: slugList }, date: beforeFilter } },
        { $group: { _id: null, advance: { $sum: { $ifNull: ["$advanced", 0] } }, hire: { $sum: { $ifNull: ["$hire", 0] } } } },
      ]),
    ]);

    const histIncome   = lrH[0]?.income || 0;
    const histExpenses =
      (expH[0]?.total    || 0) + (salH[0]?.total    || 0) +
      (lrH[0]?.hamali    || 0) + (lrH[0]?.crossing  || 0) +
      (memoH[0]?.advance || 0) + (memoH[0]?.hire     || 0);

    runningBalance = histIncome - histExpenses;
  }

  const result = new Map();
  for (const d of dateRange(from, to)) {
    const exp  = expenseMap[d] || {};
    const sal  = salaryMap[d]  || {};
    const lr   = lrMap[d]      || {};
    const memo = memoMap[d]    || {};

    const io = ioMap[d] || {};

    const deliveryGross        = 0;
    const kasarTotal           = 0;
    const deliveryIncome       = 0;
    const paidLrIncome         = lr.paidLrIncome        || 0;
    const serviceChargeIncome  = io.serviceChargeIncome || 0;
    const demurrageIncome      = io.demurrageIncome     || 0;
    const totalIncome          = paidLrIncome + serviceChargeIncome + demurrageIncome;

    const dailyExpenses   = exp.total          || 0;
    const salaryAdvances  = sal.total          || 0;
    const hamaliExpense   = lr.hamaliExpense   || 0;
    const crossingExpense = lr.crossingExpense || 0;
    const memoAdvance     = memo.memoAdvance   || 0;
    const vehicleHire     = memo.vehicleHire   || 0;
    const ioHamaliExpense = io.ioHamaliExpense || 0;
    const totalExpenses   = dailyExpenses + salaryAdvances + hamaliExpense + crossingExpense + memoAdvance + vehicleHire + ioHamaliExpense;

    const netPL   = totalIncome - totalExpenses;
    const opening = runningBalance;
    const closing = opening + netPL;
    runningBalance = closing;

    result.set(d, {
      date: d,
      deliveryGross, kasarTotal, deliveryIncome,
      paidLrIncome, serviceChargeIncome, demurrageIncome, totalIncome,
      dailyExpenses, salaryAdvances, hamaliExpense, crossingExpense, memoAdvance, vehicleHire, ioHamaliExpense, totalExpenses,
      netPL, openingBalance: opening, closingBalance: closing,
      income: totalIncome, expense: totalExpenses, closing,
    });
  }

  return result;
}

export function shiftDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function dateRange(from, to) {
  const dates = [];
  const cur   = new Date(from + "T00:00:00Z");
  const end   = new Date(to   + "T00:00:00Z");
  while (cur <= end) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}
