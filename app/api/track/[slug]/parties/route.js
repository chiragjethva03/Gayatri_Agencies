import connectDB from "@/lib/mongodb";
import LR from "@/models/LR";

export async function GET(req, { params }) {
  const { slug } = await params;

  await connectDB();

  const results = await LR.find(
    { transportSlug: slug, freightBy: { $regex: /^to\s*pay$/i } },
    { consignor: 1, consignee: 1, _id: 0 }
  ).lean();

  const consignors = [...new Set(results.map(r => r.consignor).filter(Boolean))].sort();
  const consignees = [...new Set(results.map(r => r.consignee).filter(Boolean))].sort();

  return Response.json({ consignors, consignees });
}
