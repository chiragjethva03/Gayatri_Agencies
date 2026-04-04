import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InwardOutward from "@/models/InwardOutward";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const transportSlug = url.searchParams.get("transport");
    
    const records = await InwardOutward.find(transportSlug ? { transportSlug } : {}).sort({ createdAt: -1 });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    
    // Auto-generate No. if not provided
    if (!data.no) {
      const count = await InwardOutward.countDocuments({ transportSlug: data.transportSlug });
      data.no = `${data.type === 'Inward' ? 'INW' : 'OUT'}-${1000 + count + 1}`;
    }

    const newRecord = await InwardOutward.create(data);
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const data = await req.json();
    const updatedRecord = await InwardOutward.findByIdAndUpdate(data._id, data, { new: true });
    return NextResponse.json(updatedRecord);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { ids } = await req.json();
    await InwardOutward.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}