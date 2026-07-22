import { NextResponse, type NextRequest } from "next/server";
import {
  PORTAL_DASHBOARDS,
  PORTAL_LOGINS,
  PORTAL_SESSION_COOKIE,
  readSessionFromCookies,
  sessionCookieOptions,
  type PortalRole,
} from "@/lib/auth/session";

function redirectTo(path: string, request: NextRequest, clearSession = false) {
  const response = NextResponse.redirect(new URL(path, request.url));
  if (clearSession) {
    response.cookies.set(PORTAL_SESSION_COOKIE, "", sessionCookieOptions(0));
  }
  return response;
}

function portalFromPath(pathname: string): PortalRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/judge")) return "judge";
  if (pathname.startsWith("/sponsor")) return "sponsor";
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = readSessionFromCookies(request.cookies);
  const portal = portalFromPath(pathname);

  if (!portal) return NextResponse.next();

  const isLogin =
    pathname === `/${portal}/login` ||
    pathname === "/login";

  // /admin, /judge, /sponsor roots → login or dashboard
  if (pathname === `/${portal}`) {
    if (!session) return redirectTo(PORTAL_LOGINS[portal], request);
    if (session.role !== portal) {
      return redirectTo(PORTAL_DASHBOARDS[session.role], request, true);
    }
    return redirectTo(PORTAL_DASHBOARDS[portal], request);
  }

  // Dedicated /{role}/login pages
  if (pathname === `/${portal}/login`) {
    if (!session) return NextResponse.next();
    if (session.role === portal) return redirectTo(PORTAL_DASHBOARDS[portal], request);
    return redirectTo(PORTAL_DASHBOARDS[session.role], request);
  }

  // Shared /login is not matched by this proxy (matcher is portal prefixes only).
  if (isLogin) return NextResponse.next();

  // Protected portal pages
  if (!session) return redirectTo(PORTAL_LOGINS[portal], request);

  // Kiosk sessions are admin-issued and only valid on voting routes.
  if (portal === "admin" && session.role === "kiosk") {
    if (pathname.startsWith("/admin/voting")) return NextResponse.next();
    return redirectTo("/admin/voting", request);
  }

  if (session.role !== portal) {
    return redirectTo(PORTAL_LOGINS[session.role], request, true);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/judge/:path*", "/sponsor/:path*"],
};
