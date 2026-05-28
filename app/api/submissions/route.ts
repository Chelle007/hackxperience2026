import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// POST /api/submissions — create a new submission
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("submissions")
    .insert({
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
    .select("id, edit_token")
    .single();

  if (error) {
    // team_id unique violation — team already submitted
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A submission for this Team ID already exists. Use your edit link to update it." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, editToken: data.edit_token }, { status: 201 });
}
