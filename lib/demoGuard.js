/**
 * Server-side helpers for demo-mode access control.
 *
 * The middleware stamps `x-user-role` on every authenticated request,
 * so API routes can read the role without re-verifying the JWT.
 */

/**
 * Returns true when the current request is made by the demo account.
 * @param {Request} req
 */
export function isDemoUser(req) {
  return req.headers.get("x-user-role") === "demo";
}

/**
 * Standard 403 response returned to demo users who hit a write endpoint.
 */
export function demoForbidden() {
  return Response.json(
    { error: "This action is not available in demo mode." },
    { status: 403 }
  );
}

/**
 * Convenience: guard a write operation in one line.
 * Returns a 403 Response if demo, otherwise null (caller continues).
 *
 * Usage:
 *   const guard = demoGuard(req);
 *   if (guard) return guard;
 *
 * @param {Request} req
 * @returns {Response | null}
 */
export function demoGuard(req) {
  return isDemoUser(req) ? demoForbidden() : null;
}
