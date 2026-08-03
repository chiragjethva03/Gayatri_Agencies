import { signTrackToken } from "@/lib/trackToken";

export async function POST(req) {
  const role = req.headers.get("x-user-role");
  if (!role || role === "demo") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, consignor, consignee, fromDate, expiryDays } = await req.json();
  if (!slug) return Response.json({ error: "slug is required" }, { status: 400 });

  const token = await signTrackToken({
    slug,
    consignor: consignor || "",
    consignee: consignee || "",
    fromDate:  fromDate  || "",
    expiryDays: Number(expiryDays) || 30,
  });

  return Response.json({ token });
}
