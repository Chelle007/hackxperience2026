import { NextRequest, NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/auth/route-guard";
import { insertSubmissionLog } from "@/lib/server/activity-log";
import {
  buildVotingEligibilityMap,
  isMissingRelationError,
  mapApprovedSubmissionToVotingTeam,
  normalizeVoteSelectionIds,
} from "@/lib/server/community-voting";
import { supabaseServer } from "@/lib/supabase-server";
import type { SubmissionRow } from "@/lib/types";

type CommunityBallotInsert = {
  source_submission_id: string;
  source_team_id: string;
  voter_name: string;
  voter_email: string;
  voted_submission_ids: string[];
  created_by_admin: string;
};

type CommunityBallotRow = {
  id: string;
  voter_email: string;
};

type CommunityBallotLogRow = {
  id: string;
  source_team_id: string;
  voter_name: string;
  voter_email: string;
  voted_submission_ids: string[];
  created_by_admin: string;
  created_at: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function getSubmissionMemberMap(submission: SubmissionRow) {
  const members = mapApprovedSubmissionToVotingTeam(submission).members;
  const memberByEmail = new Map<string, { name: string; email: string }>();

  for (const member of members) {
    const email = normalizeEmail(member.email);
    if (!email) continue;
    memberByEmail.set(email, { name: member.name, email });
  }

  return memberByEmail;
}

export async function GET(request: NextRequest) {
  const auth = requireAnyRole(request, ["admin", "kiosk"]);
  if (!auth.ok) return auth.response;

  const [submissionsResult, ballotsResult, ballotLogsResult] = await Promise.all([
    supabaseServer
      .from("submissions")
      .select("*")
      .eq("status", "APPROVED")
      .neq("is_draft", true)
      .order("team_id", { ascending: true }),
    supabaseServer
      .from("community_ballots")
      .select("id,voter_email"),
    auth.session.role === "admin"
      ? supabaseServer
          .from("community_ballots")
          .select("id,source_team_id,voter_name,voter_email,voted_submission_ids,created_by_admin,created_at")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (submissionsResult.error) {
    return NextResponse.json({ error: submissionsResult.error.message }, { status: 500 });
  }

  if (ballotsResult.error && !isMissingRelationError(ballotsResult.error)) {
    return NextResponse.json({ error: ballotsResult.error.message }, { status: 500 });
  }
  if (ballotLogsResult.error && !isMissingRelationError(ballotLogsResult.error)) {
    return NextResponse.json({ error: ballotLogsResult.error.message }, { status: 500 });
  }

  const approvedTeams = ((submissionsResult.data ?? []) as SubmissionRow[]).map(mapApprovedSubmissionToVotingTeam);
  const votedEmails = buildVotingEligibilityMap(((ballotsResult.data ?? []) as CommunityBallotRow[]) ?? []);
  const submissionById = new Map(approvedTeams.map((team) => [team.submissionId, team] as const));
  const ballots = auth.session.role === "admin"
    ? (((ballotLogsResult.data ?? []) as CommunityBallotLogRow[]) ?? []).map((ballot) => ({
        id: ballot.id,
        sourceTeamId: ballot.source_team_id,
        voterName: ballot.voter_name,
        voterEmail: ballot.voter_email,
        createdByAdmin: ballot.created_by_admin,
        createdAt: ballot.created_at,
        votedTeams: (Array.isArray(ballot.voted_submission_ids) ? ballot.voted_submission_ids : [])
          .map((submissionId) => {
            const target = submissionById.get(submissionId);
            if (!target) return null;
            return {
              submissionId: target.submissionId,
              teamId: target.teamId,
              projectName: target.projectName,
            };
          })
          .filter((entry): entry is { submissionId: string; teamId: string; projectName: string } => Boolean(entry)),
      }))
    : [];

  return NextResponse.json({
    mode: auth.session.role,
    teams: approvedTeams.map((team) => ({
      ...team,
      members: team.members.map((member) => ({
        ...member,
        hasVoted: votedEmails.has(normalizeEmail(member.email)),
      })),
    })),
    ballots,
  });
}

export async function POST(request: NextRequest) {
  const auth = requireAnyRole(request, ["admin", "kiosk"]);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const sourceTeamId = normalizeText(body?.sourceTeamId);
  const voterEmail = normalizeEmail(body?.voterEmail);
  const votedSubmissionIds = normalizeVoteSelectionIds(body?.votedSubmissionIds);

  if (!sourceTeamId || !voterEmail) {
    return NextResponse.json({ error: "Team and voter selection are required." }, { status: 400 });
  }

  if (votedSubmissionIds.length !== 3) {
    return NextResponse.json({ error: "Exactly 3 distinct projects must be selected." }, { status: 400 });
  }

  const [submissionsResult, existingBallotResult] = await Promise.all([
    supabaseServer
      .from("submissions")
      .select("*")
      .eq("status", "APPROVED")
      .neq("is_draft", true),
    supabaseServer
      .from("community_ballots")
      .select("id,voter_email")
      .eq("voter_email", voterEmail)
      .maybeSingle<{ id: string; voter_email: string }>(),
  ]);

  if (submissionsResult.error) {
    return NextResponse.json({ error: submissionsResult.error.message }, { status: 500 });
  }

  if (existingBallotResult.error && !isMissingRelationError(existingBallotResult.error)) {
    return NextResponse.json({ error: existingBallotResult.error.message }, { status: 500 });
  }

  if (existingBallotResult.data) {
    return NextResponse.json({ error: "This participant has already submitted their vote." }, { status: 409 });
  }

  const approvedSubmissions = (submissionsResult.data ?? []) as SubmissionRow[];
  const sourceSubmission = approvedSubmissions.find((submission) => submission.team_id === sourceTeamId);

  if (!sourceSubmission) {
    return NextResponse.json({ error: "Only approved teams may vote." }, { status: 400 });
  }

  const memberByEmail = getSubmissionMemberMap(sourceSubmission);
  const voter = memberByEmail.get(voterEmail);

  if (!voter) {
    return NextResponse.json({ error: "Selected participant is not listed on that approved team." }, { status: 400 });
  }

  if (memberByEmail.size === 0) {
    return NextResponse.json({ error: "This team has no valid member records and cannot vote yet." }, { status: 400 });
  }

  if (votedSubmissionIds.includes(sourceSubmission.id)) {
    return NextResponse.json({ error: "Teams cannot vote for their own project." }, { status: 400 });
  }

  const approvedSubmissionIds = new Set(approvedSubmissions.map((submission) => submission.id));
  const hasInvalidTarget = votedSubmissionIds.some((submissionId) => !approvedSubmissionIds.has(submissionId));
  if (hasInvalidTarget) {
    return NextResponse.json({ error: "Votes can only be cast for approved projects." }, { status: 400 });
  }

  const insertPayload: CommunityBallotInsert = {
    source_submission_id: sourceSubmission.id,
    source_team_id: sourceSubmission.team_id,
    voter_name: voter.name,
    voter_email: voter.email,
    voted_submission_ids: votedSubmissionIds,
    created_by_admin: auth.session.username,
  };

  const ballotInsertResult = await supabaseServer
    .from("community_ballots")
    .insert(insertPayload)
    .select("id")
    .single<{ id: string }>();

  if (ballotInsertResult.error) {
    return NextResponse.json({ error: ballotInsertResult.error.message }, { status: 500 });
  }

  const entryInsertResult = await supabaseServer
    .from("community_vote_entries")
    .insert(
      votedSubmissionIds.map((submissionId) => ({
        ballot_id: ballotInsertResult.data.id,
        voted_submission_id: submissionId,
      })),
    );

  if (entryInsertResult.error) {
    await supabaseServer.from("community_ballots").delete().eq("id", ballotInsertResult.data.id);
    return NextResponse.json({ error: entryInsertResult.error.message }, { status: 500 });
  }

  void insertSubmissionLog({
    submissionId: sourceSubmission.id,
    action: "COMMUNITY_VOTE_CAST",
    performedBy: auth.session.username,
    note: `Community vote recorded for ${sourceSubmission.team_id} / ${voter.name}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
