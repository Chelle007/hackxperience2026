import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";

type SettingsRow = {
  id: number;
  submission_status: boolean;
  resubmission_status: boolean;
  max_team_size: number;
  deadline: string;
  active_tracks: string[] | null;
  technical_execution_value: number;
  problem_solution_fit_value: number;
  innovation_creativity_value: number;
  presentation_quality_value: number;
  updated_at: string;
};

export async function GET(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from("settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle<SettingsRow>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data ?? null });
}

export async function PATCH(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);

  const updatePayload: Partial<SettingsRow> = {};
  if (typeof body?.submission_status === "boolean") {
    updatePayload.submission_status = body.submission_status;
  }
  if (typeof body?.resubmission_status === "boolean") {
    updatePayload.resubmission_status = body.resubmission_status;
  }
  if (typeof body?.max_team_size === "number") {
    updatePayload.max_team_size = Math.max(1, Math.min(20, Math.round(body.max_team_size)));
  }
  if (typeof body?.deadline === "string") {
    updatePayload.deadline = body.deadline;
  }
  if (Array.isArray(body?.active_tracks)) {
    updatePayload.active_tracks = body.active_tracks.filter((item: unknown): item is string => typeof item === "string");
  }
  if (typeof body?.technical_execution_value === "number") {
    updatePayload.technical_execution_value = Math.max(0, Math.min(100, Math.round(body.technical_execution_value)));
  }
  if (typeof body?.problem_solution_fit_value === "number") {
    updatePayload.problem_solution_fit_value = Math.max(0, Math.min(100, Math.round(body.problem_solution_fit_value)));
  }
  if (typeof body?.innovation_creativity_value === "number") {
    updatePayload.innovation_creativity_value = Math.max(0, Math.min(100, Math.round(body.innovation_creativity_value)));
  }
  if (typeof body?.presentation_quality_value === "number") {
    updatePayload.presentation_quality_value = Math.max(0, Math.min(100, Math.round(body.presentation_quality_value)));
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const existing = await supabaseServer
    .from("settings")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: number }>();

  if (existing.error) {
    return NextResponse.json({ error: existing.error.message }, { status: 500 });
  }
  if (!existing.data) {
    return NextResponse.json(
      { error: "Settings row missing. Seed the settings table first." },
      { status: 404 }
    );
  }

  const { data, error } = await supabaseServer
    .from("settings")
    .update(updatePayload)
    .eq("id", existing.data.id)
    .select("*")
    .single<SettingsRow>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
