export const dynamic = "force-dynamic";

import { computeAnalytics } from "@/lib/computeAnalytics";

// GET /api/dashboard/analytics?transport=slug|all&period=week|month|6month|year
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const transport = searchParams.get("transport") || "all";
  const period    = searchParams.get("period")    || "month";

  try {
    const data = await computeAnalytics(transport, period);
    return Response.json(data);
  } catch (err) {
    console.error("Analytics GET error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
