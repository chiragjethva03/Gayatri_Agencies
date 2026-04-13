// THESE TWO LINES ARE CRITICAL
import connectDB from "@/lib/mongodb";
import LR from "@/models/LR";
import Transport from "@/models/Transport"; // --- NEW: Added Transport Import! ---

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

  // 1. Fetch Transport to get the unique transportCode
  const transports = await Transport.find();
  const cleanSlug = data.transportSlug ? data.transportSlug.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const currentTransport = transports.find(t => 
    t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSlug
  );

  // 2. Extract Prefix (First 2 letters, uppercase)
  let prefix = "LR"; // Fallback just in case
  if (currentTransport && currentTransport.transportCode) {
    prefix = currentTransport.transportCode.substring(0, 2).toUpperCase();
  }

  // 3. Find the last LR for THIS transport that starts with THIS prefix
  const lastEntry = await LR.findOne({ 
    transportSlug: data.transportSlug,
    lrNo: { $regex: `^${prefix}`, $options: "i" } // Only look for LRs with this exact prefix!
  }).sort({ createdAt: -1 });

  let nextNum = 1;
  
  if (lastEntry && lastEntry.lrNo) {
    // Extract the digits at the end of the last LR string
    const match = lastEntry.lrNo.match(/\d+$/);
    if (match) {
      nextNum = parseInt(match[0], 10) + 1;
    }
  }

  // 4. Pad the number (e.g., 1 becomes "01", 12 stays "12")
  const paddedNum = nextNum < 10 ? `0${nextNum}` : nextNum.toString();
  const autoLrNo = `${prefix}${paddedNum}`;

  const todayDate = new Date().toISOString().split("T")[0];

  const newEntry = {
    ...data,
    lrNo: data.lrNo || autoLrNo, // Uses the custom generated prefix LR No!
    lrDate: data.lrDate || todayDate,
  };

  const lr = await LR.create(newEntry);
  return Response.json(lr);
}

export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  
  const { _id, ...updateData } = data;

  if (!_id) {
    return Response.json({ error: "ID is required for updating" }, { status: 400 });
  }

  const updatedLr = await LR.findByIdAndUpdate(_id, updateData, { new: true });
  return Response.json(updatedLr);
}

export async function DELETE(req) {
  await connectDB();
  const { ids } = await req.json();
  await LR.deleteMany({ _id: { $in: ids } });
  return Response.json({ success: true });
}