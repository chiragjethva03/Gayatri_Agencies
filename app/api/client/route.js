import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const clients = await Client.find({}).sort({ name: 1 });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    if (!data.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const existing = await Client.findOne({ name: data.name });
    if (existing) return NextResponse.json({ error: "Client with this name already exists" }, { status: 409 });

    const newClient = await Client.create(data);
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    if (error.code === 11000) return NextResponse.json({ error: "Client name already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create data" }, { status: 500 });
  }
}

// NEW: PUT method to update existing clients
export async function PUT(req) {
  try {
    await connectDB();
    const data = await req.json();

    if (!data._id) return NextResponse.json({ error: "Client ID is required for update" }, { status: 400 });

    // Find the client by ID and update it with the new data
    const updatedClient = await Client.findByIdAndUpdate(data._id, data, { new: true });
    
    if (!updatedClient) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error("Failed to update client:", error);
    if (error.code === 11000) return NextResponse.json({ error: "Client name already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
  }
}