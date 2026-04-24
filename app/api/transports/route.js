import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transport from "@/models/Transport";

export async function POST(req) {
  try {
    const { name, locations, gstNo, mobileNumbers, transportCode, address, jurisdictionCity, defaultDemurrageRate, defaultDemurrageFreeDays } = await req.json();
    if (!name || !locations || locations.length === 0) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }
    await connectDB();
    const transport = await Transport.create({
      name, locations, gstNo, mobileNumbers, transportCode, address, jurisdictionCity, defaultDemurrageRate: defaultDemurrageRate || 0,
      defaultDemurrageFreeDays: defaultDemurrageFreeDays || 7,
    });
    return NextResponse.json(transport, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const transports = await Transport.find().sort({ createdAt: -1 });
    return NextResponse.json(transports, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (body.transportId && body.newLocation) {
      const updated = await Transport.findByIdAndUpdate(
        body.transportId,
        { $addToSet: { locations: body.newLocation } },
        { new: true }
      );
      if (!updated) return NextResponse.json({ message: "Transport not found" }, { status: 404 });
      return NextResponse.json(updated, { status: 200 });
    }

    if (body.transportId && body.newPackaging) {
      const updated = await Transport.findByIdAndUpdate(
        body.transportId,
        { $addToSet: { packagingTypes: body.newPackaging } },
        { new: true }
      );
      if (!updated) return NextResponse.json({ message: "Transport not found" }, { status: 404 });
      return NextResponse.json(updated, { status: 200 });
    }

    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { ids } = await req.json();
    if (!ids || ids.length === 0) {
      return NextResponse.json({ message: "No IDs provided" }, { status: 400 });
    }
    await Transport.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}