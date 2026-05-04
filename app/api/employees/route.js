import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find({ isActive: true }).sort({ name: 1 });
    return Response.json(employees);
  } catch (err) {
    console.error("GET /api/employees", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const employee = await Employee.create(data);
    return Response.json(employee);
  } catch (err) {
    console.error("POST /api/employees", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const { _id, ...data } = await req.json();
    if (!_id) return Response.json({ error: "_id required" }, { status: 400 });
    const updated = await Employee.findByIdAndUpdate(_id, data, { new: true });
    return Response.json(updated);
  } catch (err) {
    console.error("PUT /api/employees", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "id required" }, { status: 400 });
    await Employee.findByIdAndUpdate(id, { isActive: false });
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/employees", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
