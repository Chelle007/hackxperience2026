"use client";

import { Check, LogOut, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import { usePortalSettings } from "../components/PortalSettingsContext";
import { HACKX_TRACKS, mockSubmissions } from "../data/mockSubmissions";
import styles from "./Settings.module.css";

// ── Shell metrics ────────────────────────────────

function buildMetrics(): AdminMetric[] {
  const all = mockSubmissions;
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

// ── Toggle ───────────────────────────────────────

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`${styles.toggle} ${on ? styles.toggleOn : styles.toggleOff}`}
      onClick={onToggle}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

// ── Panel 1: Submission Config ────────────────────

function SubmissionConfigPanel() {
  const { submissionsOpen, allowResubmissions, toggleSubmissionsOpen, toggleAllowResubmissions } = usePortalSettings();
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(50);

  function setNum(setter: (v: number) => void, raw: string, max: number) {
    const v = parseInt(raw, 10);
    if (!Number.isNaN(v) && v > 0 && v <= max) setter(v);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>&gt; SUBMISSION_CONFIG</h3>
      </div>
      <div className={styles.panelBody}>
        <div className={styles.configRow}>
          <span className={styles.configLabel}>
            SUBMISSION WINDOW
            <span className={styles.configSub}>
              {submissionsOpen ? "// ACCEPTING ENTRIES" : "// CLOSED TO ENTRIES"}
            </span>
          </span>
          <Toggle on={submissionsOpen} onToggle={toggleSubmissionsOpen} label="Toggle submission window" />
        </div>

        <div className={styles.divider} />

        <div className={styles.configRow}>
          <span className={styles.configLabel}>
            ALLOW RESUBMISSIONS
            <span className={styles.configSub}>// TEAMS MAY OVERWRITE SUBMISSION</span>
          </span>
          <Toggle on={allowResubmissions} onToggle={toggleAllowResubmissions} label="Toggle resubmissions" />
        </div>

        <div className={styles.divider} />

        <div className={styles.configRow}>
          <span className={styles.configLabel}>
            MAX TEAM SIZE
            <span className={styles.configSub}>// MEMBERS PER SUBMISSION</span>
          </span>
          <input
            type="number"
            className={styles.numberInput}
            value={maxTeamSize}
            min={1}
            max={20}
            onChange={(e) => setNum(setMaxTeamSize, e.target.value, 20)}
            aria-label="Max team size"
          />
        </div>

        <div className={styles.divider} />

        <div className={styles.configRow}>
          <span className={styles.configLabel}>
            MAX FILE SIZE
            <span className={styles.configSub}>// PER SUBMISSION UPLOAD</span>
          </span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="number"
              className={styles.numberInput}
              value={maxFileSizeMb}
              min={1}
              max={500}
              onChange={(e) => setNum(setMaxFileSizeMb, e.target.value, 500)}
              aria-label="Max file size in MB"
            />
            <span className={styles.inputUnit}>MB</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Panel 2: Judging Criteria ─────────────────────

type Criterion = { key: string; label: string; maxPts: number };

const defaultCriteria: Criterion[] = [
  { key: "innovation", label: "INNOVATION", maxPts: 20 },
  { key: "technical", label: "TECHNICAL_COMPLEXITY", maxPts: 25 },
  { key: "design", label: "DESIGN_AND_UX", maxPts: 20 },
  { key: "presentation", label: "PRESENTATION", maxPts: 20 },
  { key: "impact", label: "IMPACT", maxPts: 15 },
];

function JudgingCriteriaPanel() {
  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);

  function setPts(key: string, raw: string) {
    const v = parseInt(raw, 10);
    if (!Number.isNaN(v) && v >= 0 && v <= 100) {
      setCriteria((prev) => prev.map((c) => (c.key === key ? { ...c, maxPts: v } : c)));
    }
  }

  const total = useMemo(() => criteria.reduce((sum, c) => sum + c.maxPts, 0), [criteria]);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>&gt; JUDGING_CRITERIA</h3>
      </div>
      <div className={styles.panelBody}>
        {criteria.map((c) => (
          <div key={c.key} className={styles.criteriaRow}>
            <span className={styles.criteriaLabel}>{c.label}</span>
            <div className={styles.criteriaControls}>
              <input
                type="number"
                className={styles.numberInput}
                value={c.maxPts}
                min={0}
                max={100}
                onChange={(e) => setPts(c.key, e.target.value)}
                aria-label={`${c.label} max points`}
              />
              <span className={styles.inputUnit}>pts</span>
            </div>
          </div>
        ))}
        <p className={styles.criteriaTotal}>
          TOTAL <strong>{total}</strong> pts
        </p>
      </div>
    </section>
  );
}

// ── Panel 3: Tracks ───────────────────────────────

type Track = { key: string; id: string; name: string; enabled: boolean };

const defaultTracks: Track[] = HACKX_TRACKS.map((name, i) => ({
  key: `t${i + 1}`,
  id: `TRACK_0${i + 1}`,
  name,
  enabled: i < 3,
}));

function TracksPanel() {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);

  function toggleTrack(key: string) {
    setTracks((prev) => prev.map((t) => (t.key === key ? { ...t, enabled: !t.enabled } : t)));
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>&gt; TRACKS</h3>
      </div>
      <div className={styles.panelBody}>
        {tracks.map((t) => (
          <div key={t.key} className={styles.trackRow}>
            <div className={styles.trackInfo}>
              <div className={styles.trackId}>{t.id}</div>
              <div className={styles.trackName}>{t.name}</div>
            </div>
            <Toggle
              on={t.enabled}
              onToggle={() => toggleTrack(t.key)}
              label={`Toggle ${t.id}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Panel 4: Admin Session ────────────────────────

function AdminSessionPanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>&gt; ADMIN_SESSION</h3>
      </div>
      <div className={styles.panelBody}>
        <div className={styles.sessionInfo}>
          <div className={styles.sessionField}>
            <span className={styles.sessionFieldLabel}>ADMIN_ID</span>
            <span className={`${styles.sessionFieldValue} ${styles.accent}`}>admin@simitc</span>
          </div>
          <div className={styles.sessionField}>
            <span className={styles.sessionFieldLabel}>ROLE</span>
            <span className={styles.sessionFieldValue}>SUPER_ADMIN</span>
          </div>
          <div className={styles.sessionField}>
            <span className={styles.sessionFieldLabel}>SESSION_START</span>
            <span className={styles.sessionFieldValue}>25 JUN 2026, 08:00 SGT</span>
          </div>
          <div className={styles.sessionField}>
            <span className={styles.sessionFieldLabel}>DURATION</span>
            <span className={styles.sessionFieldValue}>04:12:08</span>
          </div>
        </div>
        <button type="button" className={styles.logoutBtn}>
          <LogOut aria-hidden="true" />
          <span>LOGOUT_SESSION</span>
        </button>
      </div>
    </section>
  );
}

// ── Panel 5: Judge Accounts ───────────────────────

type JudgeAccount = { id: string; name: string; active: boolean };

const defaultJudges: JudgeAccount[] = [
  { id: "judge1", name: "Judge Alpha", active: true },
  { id: "judge2", name: "Judge Beta", active: true },
  { id: "judge3", name: "Judge Gamma", active: false },
];

type EditingState = { id: string; name: string } | null;
type AddingState = { id: string; name: string } | null;

function JudgeAccountsPanel() {
  const [judges, setJudges] = useState<JudgeAccount[]>(defaultJudges);
  const [editing, setEditing] = useState<EditingState>(null);
  const [adding, setAdding] = useState<AddingState>(null);

  function startEdit(judge: JudgeAccount) {
    setAdding(null);
    setEditing({ id: judge.id, name: judge.name });
  }

  function confirmEdit() {
    if (!editing || !editing.id.trim() || !editing.name.trim()) return;
    setJudges((prev) =>
      prev.map((j) =>
        j.id === editing.id ? { ...j, name: editing.name } : j,
      ),
    );
    setEditing(null);
  }

  function cancelEdit() {
    setEditing(null);
  }

  function deleteJudge(id: string) {
    setJudges((prev) => prev.filter((j) => j.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  function startAdd() {
    setEditing(null);
    setAdding({ id: "", name: "" });
  }

  function confirmAdd() {
    if (!adding || !adding.id.trim() || !adding.name.trim()) return;
    if (judges.some((j) => j.id === adding.id.trim())) return;
    setJudges((prev) => [...prev, { id: adding.id.trim(), name: adding.name.trim(), active: true }]);
    setAdding(null);
  }

  function cancelAdd() {
    setAdding(null);
  }

  return (
    <section className={`${styles.panel} ${styles.fullCol}`}>
      <div className={styles.panelHead}>
        <h3>&gt; JUDGE_ACCOUNTS</h3>
      </div>

      <div className={styles.judgeTableScroll}><div className={styles.judgeTable}>
        <div className={styles.tableHead}>JUDGE_ID</div>
        <div className={styles.tableHead}>NAME</div>
        <div className={styles.tableHead}>STATUS</div>
        <div className={styles.tableHead}>ACTIONS</div>

        {judges.map((judge) =>
          editing?.id === judge.id ? (
            <div className={styles.addFormRow} key={judge.id}>
              <div className={styles.addFormCell} data-label="JUDGE_ID">
                <input
                  type="text"
                  className={styles.addInput}
                  value={editing.id}
                  readOnly
                  aria-label="Judge ID"
                />
              </div>
              <div className={styles.addFormCell} data-label="NAME">
                <input
                  type="text"
                  className={styles.addInput}
                  value={editing.name}
                  placeholder="Judge name..."
                  onChange={(e) => setEditing((prev) => prev && { ...prev, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
                  autoFocus
                  aria-label="Judge name"
                />
              </div>
              <div className={styles.addFormCell} data-label="STATUS">
                <span className={judge.active ? styles.statusActive : styles.statusInactive}>
                  {judge.active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <div className={styles.addFormCell} data-label="ACTIONS">
                <div className={styles.addFormActions}>
                  <button type="button" className={styles.confirmBtn} onClick={confirmEdit} aria-label="Confirm edit">
                    <Check aria-hidden="true" />
                  </button>
                  <button type="button" className={styles.cancelBtn} onClick={cancelEdit} aria-label="Cancel edit">
                    <X aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.judgeRow} key={judge.id}>
              <div className={styles.judgeCell} data-label="JUDGE_ID">{judge.id}</div>
              <div className={styles.judgeCell} data-label="NAME">{judge.name}</div>
              <div className={styles.judgeCell} data-label="STATUS">
                <span className={judge.active ? styles.statusActive : styles.statusInactive}>
                  {judge.active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <div className={styles.judgeCell} data-label="ACTIONS">
                <div className={styles.judgeActions}>
                  <button type="button" className={styles.editBtn} onClick={() => startEdit(judge)}>
                    EDIT
                  </button>
                  <button type="button" className={styles.deleteBtn} onClick={() => deleteJudge(judge.id)}>
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ),
        )}

        {adding && (
          <div className={styles.addFormRow}>
            <div className={styles.addFormCell} data-label="JUDGE_ID">
              <input
                type="text"
                className={styles.addInput}
                value={adding.id}
                placeholder="judge4"
                onChange={(e) => setAdding((prev) => prev && { ...prev, id: e.target.value })}
                aria-label="New judge ID"
                autoFocus
              />
            </div>
            <div className={styles.addFormCell} data-label="NAME">
              <input
                type="text"
                className={styles.addInput}
                value={adding.name}
                placeholder="Judge name..."
                onChange={(e) => setAdding((prev) => prev && { ...prev, name: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") confirmAdd(); if (e.key === "Escape") cancelAdd(); }}
                aria-label="New judge name"
              />
            </div>
            <div className={styles.addFormCell} data-label="STATUS">
              <span className={styles.statusActive}>ACTIVE</span>
            </div>
            <div className={styles.addFormCell} data-label="ACTIONS">
              <div className={styles.addFormActions}>
                <button type="button" className={styles.confirmBtn} onClick={confirmAdd} aria-label="Confirm add">
                  <Check aria-hidden="true" />
                </button>
                <button type="button" className={styles.cancelBtn} onClick={cancelAdd} aria-label="Cancel add">
                  <X aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div></div>

      <div className={styles.panelFooter}>
        <button
          type="button"
          className={styles.addJudgeBtn}
          onClick={startAdd}
          disabled={!!adding}
        >
          <Plus aria-hidden="true" style={{ width: 12, height: 12 }} />
          <span>ADD_JUDGE</span>
        </button>
      </div>
    </section>
  );
}

// ── Root export ───────────────────────────────────

const shellMetrics = buildMetrics();

export default function SettingsClient() {
  return (
    <>
      <AdminShellConfig value={{ metrics: shellMetrics }} />

      <header className={styles.pageHeader}>
        <h2>&gt; SETTINGS</h2>
        <p>{"// CONFIGURE EVENT PARAMETERS, JUDGING, AND ACCOUNTS"}</p>
      </header>

      <div className={styles.settingsGrid}>
        <SubmissionConfigPanel />
        <JudgingCriteriaPanel />
        <TracksPanel />
        <AdminSessionPanel />
        <JudgeAccountsPanel />
      </div>
    </>
  );
}
