import { NextRequest, NextResponse } from "next/server";
import {
  buildSessionToken,
  PORTAL_SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/route-guard";

export async function POST(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const token = buildSessionToken({
    userId: auth.session.userId,
    username: auth.session.username,
    role: "kiosk",
  });

  const response = NextResponse.json({ ok: true, redirectTo: "/admin/voting" });
  response.cookies.set(PORTAL_SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
