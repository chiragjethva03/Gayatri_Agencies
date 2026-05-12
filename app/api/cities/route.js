import connectDB from "@/lib/mongodb";
import City from "@/models/City";
import Transport from "@/models/Transport";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const [masterCities, transports] = await Promise.all([
      City.find().sort({ city: 1 }).lean(),
      Transport.find({}, "locations").lean(),
    ]);

    // Merge master cities + all transport locations, deduplicated by uppercase key
    const merged = new Map();
    for (const c of masterCities) merged.set(c.city.toUpperCase(), c);
    for (const t of transports) {
      for (const loc of t.locations || []) {
        const locName = typeof loc === "string" ? loc : (loc?.name || "");
        if (!locName) continue;
        const key = locName.toUpperCase();
        if (!merged.has(key)) merged.set(key, { city: locName });
      }
    }

    const allCities = [...merged.values()].sort((a, b) => a.city.localeCompare(b.city));
    return NextResponse.json(allCities, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const existing = await City.findOne({ city: { $regex: new RegExp(`^${data.city}$`, "i") } });
    if (existing) return NextResponse.json({ error: "City already exists" }, { status: 400 });
    const newCity = await City.create(data);
    return NextResponse.json(newCity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create city" }, { status: 500 });
  }
}
