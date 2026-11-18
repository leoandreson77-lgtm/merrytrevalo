import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth-options";

const nextAuthHandler = NextAuth(authOptions);

async function handler(
  req: NextRequest,
  context: { params: { nextauth: string[] } }
) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");

  if (host) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  }

  return nextAuthHandler(req, context);
}

export { handler as GET, handler as POST };
