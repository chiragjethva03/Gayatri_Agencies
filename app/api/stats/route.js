import connectDB from "@/lib/mongodb";
import LR from "@/models/LR";
import Memo from "@/models/Memo";
import InwardOutward from "@/models/InwardOutward";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const transportSlug = searchParams.get("transport");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  try {
    if (transportSlug) {
      // SCENARIO 1: Inner Dashboard (Colorful Boxes) — today only
      const [lrCount, memoCount, inwardOutwardCount] = await Promise.all([
        LR.countDocuments({ transportSlug, createdAt: { $gte: startOfToday } }),
        Memo.countDocuments({ transportSlug, createdAt: { $gte: startOfToday } }),
        InwardOutward.countDocuments({ transportSlug, createdAt: { $gte: startOfToday } }),
      ]);
      return Response.json({ lrCount, memoCount, inwardOutwardCount });
    } else {
      // SCENARIO 2: Main Dashboard (White Cards) — today only
      const [lrStats, memoStats] = await Promise.all([
        LR.aggregate([
          { $match: { createdAt: { $gte: startOfToday } } },
          { $group: { _id: "$transportSlug", count: { $sum: 1 } } }
        ]),
        Memo.aggregate([
          { $match: { createdAt: { $gte: startOfToday } } },
          { $group: { _id: "$transportSlug", count: { $sum: 1 } } }
        ]),
      ]);

      const combinedCountsMap = {};

      lrStats.forEach(stat => {
        if (stat._id) {
          if (!combinedCountsMap[stat._id]) combinedCountsMap[stat._id] = { lrCount: 0, memoCount: 0 };
          combinedCountsMap[stat._id].lrCount = stat.count;
        }
      });

      memoStats.forEach(stat => {
        if (stat._id) {
          if (!combinedCountsMap[stat._id]) combinedCountsMap[stat._id] = { lrCount: 0, memoCount: 0 };
          combinedCountsMap[stat._id].memoCount = stat.count;
        }
      });

      return Response.json(combinedCountsMap);
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}