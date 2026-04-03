import connectDB from "@/lib/mongodb";
import Memo from "@/models/Memo";

export async function GET(req) {
  await connectDB();
  
  const { searchParams } = new URL(req.url);
  const transportSlug = searchParams.get("transport"); 
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  let query = {};
  
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

  const lastEntry = await Memo.findOne({ transportSlug: data.transportSlug }).sort({ createdAt: -1 });
  
  let nextNo = 1000; 
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

// --- NEW: Added PUT method for Editing Memos! ---
export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  const { _id, ...updateData } = data;

  if (!_id) {
    return Response.json({ error: "ID is required for updating" }, { status: 400 });
  }

  const updatedMemo = await Memo.findByIdAndUpdate(_id, updateData, { new: true });
  return Response.json(updatedMemo);
}

export async function DELETE(req) {
  await connectDB();
  const { ids } = await req.json();
  await Memo.deleteMany({ _id: { $in: ids } });
  return Response.json({ success: true });
} 