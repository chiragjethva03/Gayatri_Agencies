import connectDB from "@/lib/mongodb";
import Good from "@/models/Good";

export async function GET() {
  await connectDB();
  const goods = await Good.find().sort({ name: 1 });
  return Response.json(goods);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const good = await Good.create(data);
  return Response.json(good);
}

export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  const { _id, ...updateData } = data;
  
  if (!_id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  const updatedGood = await Good.findByIdAndUpdate(_id, updateData, { new: true });
  return Response.json(updatedGood);
}