export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { calcSnapshot } from "@/lib/calcDailySnapshot";
import DailySnapshot from "@/models/DailySnapshot";
import Transport from "@/models/Transport";

// 30s cache — all concurrent requests share one DB result instead of each firing their own
const summaryCache = new Map();
const CACHE_TTL = 30_000;
function getCached(key) {
  const e = summaryCache.get(key);
  return e && Date.now() - e.ts < CACHE_TTL ? e.data : null;
}
function setCached(key, data) { summaryCache.set(key, { data, ts: Date.now() }); }

async function getAllSlugs() {
  const ts = await Transport.find({}).lean();
  return ts.map(t => ({ slug: t.name.toLowerCase().replace(/\s+/g, "-"), name: t.name }));
}

async function snapLive(slug, name, dateStr) {
  const data = await calcSnapshot(slug, dateStr);
  return { transportSlug: slug, transportName: name, date: dateStr, ...data };
}

async function snapCached(slug, name, dateStr) {
  const c = await DailySnapshot.findOne({ transportSlug: slug, date: dateStr }).lean();
  return c ?? snapLive(slug, name, dateStr);
}

// GET /api/dashboard/summary?transport=all|slug
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const transport = searchParams.get("transport") || "all";

  const cached = getCached(transport);
  if (cached) return Response.json(cached);

  await connectDB();

  try {
    const today = new Date().toISOString().split("T")[0];
    const yd    = new Date(); yd.setDate(yd.getDate() - 1);
    const yesterday = yd.toISOString().split("T")[0];

    const allSlugs = await getAllSlugs();
    const slugs    = transport === "all"
      ? allSlugs
      : allSlugs.filter(s => s.slug === transport).slice(0, 1)
          .map(s => s) || [{ slug: transport, name: transport }];

    // Today: live calc always for freshness
    const todaySnaps = await Promise.all(slugs.map(({ slug, name }) => snapLive(slug, name, today)));
    // Yesterday: from cache or calc
    const ydSnaps    = await Promise.all(slugs.map(({ slug, name }) => snapCached(slug, name, yesterday)));

    function sum(snaps, field) { return snaps.reduce((a, s) => a + (s[field] || 0), 0); }
    function pct(cur, prev) { return prev ? +(((cur - prev) / prev) * 100).toFixed(1) : 0; }

    const todayIncome   = sum(todaySnaps, "totalIncome");
    const todayExpenses = sum(todaySnaps, "totalExpenses");
    const todayNetPL    = sum(todaySnaps, "netPL");
    const todayClosing  = sum(todaySnaps, "closingBalance");
    const todayOpening  = sum(todaySnaps, "openingBalance");
    const ydIncome      = sum(ydSnaps, "totalIncome");
    const ydExpenses    = sum(ydSnaps, "totalExpenses");
    const ydNetPL       = sum(ydSnaps, "netPL");
    const ydClosing     = sum(ydSnaps, "closingBalance");

    // Best transport today
    const best = todaySnaps.reduce((a, b) => (b.closingBalance > a.closingBalance ? b : a), todaySnaps[0] || {});

    // Negative closing alert
    const negativeTransports = todaySnaps.filter(s => s.closingBalance < 0);

    // Per-transport rows with vs-yesterday comparison
    const transportRows = todaySnaps.map((s, i) => {
      const yd = ydSnaps[i];
      return {
        ...s,
        ydClosing: yd?.closingBalance || 0,
        vsYesterdayAmt: (s.closingBalance || 0) - (yd?.closingBalance || 0),
        vsYesterdayPct: pct(s.closingBalance, yd?.closingBalance),
      };
    });

    const result = {
      today,
      kpi: {
        totalIncome:    { value: todayIncome,   vsYesterday: pct(todayIncome,   ydIncome)   },
        totalExpenses:  { value: todayExpenses, vsYesterday: pct(todayExpenses, ydExpenses) },
        netPL:          { value: todayNetPL,    vsYesterday: pct(todayNetPL,    ydNetPL)    },
        closingBalance: { value: todayClosing,  openingBalance: todayOpening               },
        activeTransports: { value: slugs.length },
        bestTransport: { name: best?.transportName || "—", closing: best?.closingBalance || 0 },
        ydClosing: { value: ydClosing, vsYesterday: pct(todayClosing, ydClosing) },
      },
      transportRows,
      negativeTransports: negativeTransports.map(s => s.transportName),
    };
    setCached(transport, result);
    return Response.json(result);
  } catch (err) {
    console.error("Summary GET error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
