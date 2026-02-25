import connectDB from "@/lib/mongodb";
import Memo from "@/models/Memo";

export async function GET(req) {
  await connectDB();
  
  const { searchParams } = new URL(req.url);
  const transportSlug = searchParams.get("transport"); // NEW: Get transport name from URL
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  let query = {};
  
  // NEW: Only fetch Memos that belong to this specific transport
  if (transportSlug) {
    query.transportSlug = transportSlug; 
  }

  if (fromDate && toDate) {
    query.date = { $gte: fromDate, $lte: toDate };
  }

  const memos = await Memo.find(query).sort({ createdAt: -1 });
  return Response.json(memos);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();

  // NEW: Find the last Memo specifically for THIS transport
  const lastEntry = await Memo.findOne({ transportSlug: data.transportSlug }).sort({ createdAt: -1 });
  
  let nextNo = 1000; // Change to 1 if your memos start at 1
  if (lastEntry && lastEntry.memoNo) {
    const lastVal = parseInt(lastEntry.memoNo);
    if (!isNaN(lastVal)) {
      nextNo = lastVal + 1;
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
  const { ids } = await req.json();
  await Memo.deleteMany({ _id: { $in: ids } });
  return Response.json({ success: true });
}