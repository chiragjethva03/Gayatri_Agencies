import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const transportSlug = searchParams.get("transport"); 
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  let query = {};
  if (transportSlug) query.transportSlug = transportSlug; 
  if (fromDate && toDate) query.date = { $gte: fromDate, $lte: toDate };

  const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });
  return Response.json(expenses);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const isPaid = data.status === "Paid";
  const expense = await Expense.create({ ...data, isLocked: isPaid });
  return Response.json(expense);
}

export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  const { _id } = data;

  if (!_id) return Response.json({ error: "ID required" }, { status: 400 });

  const fields = {
    date: data.date,
    payerName: data.payerName,
    payeeName: data.payeeName,
    amount: data.amount,
    paymentMode: data.paymentMode,
    narration: data.narration,
    status: data.status,
    transportSlug: data.transportSlug,
    isLocked: data.status === "Paid" ? true : (data.isLocked ?? false),
  };

  const updatedExpense = await Expense.findByIdAndUpdate(
    _id,
    { $set: fields },
    { new: true }
  );
  return Response.json(updatedExpense);
}

export async function DELETE(req) {
  await connectDB();
  const { ids } = await req.json();
  await Expense.deleteMany({ _id: { $in: ids } });
  return Response.json({ success: true });
}