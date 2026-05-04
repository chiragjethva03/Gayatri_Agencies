import connectDB from "@/lib/mongodb";
import SalaryAdvance from "@/models/SalaryAdvance";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const month      = Number(searchParams.get("month"));
  const year       = Number(searchParams.get("year"));

  // Single employee — list of advances
  if (employeeId && month && year) {
    const advances = await SalaryAdvance.find({ employeeId, month, year }).sort({ date: -1 });
    return Response.json(advances);
  }

  // All employees for month/year — return { employeeId: totalAmount }
  if (month && year) {
    const advances = await SalaryAdvance.find({ month, year });
    const summary = {};
    advances.forEach(a => {
      const id = a.employeeId.toString();
      summary[id] = (summary[id] || 0) + a.amount;
    });
    return Response.json(summary);
  }

  return Response.json({ error: "month and year required" }, { status: 400 });
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const advance = await SalaryAdvance.create(data);
  return Response.json(advance);
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await SalaryAdvance.findByIdAndDelete(id);
  return Response.json({ success: true });
}
