import connectDB from "@/lib/mongodb";
import AccountTransaction from "@/models/AccountTransaction";
import { isDemoUser, demoForbidden, demoGuard } from "@/lib/demoGuard";

export async function GET(req) {
  if (isDemoUser(req)) return demoForbidden();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const accountName = searchParams.get("accountName");

  const query = accountName ? { accountName } : {};
  const txns = await AccountTransaction.find(query).sort({ date: -1, createdAt: -1 });
  return Response.json(txns);
}

export async function POST(req) {
  const guard = demoGuard(req); if (guard) return guard;
  await connectDB();
  const { accountName, amount, description, date } = await req.json();

  if (!accountName || !amount || !date) {
    return Response.json({ error: "accountName, amount and date are required." }, { status: 400 });
  }

  const txn = await AccountTransaction.create({ accountName, amount: Number(amount), description: description || "", date });
  return Response.json(txn, { status: 201 });
}

export async function DELETE(req) {
  const guard = demoGuard(req); if (guard) return guard;
  await connectDB();
  const { id } = await req.json();
  if (!id) return Response.json({ error: "id is required." }, { status: 400 });
  await AccountTransaction.findByIdAndDelete(id);
  return Response.json({ success: true });
}
