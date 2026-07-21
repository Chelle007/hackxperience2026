import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  buildSessionToken,
  PORTAL_DASHBOARDS,
  PORTAL_SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { insertSubmissionLog } from "@/lib/server/activity-log";

type LoginRow = {
  id: number;
  username: string;
  password: string;
};

/** Legacy table-based login — admin/judge only. Sponsors use Supabase Auth via /login. */
const roleToTable = {
  admin: "admins",
  judge: "judges",
} as const;

function isLegacyPortalRole(role: unknown): role is keyof typeof roleToTable {
  return role === "admin" || role === "judge";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const role = body?.role;
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isLegacyPortalRole(role) || !username || !password) {
    return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
  }

  const table = roleToTable[role];
  const { data, error } = await supabaseServer
    .from(table)
    .select("id,username,password")
    .ilike("username", username)
    .maybeSingle<LoginRow>();

  if (error || !data || !verifyPassword(data.password, password)) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  const token = buildSessionToken({
    userId: data.id,
    username: data.username,
    role,
  });

  const response = NextResponse.json({
    role,
    username: data.username,
    redirectTo: PORTAL_DASHBOARDS[role],
  });

  response.cookies.set(PORTAL_SESSION_COOKIE, token, sessionCookieOptions());

  void insertSubmissionLog({
    submissionId: null,
    action: "LOGIN",
    performedBy: `${role}:${data.username}`,
    note: `${role === "admin" ? "Admin" : "Judge"} "${data.username}" logged in`,
  }).catch(() => {});

  return response;
}
