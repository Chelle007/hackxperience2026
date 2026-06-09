import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";

type JudgeRow = {
  id: number;
  username: string;
};

export async function GET(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from("judges")
    .select("id,username")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ judges: (data ?? []) as JudgeRow[] });
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("judges")
    .insert({ username, password })
    .select("id,username")
    .single<JudgeRow>();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Judge username already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ judge: data }, { status: 201 });
}
