"use client";

import type { AdminSubmission } from "@/lib/types";

type XlsxModule = typeof import("xlsx");
type XlsxWorkbook = import("xlsx").WorkBook;
type XlsxCell = string | number;
type XlsxCols = NonNullable<import("xlsx").WorkSheet["!cols"]>;

function numOrEmpty(v: number | null | undefined): number | string {
  return typeof v === "number" ? v : "";
}

function strOrEmpty(v: string | null | undefined): string {
  return typeof v === "string" ? v : "";
}

function createSheet(
  xlsx: XlsxModule,
  headers: string[],
  rows: XlsxCell[][],
  widths: number[],
): import("xlsx").WorkSheet {
  const ws = xlsx.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = widths.map((wch) => ({ wch })) as XlsxCols;
  return ws;
}

export async function exportScoresXlsx(
  submissions: AdminSubmission[],
  filename: string,
): Promise<void> {
  const xlsx = await import("xlsx");
  const wb = xlsx.utils.book_new();

  const aggregated = submissions
    .map((sub) => {
      const valid = sub.scores.filter(
        (s): s is typeof s & { score: number } =>
          typeof s.score === "number" && Number.isFinite(s.score),
      );
      if (valid.length === 0) return null;
      const avg = valid.reduce((sum, s) => sum + s.score, 0) / valid.length;
      return { project: sub.projectName, team: sub.teamName, avg: +avg.toFixed(2) };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.avg - a.avg || a.project.localeCompare(b.project));

  const aggregateRows = aggregated.map((row) => [row.project, row.team, row.avg]);
  const ws1 = createSheet(
    xlsx,
    ["Project Name", "Team Name", "Overall Average Score"],
    aggregateRows,
    [32, 26, 24],
  );
  xlsx.utils.book_append_sheet(wb, ws1, "Aggregate Overview");

  const detailedRows: XlsxCell[][] = [];

  for (const sub of submissions) {
    for (const s of sub.scores) {
      if (s.score === null && s.technicalExecution == null) continue;
      detailedRows.push([
        sub.projectName,
        sub.teamName,
        s.judgeId,
        numOrEmpty(s.technicalExecution),
        numOrEmpty(s.problemSolutionFit),
        numOrEmpty(s.innovationCreativity),
        numOrEmpty(s.presentationQuality),
        numOrEmpty(s.score),
        strOrEmpty(s.comments),
      ]);
    }
  }

  const ws2 = createSheet(
    xlsx,
    [
      "Project Name",
      "Team Name",
      "Judge Username",
      "Technical Execution",
      "Problem/Solution Fit",
      "Innovation/Creativity",
      "Presentation Quality",
      "Total Judge Score",
      "Comments",
    ],
    detailedRows,
    [32, 26, 22, 22, 24, 24, 24, 20, 44],
  );
  xlsx.utils.book_append_sheet(wb, ws2, "Detailed Judge Breakdown");

  await downloadWorkbook(xlsx, wb, filename);
}

export async function exportProjectsXlsx(
  submissions: AdminSubmission[],
  filename: string,
): Promise<void> {
  const xlsx = await import("xlsx");
  const wb = xlsx.utils.book_new();

  const rows = submissions.map((sub) => [
    sub.projectName,
    sub.teamName,
    strOrEmpty(sub.teamId),
    sub.track,
    sub.status.toUpperCase(),
    sub.submittedAt,
    strOrEmpty(sub.githubUrl),
    strOrEmpty(sub.liveUrl),
    strOrEmpty(sub.pitchDeckUrl),
  ]);

  const ws = createSheet(
    xlsx,
    [
      "Project Name",
      "Team Name",
      "Team ID",
      "Track",
      "Status",
      "Submitted At",
      "GitHub URL",
      "Live URL",
      "Pitch Deck URL",
    ],
    rows,
    [32, 26, 16, 20, 14, 22, 40, 36, 36],
  );
  xlsx.utils.book_append_sheet(wb, ws, "Projects");

  await downloadWorkbook(xlsx, wb, filename);
}

async function downloadWorkbook(
  xlsx: XlsxModule,
  wb: XlsxWorkbook,
  filename: string,
): Promise<void> {
  const buffer = xlsx.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
