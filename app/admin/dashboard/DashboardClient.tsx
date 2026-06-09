"use client";

import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import { usePortalSettings } from "../components/PortalSettingsContext";
import { HACKX_TRACKS, type AdminSubmission, type SubmissionStatus } from "@/lib/types";
import { mockSubmissions } from "@/lib/mock";
import SubmissionViewOverlay, { type EditDraft } from "../components/SubmissionViewOverlay";
import styles from "./Dashboard.module.css";

type DashboardState = "empty" | "populated";

const statusLabels: Record<SubmissionStatus, string> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

const emptySubmissions: AdminSubmission[] = [];

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

function SectionHeader({ title }: { title: string }) {
  return (
    <div className={styles.sectionHeader}>
      <span>&gt; {title}</span>
    </div>
  );
}

function ToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.toggleRow}>
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        className={`${styles.toggle} ${enabled ? styles.toggleOn : styles.toggleOff}`}
        onClick={onToggle}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}

function TrackChart({ submissions }: { submissions: AdminSubmission[] }) {
  const counts = HACKX_TRACKS.map((track) => ({
    track,
    count: submissions.filter((submission) => submission.track === track).length,
  }));
  const maxCount = Math.max(1, ...counts.map((item) => item.count));

  return (
    <div className={styles.chartWrap}>
      {counts.map((item) => {
        const pct = item.count === 0 ? 0 : Math.max(16, Math.round((item.count / maxCount) * 80));
        return (
          <div className={styles.trackColumn} key={item.track}>
            <div className={styles.barArea}>
              <span className={styles.barValue} style={{ bottom: `calc(${pct}% + 14px)` }}>
                {item.count}
              </span>
              <span className={styles.bar} style={{ height: `${pct}%` }} />
              <span className={styles.baseline} />
            </div>
            <span className={styles.trackLabel}>{item.track}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status${statusLabels[status]}` as keyof typeof styles]}`}>
      {statusLabels[status]}
    </span>
  );
}

function Thumbnail() {
  return (
    <span className={styles.thumbnail} aria-hidden="true">
      <span className={styles.thumbnailLineA} />
      <span className={styles.thumbnailLineB} />
    </span>
  );
}

function SubmissionActions({ status, onViewClick }: { status: SubmissionStatus; onViewClick: () => void }) {
  return (
    <div className={styles.actions}>
      {status === "pending" ? (
        <button type="button" className={`${styles.iconAction} ${styles.approveAction}`} aria-label="Approve submission">
          <Check aria-hidden="true" />
        </button>
      ) : null}
      <button type="button" className={`${styles.iconAction} ${styles.rejectAction}`} aria-label="Reject submission">
        <X aria-hidden="true" />
      </button>
      <button type="button" className={styles.textAction} onClick={onViewClick}>VIEW</button>
      <button type="button" className={`${styles.textAction} ${styles.deleteAction}`}>DELETE</button>
    </div>
  );
}

function RecentSubmissionsTable({ submissions, onView }: { submissions: AdminSubmission[]; onView: (id: string) => void }) {
  return (
    <section className={styles.tablePanel}>
      <SectionHeader title="RECENT_SUBMISSIONS" />
      <div className={styles.tableFrame}>
        <div className={styles.tableGrid}>
          <div className={styles.tableHead}>THUMBNAIL</div>
          <div className={styles.tableHead}>PROJECT</div>
          <div className={styles.tableHead}>TEAM</div>
          <div className={styles.tableHead}>TRACK</div>
          <div className={styles.tableHead}>STATUS</div>
          <div className={styles.tableHead}>SUBMITTED</div>
          <div className={styles.tableHead}>ACTIONS</div>

          {submissions.length === 0 ? (
            <div className={styles.emptyRow}>[ NO SUBMISSIONS YET ]</div>
          ) : (
            submissions.map((submission) => (
              <div className={styles.tableRow} key={submission.id}>
                <div className={styles.tableCell} data-label="THUMBNAIL">
                  <Thumbnail />
                </div>
                <div className={styles.tableCell} data-label="PROJECT">{submission.projectName}</div>
                <div className={styles.tableCell} data-label="TEAM">{submission.teamName}</div>
                <div className={styles.tableCell} data-label="TRACK">{submission.track}</div>
                <div className={styles.tableCell} data-label="STATUS">
                  <StatusBadge status={submission.status} />
                </div>
                <div className={styles.tableCell} data-label="SUBMITTED">{submission.submittedAt}</div>
                <div className={styles.tableCell} data-label="ACTIONS">
                  <SubmissionActions status={submission.status} onViewClick={() => onView(submission.id)} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default function DashboardClient({ initialState }: { initialState: DashboardState }) {
  const { submissionsOpen, allowResubmissions, toggleSubmissionsOpen, toggleAllowResubmissions } = usePortalSettings();
  const [data, setData] = useState<AdminSubmission[]>(
    initialState === "empty" ? emptySubmissions : mockSubmissions
  );
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewingSubmission = useMemo(() => data.find((s) => s.id === viewingId) ?? null, [data, viewingId]);
  const shellMetrics = useMemo(() => buildMetrics(data), [data]);

  function handleApprove(id: string) {
    setData((prev) => prev.map((s) => s.id === id ? { ...s, status: "approved" as SubmissionStatus } : s));
  }

  function handleReject(id: string) {
    setData((prev) => prev.map((s) => s.id === id ? { ...s, status: "rejected" as SubmissionStatus } : s));
  }

  function handleDelete(id: string) {
    setViewingId(null);
    setData((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSave(id: string, draft: EditDraft) {
    setData((prev) => prev.map((s) => s.id !== id ? s : {
      ...s,
      projectName:  draft.projectName,
      track:        draft.track,
      status:       draft.status,
      githubUrl:    draft.githubUrl    || undefined,
      liveUrl:      draft.liveUrl      || null,
      pitchDeckUrl: draft.pitchDeckUrl || undefined,
      videoDemoUrl: draft.videoDemoUrl || null,
      description:  draft.description  || undefined,
      shortPitch:   draft.shortPitch   || undefined,
    }));
  }

  return (
    <>
      <AdminShellConfig value={{ metrics: shellMetrics }} />

      <header className={styles.contentHeader}>
        <h2>&gt; DASHBOARD_OVERVIEW</h2>
        <p>{"// REAL-TIME SUBMISSION STATUS"}</p>
      </header>

      <div className={styles.dashboardGrid}>
        <section className={styles.chartPanel}>
          <SectionHeader title="SUBMISSIONS_BY_TRACK" />
          <TrackChart submissions={data} />
        </section>

        <section className={styles.quickPanel}>
          <SectionHeader title="QUICK_ACTIONS" />
          <div className={styles.quickActions}>
            <ToggleRow
              label="SUBMISSIONS OPEN"
              enabled={submissionsOpen}
              onToggle={toggleSubmissionsOpen}
            />
            <ToggleRow
              label="ALLOW RESUBMISSIONS"
              enabled={allowResubmissions}
              onToggle={toggleAllowResubmissions}
            />
            <button type="button" className={styles.exportButton}>
              [ EXPORT SCORES CSV ]
            </button>
            <button type="button" className={styles.exportButton}>
              [ EXPORT PROJECTS CSV ]
            </button>
          </div>
        </section>

        <RecentSubmissionsTable submissions={data} onView={(id) => setViewingId(id)} />
      </div>

      <SubmissionViewOverlay
        submission={viewingSubmission}
        onClose={() => setViewingId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        onSave={handleSave}
      />
    </>
  );
}
