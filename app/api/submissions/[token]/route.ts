import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

interface RouteContext {
  params: Promise<{ token: string }>;
}

// GET /api/submissions/[token] — fetch a submission by edit token
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { token } = await params;

  const { data, error } = await supabaseServer
    .from("submissions")
    .select("*")
    .eq("edit_token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json(dbToForm(data));
}

// PUT /api/submissions/[token] — update a submission by edit token
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("submissions")
    .update({
      project_name:        body.projectName,
      team_id:             body.teamId,
      track:               body.track,
      description:         body.description,
      pitch:               body.pitch,
      tech_stack:          body.techStack ?? [],
      thumbnail_url:       body.thumbnailUrl ?? null,
      github_url:          body.githubUrl,
      live_url:            body.liveUrl || null,
      pitch_deck_url:      body.pitchDeckUrl,
      pitch_deck_file_url: body.pitchDeckFileUrl ?? null,
      members:             body.members ?? [],
      notes:               body.notes || null,
    })
    .eq("edit_token", token)
    .select("id, edit_token")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Submission not found or update failed" }, { status: 404 });
  }

  return NextResponse.json({ id: data.id, editToken: data.edit_token });
}

// Map snake_case DB row → camelCase form shape
function dbToForm(row: Record<string, unknown>) {
  return {
    id:               row.id,
    editToken:        row.edit_token,
    status:           row.status,
    submittedAt:      row.submitted_at,
    updatedAt:        row.updated_at,
    // form fields
    projectName:      row.project_name,
    teamId:           row.team_id,
    track:            row.track,
    description:      row.description,
    pitch:            row.pitch,
    techStack:        row.tech_stack,
    thumbnailUrl:     row.thumbnail_url,
    githubUrl:        row.github_url,
    liveUrl:          row.live_url ?? "",
    pitchDeckUrl:     row.pitch_deck_url,
    pitchDeckFileUrl: row.pitch_deck_file_url,
    members:          row.members,
    notes:            row.notes ?? "",
  };
}
