import "server-only";

import type { CommunityVotingLeaderboardEntry, CommunityVotingTeam, SubmissionRow, TeamMember } from "@/lib/types";

type CommunityBallotRow = {
  id: string;
  voter_email: string;
};

type CommunityVoteEntryRow = {
  ballot_id: string;
  voted_submission_id: string;
};

function normalizeTeamMembers(value: unknown): TeamMember[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as {
        id?: unknown;
        name?: unknown;
        studentId?: unknown;
        university?: unknown;
        role?: unknown;
        email?: unknown;
      };

      if (typeof row.name !== "string" || typeof row.email !== "string") return null;

      const member: TeamMember = {
        name: row.name,
        email: row.email,
      };

      if (typeof row.id === "string" && row.id.trim()) member.id = row.id;
      if (typeof row.studentId === "string" && row.studentId.trim()) member.studentId = row.studentId;
      if (typeof row.university === "string" && row.university.trim()) member.university = row.university;
      if (typeof row.role === "string" && row.role.trim()) member.role = row.role;

      return member;
    })
    .filter((entry): entry is TeamMember => Boolean(entry));
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isMissingRelationError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return error.code === "42P01" || error.code === "PGRST205" || message.includes("does not exist");
}

export function mapApprovedSubmissionToVotingTeam(row: SubmissionRow): CommunityVotingTeam {
  return {
    submissionId: row.id,
    teamId: row.team_id,
    projectName: row.project_name,
    track: row.track,
    thumbnailUrl: row.thumbnail_url ?? null,
    members: normalizeTeamMembers(row.members),
  };
}

export function buildVotingEligibilityMap(ballots: CommunityBallotRow[]) {
  const votedEmails = new Set<string>();
  for (const ballot of ballots) {
    const email = normalizeEmail(ballot.voter_email);
    if (email) votedEmails.add(email);
  }
  return votedEmails;
}

export function normalizeVoteSelectionIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item): item is string => Boolean(item))
    .filter((item, index, list) => list.indexOf(item) === index);
}

export function buildLeaderboard(
  approvedTeams: CommunityVotingTeam[],
  voteEntries: CommunityVoteEntryRow[],
): CommunityVotingLeaderboardEntry[] {
  const voteCounts = new Map<string, number>();
  for (const entry of voteEntries) {
    const submissionId = typeof entry.voted_submission_id === "string" ? entry.voted_submission_id.trim() : "";
    if (!submissionId) continue;
    voteCounts.set(submissionId, (voteCounts.get(submissionId) ?? 0) + 1);
  }

  const leaderboard = approvedTeams.map((team) => ({
    submissionId: team.submissionId,
    teamId: team.teamId,
    projectName: team.projectName,
    voteCount: voteCounts.get(team.submissionId) ?? 0,
    rank: 0,
    thumbnailUrl: team.thumbnailUrl,
  }));

  leaderboard.sort((a, b) => {
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
    const teamCompare = a.teamId.localeCompare(b.teamId);
    if (teamCompare !== 0) return teamCompare;
    return a.projectName.localeCompare(b.projectName);
  });

  let currentRank = 0;
  let lastVoteCount: number | null = null;
  for (let index = 0; index < leaderboard.length; index += 1) {
    const row = leaderboard[index];
    if (lastVoteCount !== row.voteCount) {
      currentRank = index + 1;
      lastVoteCount = row.voteCount;
    }
    row.rank = currentRank;
  }

  return leaderboard;
}
