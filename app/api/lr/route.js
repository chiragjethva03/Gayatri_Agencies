// THESE TWO LINES ARE CRITICAL
import connectDB from "@/lib/mongodb";
import LR from "@/models/LR";

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
    query.lrDate = {
      $gte: fromDate, 
      $lte: toDate    
    };
  }

  const lrs = await LR.find(query).sort({ createdAt: -1 });
  return Response.json(lrs);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();

  const lastEntry = await LR.findOne({ transportSlug: data.transportSlug }).sort({ createdAt: -1 });
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

// NEW: Added PUT method for updating existing records!
export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  
  // Separate the ID from the rest of the data we want to update
  const { _id, ...updateData } = data;

  if (!_id) {
    return Response.json({ error: "ID is required for updating" }, { status: 400 });
  }

  // Find the existing LR by ID and update it
  const updatedLr = await LR.findByIdAndUpdate(_id, updateData, { new: true });
  return Response.json(updatedLr);
}

export async function DELETE(req) {
  await connectDB();
  const { ids } = await req.json();
  await LR.deleteMany({ _id: { $in: ids } });
  return Response.json({ success: true });
}