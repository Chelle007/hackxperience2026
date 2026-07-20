export const COMMUNITY_LEADERBOARD_RELEASE_MS = new Date("2026-07-25T12:00:00+08:00").getTime();

export function isCommunityLeaderboardLive(nowMs = Date.now()) {
  return nowMs >= COMMUNITY_LEADERBOARD_RELEASE_MS;
}

