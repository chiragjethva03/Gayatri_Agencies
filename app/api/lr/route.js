import connectDB from "@/lib/mongodb";
import LR from "@/models/LR";
import Transport from "@/models/Transport";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const transportSlug = searchParams.get("transport");

  // Live duplicate check — returns { exists: true/false }
  const checkLrNo = searchParams.get("checkLrNo");
  if (checkLrNo && transportSlug) {
    const exists = await LR.findOne({ transportSlug, lrNo: checkLrNo.trim() });
    return Response.json({ exists: !!exists });
  }

  const showAll = searchParams.get("all") === "true";
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  let query = {};
  if (transportSlug) query.transportSlug = transportSlug;

  if (!showAll) {
    const today = new Date().toISOString().split("T")[0];
    query.lrDate = { $gte: fromParam || today, $lte: toParam || today };
  }

  const lrs = await LR.find(query).sort({ createdAt: -1 });
  return Response.json(lrs);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();

  // 1. Get transport prefix
  const transports = await Transport.find();
  const cleanSlug = data.transportSlug
    ? data.transportSlug.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";
  const currentTransport = transports.find(
    (t) => t.name.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanSlug
  );

  let prefix = "LR";
  if (currentTransport?.transportCode) {
    prefix = currentTransport.transportCode.substring(0, 2).toUpperCase();
  }

  // 2. Find the highest existing number for this prefix (safer than last-by-date)
  const allWithPrefix = await LR.find({
    transportSlug: data.transportSlug,
    lrNo: { $regex: `^${prefix}`, $options: "i" },
  }).select("lrNo");

  let maxNum = 0;
  for (const lr of allWithPrefix) {
    const match = lr.lrNo.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  const nextNum = maxNum + 1;
  const paddedNum = nextNum < 10 ? `0${nextNum}` : nextNum.toString();
  const autoLrNo = `${prefix}${paddedNum}`;

  const lrNoToUse = data.lrNo?.trim() ? data.lrNo.trim() : autoLrNo;

  // 3. Duplicate guard
  const duplicate = await LR.findOne({ transportSlug: data.transportSlug, lrNo: lrNoToUse });
  if (duplicate) {
    return Response.json(
      { error: "duplicate", message: `LR No. "${lrNoToUse}" already exists for this transport.` },
      { status: 409 }
    );
  }

  const todayDate = new Date().toISOString().split("T")[0];
  const lr = await LR.create({
    ...data,
    lrNo: lrNoToUse,
    lrDate: data.lrDate || todayDate,
  });

  return Response.json(lr);
}

export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  const { _id, ...updateData } = data;

  if (!_id) {
    return Response.json({ error: "ID is required for updating" }, { status: 400 });
  }

  if (updateData.paymentStatus === "Paid") updateData.isLocked = true;
  else if (updateData.paymentStatus === "Pending") updateData.isLocked = false;

  const updatedLr = await LR.findByIdAndUpdate(
    _id,
    { $set: updateData },
    { new: true, strict: false }
  );
  return Response.json(updatedLr);
}

export async function DELETE(req) {
  await connectDB();
  const { ids } = await req.json();
  await LR.deleteMany({ _id: { $in: ids } });
  return Response.json({ success: true });
}
