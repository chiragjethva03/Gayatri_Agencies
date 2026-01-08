import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transport from "@/models/Transport";

export async function GET(req, { params }) {
  try {
    // 1️⃣ Get slug safely (params OR URL fallback)
    let slug = params?.slug;

    if (!slug) {
      const pathname = req.nextUrl.pathname; 
      // /api/transports/somnath-transport
      slug = pathname.split("/").pop();
    }

    if (!slug) {
      return NextResponse.json(
        { message: "Slug missing (unable to resolve)" },
        { status: 400 }
      );
    }

    await connectDB();

    // 2️⃣ Normalize slug
    const normalizedSlug = slug.toLowerCase().replace(/-/g, " ").trim();

    // 3️⃣ Fetch transports
    const transports = await Transport.find({}).lean();

    // 4️⃣ Match transport name
    const transport = transports.find(
      (t) => t.name?.toLowerCase().trim() === normalizedSlug
    );

    if (!transport) {
      return NextResponse.json(
        {
          message: "Transport not found",
          searched: normalizedSlug,
          available: transports.map((t) => t.name),
        },
        { status: 404 }
      );
    }

    return NextResponse.json(transport, { status: 200 });
  } catch (error) {
    console.error("❌ Transport API error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
