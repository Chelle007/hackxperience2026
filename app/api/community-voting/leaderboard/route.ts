import { NextResponse } from "next/server";
import { buildLeaderboard, isMissingRelationError, mapApprovedSubmissionToVotingTeam } from "@/lib/server/community-voting";
import { supabaseServer } from "@/lib/supabase-server";
import type { SubmissionRow } from "@/lib/types";

type VoteEntryRow = {
  ballot_id: string;
  voted_submission_id: string;
};

export const dynamic = "force-dynamic";

export async function GET() {
  const [submissionsResult, entriesResult] = await Promise.all([
    supabaseServer
      .from("submissions")
      .select("*")
      .eq("status", "APPROVED")
      .neq("is_draft", true),
    supabaseServer
      .from("community_vote_entries")
      .select("ballot_id,voted_submission_id"),
  ]);

  if (submissionsResult.error) {
    return NextResponse.json({ error: submissionsResult.error.message }, { status: 500 });
  }

  if (entriesResult.error && !isMissingRelationError(entriesResult.error)) {
    return NextResponse.json({ error: entriesResult.error.message }, { status: 500 });
  }

  const approvedTeams = ((submissionsResult.data ?? []) as SubmissionRow[]).map(mapApprovedSubmissionToVotingTeam);
  const leaderboard = buildLeaderboard(approvedTeams, ((entriesResult.data ?? []) as VoteEntryRow[]) ?? []);

  return NextResponse.json({ leaderboard });
}
