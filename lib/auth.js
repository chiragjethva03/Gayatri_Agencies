// Industry-standard JWT auth using jose — Edge Runtime compatible.
// Middleware, login API, and logout API all import from here.

import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME   = "erp_auth";
export const SESSION_HOURS = 10;
const ISSUER               = "gayatri-erp";
const ALGORITHM            = "HS256";

/** @typedef {"admin" | "demo"} UserRole */

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET env var is not set.");
  return new TextEncoder().encode(s);
}

/**
 * Creates a signed JWT carrying the username and role.
 * @param {string}   username
 * @param {UserRole} role
 */
export async function createToken(username, role = "admin") {
  return new SignJWT({ u: username, role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .setIssuer(ISSUER)
    .sign(getSecret());
}

/**
 * Verifies the JWT signature, issuer, and expiry.
 * Returns the payload (including `role`) on success, null otherwise.
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer:     ISSUER,
      algorithms: [ALGORITHM],
    });
    return payload;
  } catch {
    return null;
  }
}
