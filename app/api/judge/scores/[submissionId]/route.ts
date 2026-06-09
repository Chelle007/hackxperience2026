import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { totalScore, type JudgeScoreRow } from "@/lib/server/portal-data";

type RouteContext = {
  params: Promise<{ submissionId: string }>;
};

type SettingsRow = {
  technical_execution_value: number;
  problem_solution_fit_value: number;
  innovation_creativity_value: number;
  presentation_quality_value: number;
};

function parseCriterion(value: unknown, max: number): number | null | "invalid" {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > max) return "invalid";
  return n;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = requireRole(request, "judge");
  if (!auth.ok) return auth.response;

  const { submissionId } = await params;
  const body = await request.json().catch(() => null);

  const settingsResult = await supabaseServer
    .from("settings")
    .select("technical_execution_value,problem_solution_fit_value,innovation_creativity_value,presentation_quality_value")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle<SettingsRow>();

  if (settingsResult.error) {
    return NextResponse.json({ error: settingsResult.error.message }, { status: 500 });
  }

  const limits = settingsResult.data ?? {
    technical_execution_value: 30,
    problem_solution_fit_value: 25,
    innovation_creativity_value: 25,
    presentation_quality_value: 20,
  };

  const technicalExecution = parseCriterion(body?.techExec, limits.technical_execution_value);
  const problemSolutionFit = parseCriterion(body?.problemSolution, limits.problem_solution_fit_value);
  const innovationCreativity = parseCriterion(body?.innovation, limits.innovation_creativity_value);
  const presentationQuality = parseCriterion(body?.presentation, limits.presentation_quality_value);
  const privateComment =
    typeof body?.comment === "string" && body.comment.trim() ? body.comment.trim() : null;

  if (
    technicalExecution === "invalid" ||
    problemSolutionFit === "invalid" ||
    innovationCreativity === "invalid" ||
    presentationQuality === "invalid"
  ) {
    return NextResponse.json({ error: "Invalid score payload." }, { status: 400 });
  }

  const submissionCheck = await supabaseServer
    .from("submissions")
    .select("id,status")
    .eq("id", submissionId)
    .maybeSingle<{ id: string; status: string }>();

  if (submissionCheck.error) {
    return NextResponse.json({ error: submissionCheck.error.message }, { status: 500 });
  }
  if (!submissionCheck.data || submissionCheck.data.status !== "APPROVED") {
    return NextResponse.json({ error: "Submission is not available for scoring." }, { status: 404 });
  }

  const { data, error } = await supabaseServer
    .from("judges_scores")
    .upsert(
      {
        judges_id: auth.session.userId,
        submission_id: submissionId,
        technical_execution: technicalExecution,
        problem_solution_fit: problemSolutionFit,
        innovation_creativity: innovationCreativity,
        presentation_quality: presentationQuality,
        private_comment: privateComment,
      },
      { onConflict: "judges_id,submission_id" }
    )
    .select("judges_id,submission_id,technical_execution,problem_solution_fit,innovation_creativity,presentation_quality,private_comment")
    .single<JudgeScoreRow>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    total: totalScore(data),
  });
}
