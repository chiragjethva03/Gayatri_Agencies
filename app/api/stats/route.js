import connectDB from "@/lib/mongodb";
import LR from "@/models/LR";
import Memo from "@/models/Memo";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const transportSlug = searchParams.get("transport");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  try {
    if (transportSlug) {
      // SCENARIO 1: Inner Dashboard (Colorful Boxes) — today only
      const lrCount = await LR.countDocuments({ transportSlug, createdAt: { $gte: startOfToday } });
      const memoCount = await Memo.countDocuments({ transportSlug, createdAt: { $gte: startOfToday } });
      return Response.json({ lrCount, memoCount });
    } else {
      // SCENARIO 2: Main Dashboard (White Cards) — today only

      // 1. Group LRs created today
      const lrStats = await LR.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: "$transportSlug", count: { $sum: 1 } } }
      ]);

      // 2. Group Memos created today
      const memoStats = await Memo.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: "$transportSlug", count: { $sum: 1 } } }
      ]);

      // 3. Combine them into one master object map
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