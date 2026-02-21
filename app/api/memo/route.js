import connectDB from "@/lib/mongodb";
import Memo from "@/models/Memo";

export async function GET(req) {
  await connectDB();
  
  // 1. Get the URL parameters
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // 2. Build the query filter for MongoDB
  let query = {};
  if (from && to) {
    // Because your dates are saved as strings like "2026-02-20", 
    // MongoDB can easily compare them alphabetically!
    query.date = { 
      $gte: from, // Greater than or equal to 'from' date
      $lte: to    // Less than or equal to 'to' date
    };
  }

  // 3. Fetch with the filter applied
  const memos = await Memo.find(query).sort({ createdAt: -1 });
  return Response.json(memos);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();

 // Auto-generate Memo No 
  const lastEntry = await Memo.findOne().sort({ createdAt: -1 });
  let nextNo = 1000; // Start at 1000 by default
  
  if (lastEntry && lastEntry.memoNo) {
    const lastVal = parseInt(lastEntry.memoNo);
    if (!isNaN(lastVal)) {
      // If the last value + 1 is less than 1000, force it to 1000. 
      // Otherwise, just use the last value + 1.
      nextNo = Math.max(1000, lastVal + 1);
    }
  }
  const newEntry = {
    ...data,
    memoNo: data.memoNo || nextNo.toString(),
    date: data.date || new Date().toISOString().split("T")[0],
  };

  const memo = await Memo.create(newEntry);
  return Response.json(memo);
}
export async function DELETE(req) {
  await connectDB();
  
  try {
    const { ids } = await req.json(); // Get the array of IDs to delete
    
    // Tell MongoDB to delete all memos whose _id is in that array
    await Memo.deleteMany({ _id: { $in: ids } });
    
    return Response.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}