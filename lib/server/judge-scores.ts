import "server-only";

import { supabaseServer } from "@/lib/supabase-server";

export type JudgeScoresIdColumn = "judges_id" | "judge_id";

type LooseScoreRow = Record<string, unknown>;

let cachedJudgeScoresIdColumn: JudgeScoresIdColumn | null = null;

function isMissingColumnError(error: { code?: string; message?: string } | null | undefined, column: JudgeScoresIdColumn) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  const needle = column.toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    (message.includes(needle) && (message.includes("column") || message.includes("schema cache"))) ||
    message.includes("does not exist")
  );
}

export async function resolveJudgeScoresIdColumn(): Promise<JudgeScoresIdColumn> {
  if (cachedJudgeScoresIdColumn) return cachedJudgeScoresIdColumn;

  const candidates: JudgeScoresIdColumn[] = ["judges_id", "judge_id"];
  let lastError: string | null = null;

  for (const candidate of candidates) {
    const { error } = await supabaseServer
      .from("judges_scores")
      .select(candidate)
      .limit(1);

    if (!error) {
      cachedJudgeScoresIdColumn = candidate;
      return candidate;
    }

    if (!isMissingColumnError(error, candidate)) {
      throw new Error(error.message);
    }

    lastError = error.message;
  }

  throw new Error(lastError ?? "Unable to resolve judge score identity column.");
}

function toNullableNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function toNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

export type NormalizedJudgeScoreRow = {
  judges_id: number | string;
  submission_id: string;
  technical_execution: number | null;
  problem_solution_fit: number | null;
  innovation_creativity: number | null;
  presentation_quality: number | null;
  private_comment: string | null;
};

export function normalizeJudgeScoreRows(
  rows: LooseScoreRow[] | null | undefined,
  idColumn: JudgeScoresIdColumn,
): NormalizedJudgeScoreRow[] {
  return (rows ?? [])
    .map((row) => {
      const judgeId = row[idColumn];
      const submissionId = row.submission_id;
      if ((typeof judgeId !== "string" && typeof judgeId !== "number") || typeof submissionId !== "string") {
        return null;
      }

      return {
        judges_id: judgeId,
        submission_id: submissionId,
        technical_execution: toNullableNumber(row.technical_execution),
        problem_solution_fit: toNullableNumber(row.problem_solution_fit),
        innovation_creativity: toNullableNumber(row.innovation_creativity),
        presentation_quality: toNullableNumber(row.presentation_quality),
        private_comment: toNullableString(row.private_comment),
      };
    })
    .filter((row): row is NormalizedJudgeScoreRow => Boolean(row));
}

export function selectJudgeScoresColumns(idColumn: JudgeScoresIdColumn) {
  return `${idColumn},submission_id,technical_execution,problem_solution_fit,innovation_creativity,presentation_quality,private_comment`;
}
