import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/route-guard";
import { supabaseServer } from "@/lib/supabase-server";
import { mapSubmissionToAdminView, totalScore, type JudgeRow, type JudgeScoreRow } from "@/lib/server/portal-data";
import type { SubmissionRow } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = requireRole(request, "admin");
  if (!auth.ok) return auth.response;

  const [submissionsResult, judgesResult, scoresResult] = await Promise.all([
    supabaseServer
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false }),
    supabaseServer
      .from("judges")
      .select("id,username")
      .order("id", { ascending: true }),
    supabaseServer
      .from("judges_scores")
      .select("judges_id,submission_id,technical_execution,problem_solution_fit,innovation_creativity,presentation_quality,private_comment"),
  ]);

  if (submissionsResult.error) {
    return NextResponse.json({ error: submissionsResult.error.message }, { status: 500 });
  }
  if (judgesResult.error) {
    return NextResponse.json({ error: judgesResult.error.message }, { status: 500 });
  }
  if (scoresResult.error) {
    return NextResponse.json({ error: scoresResult.error.message }, { status: 500 });
  }

  const submissions = (submissionsResult.data ?? []) as SubmissionRow[];
  const judges = (judgesResult.data ?? []) as JudgeRow[];
  const scoreRows = (scoresResult.data ?? []) as JudgeScoreRow[];

  const scoreRowsBySubmission = new Map<string, JudgeScoreRow[]>();
  for (const row of scoreRows) {
    const bucket = scoreRowsBySubmission.get(row.submission_id) ?? [];
    bucket.push(row);
    scoreRowsBySubmission.set(row.submission_id, bucket);
  }

  const judgeIds =
    judges.length > 0
      ? judges.map((judge) => judge.username)
      : Array.from(new Set(scoreRows.map((row) => String(row.judges_id))));

  const adminSubmissions = submissions.map((submission) => {
    const rows = scoreRowsBySubmission.get(submission.id) ?? [];

    const scores =
      judges.length > 0
        ? judges.map((judge) => {
            const row = rows.find((candidate) => candidate.judges_id === judge.id);
            return { judgeId: judge.username, score: totalScore(row) };
          })
        : rows.map((row) => ({
            judgeId: String(row.judges_id),
            score: totalScore(row),
          }));

    return mapSubmissionToAdminView(submission, scores);
  });

  return NextResponse.json({
    submissions: adminSubmissions,
    judgeIds,
    session: {
      username: auth.session.username,
      role: auth.session.role,
    },
  });
}
