/**
 * GET /api/me
 * Returns the current user's role so client components can read it.
 * The role is forwarded by middleware via the x-user-role header.
 */
export async function GET(req) {
  const role = req.headers.get("x-user-role") || "admin";
  return Response.json({ role });
}
