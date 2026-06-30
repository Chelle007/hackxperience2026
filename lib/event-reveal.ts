/**
 * Landing-page reveal gate for track names and breakdown.
 * Set NEXT_PUBLIC_REVEAL_TRACKS_AND_JUDGES=true in Vercel when ready to publish tracks.
 * Defaults to hidden (unset or any value other than "true"). Judges are always shown.
 */
export const REVEAL_TRACKS_AND_JUDGES =
  process.env.NEXT_PUBLIC_REVEAL_TRACKS_AND_JUDGES === "true";
