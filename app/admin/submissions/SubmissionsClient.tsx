"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import SubmissionViewOverlay, { type EditDraft } from "../components/SubmissionViewOverlay";
import type { AdminSubmission, SubmissionStatus } from "@/lib/types";
import { mockSubmissions } from "@/lib/mock";
import styles from "./Submissions.module.css";

export type SubmissionFilter = "all" | "pending" | "approved" | "rejected";

const trackOptions = Array.from(new Set(mockSubmissions.map((s) => s.track)));

const HEADER_MAP: Record<SubmissionFilter, { title: string; subtitle: string }> = {
  all: { title: "ALL_SUBMISSIONS", subtitle: "// MONITOR ALL HACKATHON SUBMISSIONS" },
  pending: { title: "PENDING_REVIEW", subtitle: "// AWAITING ADMIN REVIEW" },
  approved: { title: "APPROVED_SUBMISSIONS", subtitle: "// CLEARED FOR SCORING AND SHOWCASE" },
  rejected: { title: "REJECTED_SUBMISSIONS", subtitle: "// RETURNED TO TEAMS" },
};

const EMPTY_MAP: Record<SubmissionFilter, string> = {
  all: "[ NO SUBMISSIONS FOUND ]",
  pending: "[ NO PENDING SUBMISSIONS ]",
  approved: "[ NO APPROVED SUBMISSIONS ]",
  rejected: "[ NO REJECTED SUBMISSIONS ]",
};

function buildMetrics(all: AdminSubmission[]): AdminMetric[] {
  const pending = all.filter((s) => s.status === "pending").length;
  const approved = all.filter((s) => s.status === "approved").length;
  const rejected = all.filter((s) => s.status === "rejected").length;

  return [
    { key: "total", label: "TOTAL_SUBMISSIONS", value: String(all.length), helper: "received", tone: "neutral" },
    { key: "pending", label: "PENDING", value: String(pending), helper: "awaiting review", tone: "amber" },
    { key: "approved", label: "APPROVED", value: String(approved), helper: "cleared for showcase", tone: "emerald" },
    { key: "rejected", label: "REJECTED", value: String(rejected), helper: "returned to team", tone: "red" },
    { key: "deadline", label: "DEADLINE_COUNTDOWN", value: "00.00.00", suffix: "s", helper: "until close", tone: "neutral" },
  ];
}

function Thumbnail() {
  return (
    <span className={styles.thumbnail} aria-hidden="true">
      <span className={styles.thumbnailLineA} />
      <span className={styles.thumbnailLineB} />
    </span>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const cls =
    status === "approved"
      ? styles.badgeApproved
      : status === "pending"
        ? styles.badgePending
        : styles.badgeRejected;
  return <span className={cls}>{status.toUpperCase()}</span>;
}

function RowActions({
  submission,
  onDeleteClick,
  onViewClick,
}: {
  submission: AdminSubmission;
  onDeleteClick: (s: AdminSubmission) => void;
  onViewClick: (s: AdminSubmission) => void;
}) {
  return (
    <div className={styles.actions}>
      {submission.status === "pending" && (
        <button type="button" className={styles.approveAction} aria-label="Approve submission">
          <Check aria-hidden="true" />
        </button>
      )}
      {(submission.status === "pending" || submission.status === "approved") && (
        <button type="button" className={styles.rejectAction} aria-label="Reject submission">
          <X aria-hidden="true" />
        </button>
      )}
      <button type="button" className={styles.viewAction} onClick={() => onViewClick(submission)}>
        VIEW
      </button>
      <button type="button" className={styles.deleteAction} onClick={() => onDeleteClick(submission)}>
        DELETE
      </button>
    </div>
  );
}

function DeleteModal({
  submission,
  onConfirm,
  onCancel,
}: {
  submission: AdminSubmission;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onCancel}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalAccent} />
        <p className={styles.modalTitle}>DELETE_PROJECT</p>
        <p className={styles.modalWarning}>// THIS ACTION CANNOT BE UNDONE</p>
        <p className={styles.modalBody}>
          Are you sure you want to delete &quot;{submission.projectName}&quot; by {submission.teamName}?
        </p>
        <div className={styles.modalButtons}>
          <button type="button" className={styles.modalYes} onClick={onConfirm}>
            YES
          </button>
          <button type="button" className={styles.modalNo} onClick={onCancel}>
            NO
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SubmissionsClient({ filter }: { filter: SubmissionFilter }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">(
    filter === "all" ? "all" : filter,
  );
  const [pendingDelete, setPendingDelete] = useState<AdminSubmission | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [data, setData] = useState<AdminSubmission[]>(mockSubmissions);

  const viewingSubmission = useMemo(
    () => data.find((s) => s.id === viewingId) ?? null,
    [data, viewingId],
  );

  const shellMetrics = useMemo(() => buildMetrics(data), [data]);
  const { title, subtitle } = HEADER_MAP[filter];

  const visible = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const effectiveStatus = filter === "all" ? statusFilter : filter;

    return data.filter((s) => {
      const matchStatus = effectiveStatus === "all" || s.status === effectiveStatus;
      const matchTrack = trackFilter === "all" || s.track === trackFilter;
      const matchSearch =
        q.length === 0 ||
        [s.projectName, s.teamName, s.track].join(" ").toLowerCase().includes(q);
      return matchStatus && matchTrack && matchSearch;
    });
  }, [data, filter, statusFilter, trackFilter, searchTerm]);

  function handleDeleteConfirm() {
    if (!pendingDelete) return;
    setData((prev) => prev.filter((s) => s.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  function handleApprove(id: string) {
    setData((prev) => prev.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s)));
  }

  function handleReject(id: string) {
    setData((prev) => prev.map((s) => (s.id === id ? { ...s, status: "rejected" as const } : s)));
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

      <header className={styles.sectionHeader}>
        <h2>&gt; {title}</h2>
        <p>{subtitle}</p>
      </header>

      <section className={styles.controls}>
        <label className={styles.searchField}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search project, team or track..."
            aria-label="Search submissions"
          />
        </label>

        <label className={styles.selectField}>
          <span className={styles.selectIconWrap}>
            <ChevronDown className={styles.selectChevron} aria-hidden="true" />
          </span>
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            aria-label="Track filter"
          >
            <option value="all">ALL TRACKS</option>
            {trackOptions.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.selectField}>
          <span className={styles.selectIconWrap}>
            <ChevronDown className={styles.selectChevron} aria-hidden="true" />
          </span>
          {filter === "all" ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | "all")}
              aria-label="Status filter"
            >
              <option value="all">ALL STATUSES</option>
              <option value="pending">PENDING</option>
              <option value="approved">APPROVED</option>
              <option value="rejected">REJECTED</option>
            </select>
          ) : (
            <select value={filter} aria-label="Status filter" disabled>
              <option value={filter}>{filter.toUpperCase()}</option>
            </select>
          )}
        </label>
      </section>

      <section className={styles.tablePanel}>
        <div className={styles.tableGrid}>
          <div className={styles.tableHead}>THUMBNAIL</div>
          <div className={styles.tableHead}>PROJECT</div>
          <div className={styles.tableHead}>TEAM</div>
          <div className={styles.tableHead}>TRACK</div>
          <div className={styles.tableHead}>STATUS</div>
          <div className={styles.tableHead}>SUBMITTED</div>
          <div className={styles.tableHead}>ACTIONS</div>

          {visible.length === 0 ? (
            <div className={styles.emptyRow}>{EMPTY_MAP[filter]}</div>
          ) : (
            visible.map((s) => (
              <div className={styles.tableRow} key={s.id}>
                <div className={styles.tableCell} data-label="THUMBNAIL">
                  <Thumbnail />
                </div>
                <div className={styles.tableCell} data-label="PROJECT">{s.projectName}</div>
                <div className={styles.tableCell} data-label="TEAM">{s.teamName}</div>
                <div className={styles.tableCell} data-label="TRACK">{s.track}</div>
                <div className={styles.tableCell} data-label="STATUS">
                  <StatusBadge status={s.status} />
                </div>
                <div className={styles.tableCell} data-label="SUBMITTED">{s.submittedAt}</div>
                <div className={styles.tableCell} data-label="ACTIONS">
                  <RowActions
                    submission={s}
                    onDeleteClick={setPendingDelete}
                    onViewClick={(sub) => setViewingId(sub.id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <AnimatePresence>
        {pendingDelete && (
          <DeleteModal
            submission={pendingDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setPendingDelete(null)}
          />
        )}
      </AnimatePresence>

      <SubmissionViewOverlay
        submission={viewingSubmission}
        onClose={() => setViewingId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={(id) => {
          setViewingId(null);
          setPendingDelete(data.find((s) => s.id === id) ?? null);
        }}
        onSave={handleSave}
      />
    </>
  );
}
