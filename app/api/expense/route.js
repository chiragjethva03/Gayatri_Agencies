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
  const expense = await Expense.create(data);
  return Response.json(expense);
}

export async function PUT(req) {
  await connectDB();
  const data = await req.json();
  const { _id, ...updateData } = data;

  if (!_id) return Response.json({ error: "ID required" }, { status: 400 });

  const updatedExpense = await Expense.findByIdAndUpdate(_id, updateData, { new: true });
  return Response.json(updatedExpense);
}

export async function DELETE(req) {
  await connectDB();
  const { ids } = await req.json();
  await Expense.deleteMany({ _id: { $in: ids } });
  return Response.json({ success: true });
}