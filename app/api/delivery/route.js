import connectDB from "@/lib/mongodb";
import Delivery from "@/models/Delivery";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const transportSlug = searchParams.get("transport");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    let query = {};
    if (transportSlug) query.transportSlug = transportSlug;
    if (fromDate && toDate) query.date = { $gte: fromDate, $lte: toDate };

    const deliveries = await Delivery.find(query).sort({ createdAt: -1 });
    return NextResponse.json(deliveries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    const lastEntry = await Delivery.findOne({ transportSlug: data.transportSlug }).sort({ createdAt: -1 });
    let nextNo = 1;
    if (lastEntry && lastEntry.dNo) {
      const lastVal = parseInt(lastEntry.dNo);
      if (!isNaN(lastVal)) nextNo = lastVal + 1;
    }

    const newDelivery = await Delivery.create({
      ...data,
      dNo: data.dNo || nextNo.toString(),
    });

    return NextResponse.json(newDelivery, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create delivery" }, { status: 500 });
  }
}

// --- NEW: Added PUT method for EDITING ---
export async function PUT(req) {
  try {
    await connectDB();
    const data = await req.json();
    const { _id, ...updateData } = data;

    if (!_id) return NextResponse.json({ error: "ID is required for update" }, { status: 400 });

    const updatedDelivery = await Delivery.findByIdAndUpdate(_id, updateData, { new: true });
    if (!updatedDelivery) return NextResponse.json({ error: "Delivery not found" }, { status: 404 });

    return NextResponse.json(updatedDelivery, { status: 200 });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Failed to update delivery" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { ids } = await req.json();
    await Delivery.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}