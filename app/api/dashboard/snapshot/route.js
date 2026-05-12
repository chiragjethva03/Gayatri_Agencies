export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { calcSnapshot, bulkCalcRange, dateRange } from "@/lib/calcDailySnapshot";
import DailySnapshot from "@/models/DailySnapshot";
import Transport from "@/models/Transport";

async function getAllSlugs() {
  const ts = await Transport.find({}).lean();
  return ts.map(t => ({
    slug: t.name.toLowerCase().replace(/\s+/g, "-"),
    name: t.name,
  }));
}

async function getOrCalc(transportSlug, transportName, dateStr) {
  const today = new Date().toISOString().split("T")[0];
  if (dateStr === today) {
    // Always live for today — never serve stale cache
    const data = await calcSnapshot(transportSlug, dateStr);
    return { transportSlug, transportName, date: dateStr, ...data };
  }
  const cached = await DailySnapshot.findOne({ transportSlug, date: dateStr }).lean();
  if (cached) return { ...cached, transportName: cached.transportName || transportName };
  const data = await calcSnapshot(transportSlug, dateStr);
  return { transportSlug, transportName, date: dateStr, ...data };
}

// GET /api/dashboard/snapshot?date=YYYY-MM-DD&transport=all|slug   → single-date table data
// GET /api/dashboard/snapshot?from=...&to=...&transport=slug        → range for drill-down trend
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const transport = searchParams.get("transport") || "all";
  const date      = searchParams.get("date");
  const from      = searchParams.get("from");
  const to        = searchParams.get("to");

  try {
    // ── Range query (used by drill-down sparkline) ───────────────────────────
    if (from && to) {
      const allSlugs = await getAllSlugs();
      const slugs    = transport === "all"
        ? allSlugs.map(s => s.slug)
        : [transport];

      // 5 bulk queries for the entire range — fast regardless of date span
      const map = await bulkCalcRange(slugs, from, to);
      const rows = dateRange(from, to).map(d => {
        const r = map.get(d) || { date: d, income: 0, expense: 0, closing: 0 };
        return { date: d, income: r.income, expense: r.expense, closing: r.closing };
      });
      return Response.json(rows);
    }

    // ── Single-date query (used by transport table) ──────────────────────────
    const targetDate = date || new Date().toISOString().split("T")[0];
    const allSlugs   = await getAllSlugs();

    if (transport === "all") {
      const snaps = await Promise.all(
        allSlugs.map(({ slug, name }) => getOrCalc(slug, name, targetDate))
      );

      const zero = {
        deliveryGross:0, kasarTotal:0, deliveryIncome:0,
        paidLrIncome:0, demurrageIncome:0, totalIncome:0,
        dailyExpenses:0, salaryAdvances:0, hamaliExpense:0,
        crossingExpense:0, memoAdvance:0, vehicleHire:0, totalExpenses:0,
        netPL:0, openingBalance:0, closingBalance:0,
      };

      const total = snaps.reduce((acc, s) => {
        Object.keys(zero).forEach(k => { acc[k] = (acc[k] || 0) + (s[k] || 0); });
        return acc;
      }, { ...zero, transportSlug: "__total__", transportName: "TOTAL", date: targetDate });

      return Response.json({ rows: snaps, total });
    }

    // Single transport
    const found = allSlugs.find(s => s.slug === transport);
    const snap  = await getOrCalc(transport, found?.name || transport, targetDate);
    return Response.json({ rows: [snap], total: snap });

  } catch (err) {
    console.error("Snapshot GET error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/dashboard/snapshot → force recalculate & cache
export async function POST(req) {
  await connectDB();
  try {
    const { date, transportSlug } = await req.json();
    const targetDate = date || new Date().toISOString().split("T")[0];
    const allSlugs   = await getAllSlugs();

    const slugs = transportSlug && transportSlug !== "all"
      ? allSlugs.filter(s => s.slug === transportSlug)
      : allSlugs;

    const saved = await Promise.all(slugs.map(async ({ slug, name }) => {
      const data = await calcSnapshot(slug, targetDate);
      return DailySnapshot.findOneAndUpdate(
        { transportSlug: slug, date: targetDate },
        { transportSlug: slug, transportName: name, date: targetDate, ...data },
        { upsert: true, new: true }
      );
    }));

    return Response.json({ success: true, count: saved.length });
  } catch (err) {
    console.error("Snapshot POST error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
