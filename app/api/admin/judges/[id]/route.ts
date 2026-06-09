import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type JudgeRow = {
  id: number;
  username: string;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const judgeId = Number(id);
  if (!Number.isInteger(judgeId)) {
    return NextResponse.json({ error: "Invalid judge id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const updatePayload: { username?: string; password?: string } = {};

  if (typeof body?.username === "string" && body.username.trim()) {
    updatePayload.username = body.username.trim();
  }
  if (typeof body?.password === "string" && body.password) {
    updatePayload.password = body.password;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("judges")
    .update(updatePayload)
    .eq("id", judgeId)
    .select("id,username")
    .maybeSingle<JudgeRow>();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Judge username already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Judge not found." }, { status: 404 });
  }

  return NextResponse.json({ judge: data });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const judgeId = Number(id);
  if (!Number.isInteger(judgeId)) {
    return NextResponse.json({ error: "Invalid judge id." }, { status: 400 });
  }

  const scoreDelete = await supabaseServer
    .from("judges_scores")
    .delete()
    .eq("judges_id", judgeId);
  if (scoreDelete.error) {
    return NextResponse.json({ error: scoreDelete.error.message }, { status: 500 });
  }

  const { data, error } = await supabaseServer
    .from("judges")
    .delete()
    .eq("id", judgeId)
    .select("id")
    .maybeSingle<{ id: number }>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Judge not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
