"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import type { AdminSubmission } from "@/lib/types";
import { fetchAdminSubmissions } from "@/lib/client/admin-api";
import styles from "./Results.module.css";

function buildMetrics(submissions: AdminSubmission[]): AdminMetric[] {
  const pending = submissions.filter((submission) => submission.status === "pending").length;
  const approved = submissions.filter((submission) => submission.status === "approved").length;
  const rejected = submissions.filter((submission) => submission.status === "rejected").length;

  return [
    {
      key: "total_submissions",
      label: "TOTAL_SUBMISSIONS",
      value: String(submissions.length),
      helper: "received",
      tone: "neutral",
    },
    {
      key: "pending",
      label: "PENDING",
      value: String(pending),
      helper: "awaiting review",
      tone: "amber",
    },
    {
      key: "approved",
      label: "APPROVED",
      value: String(approved),
      helper: "cleared for showcase",
      tone: "emerald",
    },
    {
      key: "rejected",
      label: "REJECTED",
      value: String(rejected),
      helper: "returned to team",
      tone: "red",
    },
    {
      key: "deadline_countdown",
      label: "DEADLINE_COUNTDOWN",
      value: "00.00.00",
      suffix: "s",
      helper: "until close",
      tone: "neutral",
    },
  ];
}

function scoreFor(submission: AdminSubmission, judgeId: string) {
  return submission.scores.find((score) => score.judgeId === judgeId)?.score ?? null;
}

function scoredAverage(submission: AdminSubmission) {
  const numericScores = submission.scores
    .map((score) => score.score)
    .filter((score): score is number => typeof score === "number");

  if (numericScores.length === 0) {
    return null;
  }

  return Math.round(
    numericScores.reduce((total, score) => total + score, 0) / numericScores.length,
  );
}

function scoreLabel(score: number | null) {
  return typeof score === "number" ? `${score}/100` : "-";
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(submissions: AdminSubmission[], judgeIds: string[]) {
  const header = ["Project", "Team", ...judgeIds.map((judgeId) => judgeId.toUpperCase()), "Average Score"];
  const rows = submissions.map((submission) => [
    submission.projectName,
    submission.teamName,
    ...judgeIds.map((judgeId) => scoreLabel(scoreFor(submission, judgeId))),
    scoreLabel(scoredAverage(submission)),
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n");
}

export default function ResultsClient() {
  const [data, setData] = useState<AdminSubmission[]>([]);
  const [judgeIds, setJudgeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportState, setExportState] = useState("");
  const shellMetrics = useMemo(() => buildMetrics(data), [data]);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchAdminSubmissions();
      setData(payload.submissions);
      setJudgeIds(payload.judgeIds);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load aggregate scores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  function exportScoresCsv() {
    const csv = buildCsv(data, judgeIds);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "hackxperience-aggregate-scores.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExportState("SCORES CSV READY");
  }

  return (
    <>
      <AdminShellConfig value={{ metrics: shellMetrics }} />

      <header className={styles.contentHeader}>
        <div>
          <h2>&gt; AGGREGATE_SCORES</h2>
          <p>{error ? `// ${error.toUpperCase()}` : (loading ? "// LOADING JUDGES SCORES" : "// VIEW JUDGES SCORES & AVERAGES")}</p>
        </div>
        <button type="button" className={styles.exportButton} onClick={exportScoresCsv}>
          <Download aria-hidden="true" />
          <span>[ EXPORT SCORES CSV ]</span>
        </button>
      </header>

      <section className={styles.tablePanel}>
        <div className={styles.tableGrid}>
          <div className={styles.tableHead}>PROJECT</div>
          {judgeIds.map((judgeId) => (
            <div className={styles.tableHead} key={judgeId}>
              {judgeId.toUpperCase()}
            </div>
          ))}
          <div className={styles.tableHead}>AVERAGE_SCORE</div>

          {data.map((submission) => {
            const average = scoredAverage(submission);

            return (
              <div className={styles.tableRow} key={submission.id}>
                <div className={`${styles.tableCell} ${styles.projectCell}`} data-label="PROJECT">
                  <span className={styles.projectName}>{submission.projectName}</span>
                  <span className={styles.teamName}>{submission.teamName}</span>
                </div>
                {judgeIds.map((judgeId) => (
                  <div className={styles.tableCell} key={judgeId} data-label={judgeId}>
                    {scoreLabel(scoreFor(submission, judgeId))}
                  </div>
                ))}
                <div className={`${styles.tableCell} ${styles.averageCell}`} data-label="AVERAGE_SCORE">
                  {typeof average === "number" ? (
                    <>
                      <span>{average}</span>
                      <span className={styles.averageSuffix}>/100</span>
                    </>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className={styles.exportState} aria-live="polite">
        {exportState}
      </p>
    </>
  );
}
