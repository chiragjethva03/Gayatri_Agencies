import connectDB from "@/lib/mongodb";
import LR from "@/models/LR";

export async function GET(req) {
  await connectDB();
  
  // NEW: Get the URL parameters
  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  // NEW: Build the database query
  let query = {};
  
  if (fromDate && toDate) {
    query.lrDate = {
      $gte: fromDate, // Greater than or equal to
      $lte: toDate    // Less than or equal to
    };
  }

  // Pass the query to MongoDB
  const lrs = await LR.find(query).sort({ createdAt: -1 });
  return Response.json(lrs);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();

  const lastEntry = await LR.findOne().sort({ createdAt: -1 });
  let nextNo = 1000;
  if (lastEntry && lastEntry.lrNo) {
    const lastVal = parseInt(lastEntry.lrNo);
    if (!isNaN(lastVal)) {
      nextNo = lastVal + 1;
    }
  }
  const autoLrNo = nextNo.toString();
  const todayDate = new Date().toISOString().split("T")[0];

  const newEntry = {
    ...data,
    lrNo: data.lrNo || autoLrNo,
    lrDate: data.lrDate || todayDate,
  };

  const lr = await LR.create(newEntry);
  return Response.json(lr);
}

export async function DELETE(req) {
  await connectDB();
  const { ids } = await req.json();
  await LR.deleteMany({ _id: { $in: ids } });
  return Response.json({ success: true });
}