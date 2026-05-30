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

    // Duplicate LR No check within the same transport
    if (data.lrNo && data.lrNo.trim()) {
      const exists = await InwardOutward.findOne({
        transportSlug: data.transportSlug,
        lrNo: data.lrNo.trim(),
      });
      if (exists) {
        return NextResponse.json({ error: `LR No. "${data.lrNo}" already exists for this transport.` }, { status: 409 });
      }
    }

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

    // Duplicate LR No check (exclude the record being updated)
    if (data.lrNo && data.lrNo.trim()) {
      const exists = await InwardOutward.findOne({
        transportSlug: data.transportSlug,
        lrNo: data.lrNo.trim(),
        _id: { $ne: data._id },
      });
      if (exists) {
        return NextResponse.json({ error: `LR No. "${data.lrNo}" already exists for this transport.` }, { status: 409 });
      }
    }

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