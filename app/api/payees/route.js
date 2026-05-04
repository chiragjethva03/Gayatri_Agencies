import connectDB from "@/lib/mongodb";
import Payee from "@/models/Payee";

const DEFAULT_PAYEES = ["Sarthak", "Mehul"];

export async function GET() {
  await connectDB();

  let payees = await Payee.find().sort({ createdAt: 1 });

  if (payees.length === 0) {
    await Payee.insertMany(DEFAULT_PAYEES.map(name => ({ name })));
    payees = await Payee.find().sort({ createdAt: 1 });
  }

  return Response.json(payees);
}

export async function POST(req) {
  await connectDB();
  const { name } = await req.json();

  if (!name || !name.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const existing = await Payee.findOne({ name: name.trim() });
  if (existing) {
    return Response.json(existing);
  }

  const payee = await Payee.create({ name: name.trim() });
  return Response.json(payee);
}
