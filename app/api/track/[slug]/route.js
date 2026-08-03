import connectDB from "@/lib/mongodb";
import LR from "@/models/LR";
import { verifyTrackToken } from "@/lib/trackToken";

export async function GET(req, { params }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const tokenStr = searchParams.get("t");

  if (!tokenStr) {
    return Response.json(
      { error: "Access token required. Please use a valid tracking link." },
      { status: 401 }
    );
  }

  let payload;
  try {
    payload = await verifyTrackToken(tokenStr);
  } catch {
    return Response.json(
      { error: "This link has expired or is invalid. Please contact Gayatri Agency for a new link." },
      { status: 401 }
    );
  }

  if (payload.slug !== slug) {
    return Response.json({ error: "Invalid link." }, { status: 401 });
  }

  const consignorFilter = payload.consignor || "";
  const consigneeFilter = payload.consignee || "";
  const fromParam       = payload.fromDate  || "";

  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(today.getDate() - 7);

  const fromDate = fromParam || defaultFrom.toISOString().split("T")[0];
  const toDate   = today.toISOString().split("T")[0];

  await connectDB();

  const query = {
    transportSlug: slug,
    freightBy:     { $regex: /^to\s*pay$/i },
    lrDate:        { $gte: fromDate, $lte: toDate },
  };

  if (consignorFilter) query.consignor = { $regex: consignorFilter, $options: "i" };
  if (consigneeFilter) query.consignee = { $regex: consigneeFilter, $options: "i" };

  const lrs = await LR.find(query)
    .select("lrNo lrDate consignor consignee fromCity toCity goods -_id")
    .sort({ lrDate: -1, lrNo: -1 });

  const data = lrs.map((lr) => {
    const goodsRows = lr.goods || [];
    return {
      lrNo:        lr.lrNo      || "-",
      date:        lr.lrDate    || "-",
      consignor:   lr.consignor || "-",
      consignee:   lr.consignee || "-",
      fromCity:    lr.fromCity  || "-",
      toCity:      lr.toCity    || "-",
      articles:    goodsRows.reduce((sum, g) => sum + (Number(g.article) || 0), 0),
      packaging:   [...new Set(goodsRows.map(g => g.packaging).filter(Boolean))].join(", ") || "-",
      goodsContain:[...new Set(goodsRows.map(g => g.goodsContain).filter(Boolean))].join(", ") || "-",
    };
  });

  const transportName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return Response.json({
    transportName,
    fromDate,
    toDate,
    consignorFilter,
    consigneeFilter,
    lrs: data,
  });
}
