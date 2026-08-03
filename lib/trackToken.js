import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const s = process.env.TRACK_LINK_SECRET;
  if (!s) throw new Error("TRACK_LINK_SECRET is not set in environment");
  return new TextEncoder().encode(s);
};

export async function signTrackToken({ slug, consignor = "", consignee = "", fromDate = "", expiryDays = 30 }) {
  return new SignJWT({ slug, consignor, consignee, fromDate })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(getSecret());
}

export async function verifyTrackToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}
