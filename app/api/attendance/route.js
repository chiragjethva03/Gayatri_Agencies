import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const month      = Number(searchParams.get("month"));
  const year       = Number(searchParams.get("year"));

  // Single employee — return full record
  if (employeeId && month && year) {
    const record = await Attendance.findOne({ employeeId, month, year });
    return Response.json(record || { records: [] });
  }

  // All employees for month/year
  if (month && year) {
    const docs = await Attendance.find({ month, year });
    const result = docs.map(d => ({
      employeeId: d.employeeId.toString(),
      records: d.records,
    }));
    return Response.json(result);
  }

  return Response.json({ error: "month and year required" }, { status: 400 });
}

export async function POST(req) {
  await connectDB();
  const { employeeId, month, year, records } = await req.json();
  const doc = await Attendance.findOneAndUpdate(
    { employeeId, month, year },
    { employeeId, month, year, records },
    { upsert: true, new: true }
  );
  return Response.json(doc);
}
