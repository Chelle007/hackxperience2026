import { NextResponse } from "next/server";

/**
 * Proxy — Next.js 16's renamed `middleware` (a file named `middleware.ts` will
 * NOT run in Next 16). Runs on the server before the admin + judge portal routes
 * render, and is the single place portal access should be enforced.
 *
 * SCAFFOLD ONLY — this enforces nothing yet. Login is currently a mock
 * (app/components/portal/PortalLogin.tsx) with no real session to validate, so
 * every matched request is passed straight through.
 *
 * TODO(auth): once real auth exists, accept `request: NextRequest`, validate the
 * session + role, and redirect unauthenticated users to the matching login page:
 *
 *   import type { NextRequest } from "next/server";
 *   export async function proxy(request: NextRequest) {
 *     const { pathname } = request.nextUrl;
 *     const isLogin = pathname === "/admin/login" || pathname === "/judge/login";
 *     const session = await getSession(request);            // real check
 *     if (!isLogin && !session) {
 *       const portal = pathname.startsWith("/admin") ? "admin" : "judge";
 *       return NextResponse.redirect(new URL(`/${portal}/login`, request.url));
 *     }
 *     return NextResponse.next();
 *   }
 *
 * A proxy matcher is NOT a substitute for per-request checks — also validate
 * auth inside any route handler / Server Action that reads or mutates data.
 */
export function proxy() {
  return NextResponse.next();
}

export const config = {
  // Run only on the protected portals. Login pages are matched too for now;
  // exclude or special-case them when the redirect logic above is added.
  matcher: ["/admin/:path*", "/judge/:path*"],
};
