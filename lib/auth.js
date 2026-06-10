// Industry-standard JWT auth using jose — Edge Runtime compatible.
// Middleware, login API, and logout API all import from here.

import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME   = "erp_auth";
export const SESSION_HOURS = 10;
const ISSUER               = "gayatri-erp";
const ALGORITHM            = "HS256";

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET env var is not set.");
  return new TextEncoder().encode(s);
}

// Creates a signed JWT with standard claims (iss, iat, exp).
export async function createToken(username) {
  return new SignJWT({ u: username })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .setIssuer(ISSUER)
    .sign(getSecret());
}

// Verifies the JWT signature, issuer, and expiry.
// Returns the payload on success, null otherwise.
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
