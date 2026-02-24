import connectDB from "@/lib/mongodb";
import LR from "@/models/LR";
import Memo from "@/models/Memo";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const transportSlug = searchParams.get("transport");

  try {
    if (transportSlug) {
      // SCENARIO 1: Inner Dashboard (Colorful Boxes)
      const lrCount = await LR.countDocuments({ transportSlug });
      const memoCount = await Memo.countDocuments({ transportSlug });
      
      return Response.json({ lrCount, memoCount });
    } else {
      // SCENARIO 2: Main Dashboard (White Cards)
      
      // 1. Group LRs
      const lrStats = await LR.aggregate([
        { $group: { _id: "$transportSlug", count: { $sum: 1 } } }
      ]);

      // 2. Group Memos
      const memoStats = await Memo.aggregate([
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