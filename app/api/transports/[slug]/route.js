import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transport from "@/models/Transport";

export async function GET(req, { params }) {
  try {
     const resolvedParams = await params;
    let slug = params?.slug;
    if (!slug) {
      const pathname = req.nextUrl.pathname;
      slug = pathname.split("/").pop();
    }
    if (!slug) {
      return NextResponse.json({ message: "Slug missing" }, { status: 400 });
    }
    await connectDB();
    const normalizedSlug = slug.toLowerCase().replace(/-/g, " ").trim();
    const transports = await Transport.find({}).lean();
    const transport = transports.find(
      (t) => t.name?.toLowerCase().trim() === normalizedSlug
    );
    if (!transport) {
      return NextResponse.json({ message: "Transport not found" }, { status: 404 });
    }
    return NextResponse.json(transport, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const { slug } = await params; // AWAIT PARAMS

    const updated = await Transport.findByIdAndUpdate(
      slug,
      { $set: body },
      { new: true }
    );

    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}