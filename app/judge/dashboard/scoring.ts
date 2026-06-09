// Scoring rubric + helpers for the judge dashboard.
import type { ScoreEntry } from "./types";

export const CRITERIA = [
  { key: "techExec",        label: "Technical Execution",     max: 30 },
  { key: "problemSolution", label: "Problem-Solution Fit",    max: 25 },
  { key: "innovation",      label: "Innovation + Creativity", max: 25 },
  { key: "presentation",    label: "Presentation Quality",    max: 20 },
] as const;

export type CriterionKey = typeof CRITERIA[number]["key"];

export function makeBlankScore(): ScoreEntry {
  return { techExec: "", problemSolution: "", innovation: "", presentation: "", comment: "", saved: false, savedTotal: 0 };
}

export function isFieldInvalid(value: string, max: number): boolean {
  if (!value.trim()) return false;
  const n = Number(value);
  return isNaN(n) || n < 0 || n > max || !Number.isInteger(n);
}

export function calcLiveTotal(score: ScoreEntry): number {
  return CRITERIA.reduce((sum, c) => {
    const v = parseInt(score[c.key as CriterionKey]);
    return sum + (isNaN(v) || isFieldInvalid(score[c.key as CriterionKey], c.max) ? 0 : v);
  }, 0);
}

export function fmtDate(iso: string): string {
  try {
    return new Date(iso)
      .toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      .toUpperCase();
  } catch { return iso; }
}
