export async function POST(req) {
  const { password } = await req.json();
  const correct = process.env.ACCOUNTS_LOCK_PASSWORD;

  if (!correct) {
    return Response.json(
      { success: false, error: "ACCOUNTS_LOCK_PASSWORD not set in environment." },
      { status: 500 }
    );
  }

  if (password === correct) {
    return Response.json({ success: true });
  }

  return Response.json(
    { success: false, error: "Incorrect password." },
    { status: 401 }
  );
}
