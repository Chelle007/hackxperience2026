"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ── Colour tokens ─────────────────────────────────────────────────
const C = {
  pageBg:    "#F5F0E8",
  topbarBg:  "#1A1A1A",
  contentBg: "#1A1A1A",
  darkRed:   "#3A0808",
  red:       "#CC0000",
  panelBg:   "#FFFFFF",
  muted:     "#888888",
  muted2:    "#888888",
  offWhite:  "#F5F0E8",
  white:     "#FFFFFF",
} as const;

const FM       = "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace";
const FB       = "var(--font-bebas-neue), 'Bebas Neue', sans-serif";
const SHADOW   = "4px 4px 0 0 #CC0000";
const SHADOW_LG = "6px 6px 0 0 #CC0000";
const SPRING   = { type: "spring" as const, stiffness: 420, damping: 18 };

// ── Responsive CSS (scoped — avoids Tailwind colour utilities) ────
const RESPONSIVE_CSS = `
  /* Hamburger (hidden on desktop, shown on mobile) */
  .r-hamburger { display: none; }

  /* Topbar */
  @media (max-width: 768px) {
    .r-topbar          { padding: 0 16px !important; }
    .r-topbar-status   { display: none !important; }
    .r-topbar-email    { display: none !important; }
    .r-topbar-logout   { display: none !important; }
    .r-hamburger       { display: flex !important; }
  }

  /* Hero */
  @media (max-width: 768px) {
    .r-hero         { padding: 14px 20px 16px !important; }
    .r-hero-h1      { font-size: 26px !important; line-height: 32px !important; margin-bottom: 10px !important; }
    .r-hero-meta    { gap: 10px 20px !important; margin-top: 10px !important; }
  }

  /* Body layout */
  @media (max-width: 768px) {
    .r-body    { flex-direction: column !important; }
    .r-sidebar { display: none !important; }
  }

  /* Content areas */
  @media (max-width: 768px) {
    .r-content-header { padding: 14px 16px 12px !important; }
    .r-project-list   { padding: 16px !important; }
  }

  /* Project rows — wrap at narrow widths */
  @media (max-width: 520px) {
    .r-project-row  { flex-wrap: wrap !important; gap: 8px 10px !important; padding: 10px 12px !important; }
    .r-project-thumb { display: none !important; }
    .r-project-actions { flex: 0 0 100% !important; justify-content: flex-end !important; }
  }

  /* Filter bar */
  @media (max-width: 520px) {
    .r-filter-bar { gap: 8px !important; }
    .r-filter-count { display: none !important; }
  }

  /* Scoring panel */
  @media (max-width: 640px) {
    .r-scoring-panel  { padding: 16px 14px 18px !important; }
    .r-score-row      { padding: 8px 0 !important; }
  }

  /* Overlay — full-screen on mobile */
  @media (max-width: 768px) {
    .r-overlay-backdrop { padding: 0 !important; }
    .r-overlay-panel {
      width: 100% !important;
      max-height: 100dvh !important;
      box-shadow: none !important;
    }
    .r-overlay-body { padding: 16px !important; gap: 14px !important; }
  }
`;

// ── Scoring rubric ────────────────────────────────────────────────
const CRITERIA = [
  { key: "techExec",        label: "Technical Execution",     max: 30 },
  { key: "problemSolution", label: "Problem-Solution Fit",    max: 25 },
  { key: "innovation",      label: "Innovation + Creativity", max: 25 },
  { key: "presentation",    label: "Presentation Quality",    max: 20 },
] as const;

type CriterionKey = typeof CRITERIA[number]["key"];

// ── Types ─────────────────────────────────────────────────────────
interface Member { name: string; email: string; }

interface Project {
  id: string; name: string; teamId: string; teamName: string;
  category: string; track: string; description: string; pitch: string;
  techStack: string[]; githubUrl: string; liveUrl: string | null;
  pitchDeckUrl: string; pitchDeckFileUrl: string | null; videoDemoUrl: string | null;
  members: Member[]; notes: string | null; submittedAt: string; updatedAt: string;
}

interface ScoreEntry {
  techExec: string; problemSolution: string; innovation: string; presentation: string;
  comment: string; saved: boolean; savedTotal: number;
}

// ── Mock data ─────────────────────────────────────────────────────
const MOCK_PROJECTS: Project[] = [
  {
    id: "1", name: "OmniTool Analytics", teamId: "TEAM-001", teamName: "The Analysts",
    category: "Web Development", track: "AI / ML",
    description: "A comprehensive dashboard for tracking student productivity across multiple campus platforms.",
    pitch: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vestibulum lectus at consectetur placerat. Suspendisse id maximus velit. Maecenas eu tristique lectus. Mauris non hendrerit odio. Pellentesque habitant morbi tristique senectus et netus et malesuada.",
    techStack: ["NODE.JS", "OPEN API", "SUPABASE"],
    githubUrl: "https://github.com/example/omnitool", liveUrl: "https://omnitool.vercel.app",
    pitchDeckUrl: "https://pitch.com/deck", pitchDeckFileUrl: "https://files.example.com/deck.pdf",
    videoDemoUrl: "https://youtube.com/watch?v=abc123",
    members: [
      { name: "Bob",    email: "bob@gmail.com" },
      { name: "Bobby",  email: "bobby@gmail.com" },
      { name: "Bobber", email: "bobber@gmail.com" },
      { name: "Bobson", email: "bobson@gmail.com" },
    ],
    notes: "The team has extensive industry experience. Please consider the project scope when scoring.",
    submittedAt: "2026-01-17T13:30:00", updatedAt: "2026-01-17T13:45:00",
  },
  {
    id: "2", name: "GreenCampus", teamId: "TEAM-002", teamName: "EcoWarriors",
    category: "Sustainability", track: "IoT / Hardware",
    description: "IoT-based solution for monitoring and reducing energy consumption in campus dormitories.",
    pitch: "GreenCampus uses low-power sensors to monitor energy usage in real-time. Students can track their consumption through a mobile app and compete in energy-saving challenges to win rewards.",
    techStack: ["REACT NATIVE", "ARDUINO", "NODE.JS"],
    githubUrl: "https://github.com/example/greencampus", liveUrl: null,
    pitchDeckUrl: "https://pitch.com/greendeck", pitchDeckFileUrl: null, videoDemoUrl: null,
    members: [
      { name: "Alice",  email: "alice@gmail.com" },
      { name: "Alex",   email: "alex@gmail.com" },
      { name: "Andrea", email: "andrea@gmail.com" },
    ],
    notes: null, submittedAt: "2026-01-17T14:00:00", updatedAt: "2026-01-17T14:00:00",
  },
];

const TRACKS = ["ALL", ...Array.from(new Set(MOCK_PROJECTS.map(p => p.track)))];

// ── Helpers ───────────────────────────────────────────────────────
function makeBlankScore(): ScoreEntry {
  return { techExec: "", problemSolution: "", innovation: "", presentation: "", comment: "", saved: false, savedTotal: 0 };
}
function isFieldInvalid(value: string, max: number): boolean {
  if (!value.trim()) return false;
  const n = Number(value);
  return isNaN(n) || n < 0 || n > max || !Number.isInteger(n);
}
function calcLiveTotal(score: ScoreEntry): number {
  return CRITERIA.reduce((sum, c) => {
    const v = parseInt(score[c.key as CriterionKey]);
    return sum + (isNaN(v) || isFieldInvalid(score[c.key as CriterionKey], c.max) ? 0 : v);
  }, 0);
}
function fmtDate(iso: string): string {
  try {
    return new Date(iso)
      .toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      .toUpperCase();
  } catch { return iso; }
}

// ── Atoms ─────────────────────────────────────────────────────────
function RedBar() {
  return <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.red, pointerEvents: "none" }} />;
}
function Divider() {
  return <div style={{ width: "100%", borderTop: `1px solid ${C.muted}` }} />;
}
function PlaceholderThumb() {
  return (
    <div style={{ width: 87, height: 51, background: "rgba(245,240,232,0.06)", border: `1px solid ${C.darkRed}`, position: "relative", overflow: "hidden" }}>
      <svg width="87" height="51" style={{ position: "absolute" }}>
        <line x1="0" y1="0" x2="87" y2="51" stroke="rgba(204,0,0,0.15)" strokeWidth="1" />
        <line x1="87" y1="0" x2="0" y2="51" stroke="rgba(204,0,0,0.15)" strokeWidth="1" />
      </svg>
    </div>
  );
}
function FieldBlock({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ minWidth: 160, flex: 1 }}>
      <div style={{ fontFamily: FM, fontSize: 11, color: C.red, letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <div style={{ fontFamily: FM, fontSize: 12, color: muted ? C.muted2 : C.offWhite, lineHeight: "18px", wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

// ── Scoring Panel ─────────────────────────────────────────────────
function ScoringPanel({ score, onChange, onSave }: {
  score: ScoreEntry;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
}) {
  const anyInvalid = CRITERIA.some(c => isFieldInvalid(score[c.key as CriterionKey], c.max));

  return (
    <div
      className="r-scoring-panel"
      style={{
        background: C.topbarBg,
        border: `1px solid ${C.red}`,
        borderTop: "none",
        borderLeft: `2px solid ${C.red}`,
        padding: "20px 20px 22px",
        boxShadow: SHADOW,
        position: "relative",
      }}
    >
      <RedBar />
      <style>{`
        .score-input { appearance: none; }
        .score-input::-webkit-outer-spin-button,
        .score-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .score-input:focus { border-color: #CC0000 !important; box-shadow: 2px 2px 0 0 #CC0000 !important; outline: none; }
        .portal-ta::placeholder { color: #555555; font-family: var(--font-ibm-plex-mono), monospace; font-size: 12px; opacity: 1; }
        .portal-ta:focus { border-color: #CC0000 !important; box-shadow: 2px 2px 0 0 #CC0000 !important; outline: none; }
      `}</style>

      <div style={{ fontFamily: FM, fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 16 }}>
        // ASSESSMENT_MATRIX
      </div>

      {CRITERIA.map((c, i) => {
        const altRow   = i % 2 === 1;
        const rowColor = altRow ? C.red : C.offWhite;
        const val      = score[c.key as CriterionKey];
        const invalid  = isFieldInvalid(val, c.max);

        return (
          <div
            key={c.key}
            className="r-score-row"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 0",
              borderBottom: i < CRITERIA.length - 1 ? "1px solid rgba(85,85,85,0.2)" : "none",
            }}
          >
            <span style={{ fontFamily: FM, fontSize: 12, color: rowColor, flex: 1 }}>{c.label}</span>
            {invalid && (
              <span style={{ fontFamily: FM, fontSize: 10, color: C.red, marginRight: 14, letterSpacing: "0.04em" }}>
                // INVALID
              </span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <input
                type="text"
                className="score-input"
                value={val}
                onChange={e => onChange(c.key, e.target.value)}
                style={{
                  width: 52, height: 34,
                  background: "#0D0D0D",
                  border: `1.5px solid ${invalid ? C.red : "#3A0808"}`,
                  color: invalid ? C.red : rowColor,
                  fontFamily: FM, fontSize: 14, fontWeight: 700,
                  textAlign: "center", outline: "none",
                  boxSizing: "border-box",
                  boxShadow: invalid ? "2px 2px 0 0 #CC0000" : "2px 2px 0 0 #3A0808",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
              <span style={{ fontFamily: FM, fontSize: 11, color: C.muted, minWidth: 28 }}>/ {c.max}</span>
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: FM, fontSize: 10, color: C.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
          // PRIVATE_COMMENT — OPTIONAL
        </div>
        <textarea
          className="portal-ta"
          value={score.comment}
          onChange={e => onChange("comment", e.target.value)}
          placeholder="Comment visible only to admins..."
          style={{
            width: "100%", height: 72,
            background: "#0D0D0D",
            border: "1.5px solid #3A0808",
            color: C.offWhite, fontFamily: FM, fontSize: 12,
            padding: "10px 12px", resize: "none", outline: "none",
            boxSizing: "border-box", lineHeight: 1.5,
            boxShadow: "2px 2px 0 0 #3A0808",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <motion.button
          onClick={onSave}
          disabled={anyInvalid}
          whileHover={anyInvalid ? {} : { scale: 1.03 }}
          whileTap={anyInvalid ? {} : { scale: 0.96 }}
          transition={SPRING}
          style={{
            height: 40, padding: "0 20px",
            background: anyInvalid ? "#1F1F1F" : C.red,
            border: anyInvalid ? `1px solid ${C.muted}` : "none",
            fontFamily: FB, fontSize: 22, color: anyInvalid ? C.muted : C.offWhite,
            cursor: anyInvalid ? "not-allowed" : "pointer",
            letterSpacing: "0.05em",
            boxShadow: anyInvalid ? "none" : "4px 4px 0 0 #1A1A1A",
            transition: "background 0.15s",
          }}
        >
          SAVE SCORE
        </motion.button>
        {anyInvalid && (
          <span style={{ fontFamily: FM, fontSize: 10, color: C.red, letterSpacing: "0.06em" }}>// INVALID INPUT</span>
        )}
        {!anyInvalid && score.saved && (
          <span style={{ fontFamily: FM, fontSize: 10, color: C.offWhite, letterSpacing: "0.06em" }}>// SCORE SAVED ✓</span>
        )}
      </div>
    </div>
  );
}

// ── Overlay Modal ─────────────────────────────────────────────────
function OverlayModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="r-overlay-backdrop"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0,    scale: 0.97, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={e => e.stopPropagation()}
        className="r-overlay-panel"
        style={{
          width: "min(750px, 100%)", maxHeight: "calc(100vh - 40px)",
          display: "flex", flexDirection: "column",
          background: C.topbarBg,
          border: `1px solid ${C.red}`,
          borderTop: `3px solid ${C.red}`,
          boxShadow: "8px 8px 0 0 #CC0000",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 22px", background: C.contentBg, borderBottom: `1px solid ${C.darkRed}`, flexShrink: 0, position: "relative" }}>
          <RedBar />
          <span style={{ fontFamily: FM, fontSize: 13, color: C.red, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 12 }}>
            &gt; {project.name} // {project.teamName}
          </span>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            transition={SPRING}
            style={{ width: 20, height: 20, background: C.panelBg, border: `0.5px solid ${C.red}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, flexShrink: 0 }}
          >
            <span style={{ fontFamily: FM, fontSize: 12, fontWeight: 100, color: C.red, lineHeight: 1 }}>×</span>
          </motion.button>
        </div>

        {/* Scrollable body */}
        <div
          className="r-overlay-body"
          style={{ flex: 1, overflowY: "auto", padding: "26px 24px", display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Thumbnail */}
          <div style={{ width: "100%", aspectRatio: "16/9", background: "rgba(200,190,180,0.05)", border: `1px solid ${C.darkRed}`, position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <svg width="100%" height="100%" style={{ position: "absolute" }}>
              <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(204,0,0,0.07)" strokeWidth="1" />
              <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(204,0,0,0.07)" strokeWidth="1" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: FM, fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>[ PROJECT THUMBNAIL ]</span>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <FieldBlock label="PROJECT NAME" value={project.name} />
            <FieldBlock label="TEAM ID"      value={project.teamId} />
            <FieldBlock label="TRACK"        value={project.track} />
          </div>

          <Divider />
          <FieldBlock label="DESCRIPTION" value={project.description} />
          <Divider />
          <FieldBlock label="SHORT PITCH"  value={project.pitch} />
          <Divider />

          {/* Tech stack */}
          <div>
            <div style={{ fontFamily: FM, fontSize: 11, color: C.red, letterSpacing: "0.08em", marginBottom: 10 }}>TECH STACK</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {project.techStack.map(t => (
                <motion.span
                  key={t}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  style={{ padding: "6px 10px", background: "#241818", border: "1px solid #5E1010", fontFamily: FM, fontSize: 12, color: C.red, display: "inline-block", cursor: "default" }}
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <FieldBlock label="GITHUB REPO"  value={project.githubUrl} />
            {project.liveUrl          && <FieldBlock label="LIVE DEMO"  value={project.liveUrl} />}
            <FieldBlock label="PITCH DECK"   value={project.pitchDeckUrl} />
            {project.pitchDeckFileUrl && <FieldBlock label="DECK FILE"  value={project.pitchDeckFileUrl} />}
            {project.videoDemoUrl     && <FieldBlock label="VIDEO DEMO" value={project.videoDemoUrl} />}
          </div>

          <Divider />

          {/* Members */}
          <div>
            <div style={{ fontFamily: FM, fontSize: 11, color: C.red, letterSpacing: "0.08em", marginBottom: 14 }}>TEAM MEMBERS</div>
            {project.members.map((m, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "10px 0" }}>
                  <span style={{ fontFamily: FM, fontSize: 13, color: C.red, minWidth: 26, fontWeight: 700 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ fontFamily: FM, fontSize: 13, color: C.offWhite }}>{m.name}</div>
                    <div style={{ fontFamily: FM, fontSize: 11, color: C.muted2, marginTop: 2, wordBreak: "break-all" }}>{m.email.toUpperCase()}</div>
                  </div>
                </div>
                {i < project.members.length - 1 && <Divider />}
              </div>
            ))}
          </div>

          {project.notes && (
            <>
              <Divider />
              <FieldBlock label="ADDITIONAL NOTES" value={project.notes} muted />
            </>
          )}

          <Divider />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ fontFamily: FM, fontSize: 11, color: C.red, letterSpacing: "0.08em", marginBottom: 5 }}>SUBMITTED AT</div>
              <div style={{ fontFamily: FM, fontSize: 11, color: C.red }}>{fmtDate(project.submittedAt)}</div>
            </div>
            <div>
              <div style={{ fontFamily: FM, fontSize: 11, color: C.red, letterSpacing: "0.08em", marginBottom: 5 }}>LAST UPDATED</div>
              <div style={{ fontFamily: FM, fontSize: 11, color: C.red }}>{fmtDate(project.updatedAt)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: C.contentBg, borderTop: `1px solid ${C.darkRed}`, padding: "12px 22px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
            style={{ height: 32, padding: "0 16px", background: "#1F1F1F", border: `1px solid ${C.offWhite}`, fontFamily: FM, fontSize: 12, color: C.offWhite, cursor: "pointer", letterSpacing: "0.06em" }}
          >
            CLOSE
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
export default function JudgeDashboard() {
  const router = useRouter();
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [overlayProject, setOverlayProject] = useState<Project | null>(null);
  const [activeTrack,    setActiveTrack]    = useState<string>("ALL");
  const [mobileNavOpen,  setMobileNavOpen]  = useState(false);
  const [scores,         setScores]         = useState<Record<string, ScoreEntry>>(
    Object.fromEntries(MOCK_PROJECTS.map(p => [p.id, makeBlankScore()]))
  );

  function updateScore(projectId: string, field: string, value: string) {
    setScores(prev => ({ ...prev, [projectId]: { ...prev[projectId], [field]: value, saved: false } }));
  }
  function saveScore(projectId: string) {
    const s = scores[projectId];
    if (CRITERIA.some(c => isFieldInvalid(s[c.key as CriterionKey], c.max))) return;
    const total = calcLiveTotal(s);
    setScores(prev => ({ ...prev, [projectId]: { ...prev[projectId], saved: true, savedTotal: total } }));
  }

  const projects    = activeTrack === "ALL" ? MOCK_PROJECTS : MOCK_PROJECTS.filter(p => p.track === activeTrack);
  const scoredCount = MOCK_PROJECTS.filter(p => scores[p.id]?.saved).length;

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, display: "flex", flexDirection: "column" }}>
      <style>{RESPONSIVE_CSS}</style>

      {/* ── Topbar ── */}
      <header
        className="r-topbar"
        style={{
          height: 54, background: C.topbarBg,
          borderBottom: `1px solid ${C.red}`,
          boxShadow: "0 2px 16px rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", flexShrink: 0, position: "sticky", top: 0, zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <span style={{ fontFamily: FB, fontSize: 22, color: C.offWhite, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
            HACK<span style={{ color: C.red }}>X</span>JUDGE
          </span>
          <span className="r-topbar-status" style={{ fontFamily: FM, fontSize: 12, color: C.red, margin: "0 10px" }}>|</span>
          <span className="r-topbar-status" style={{ fontFamily: FM, fontSize: 11, color: C.muted, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>COMMAND_CENTER · 2026</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span className="r-topbar-status" style={{ fontFamily: FM, fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>
            SUBMISSION: <span style={{ color: C.red }}>OPEN</span>
          </span>
          <span className="r-topbar-email" style={{ fontFamily: FM, fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>&gt; judge_XX</span>
          <motion.button className="r-topbar-logout" onClick={() => router.push("/judge/login")} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
            style={{ height: 24, padding: "0 10px", background: "transparent", border: `1px solid ${C.red}`, fontFamily: FM, fontSize: 11, color: C.red, cursor: "pointer", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            LOGOUT
          </motion.button>
          <button
            className="r-hamburger"
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            style={{ background: "none", border: `1px solid ${C.muted}`, color: C.muted, width: 32, height: 32, cursor: "pointer", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0, transition: "border-color 0.15s, color 0.15s" }}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <rect y="0" width="16" height="2" rx="1"/>
              <rect y="5" width="16" height="2" rx="1"/>
              <rect y="10" width="16" height="2" rx="1"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div
        className="r-hero"
        style={{ background: C.topbarBg, borderBottom: `1px solid ${C.darkRed}`, padding: "22px 32px 18px", position: "relative", overflow: "hidden", flexShrink: 0 }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(245,240,232,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,0.015) 1px, transparent 1px)`, backgroundSize: "20px 20px", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <span
            className="r-hero-badge"
            style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", background: C.red, color: C.offWhite, fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}
          >
            // MODULE_02 · SCORING
          </span>
          <h1
            className="r-hero-h1"
            style={{ fontFamily: FB, fontSize: 42, lineHeight: "50px", margin: "0 0 10px", color: C.offWhite }}
          >
            PROJECT <span style={{ color: C.red }}>SUBMISSION</span> PORTAL
          </h1>
          <div className="r-hero-meta" style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              { label: "EVENT_DATE", value: "JUN 25, 2026",                vc: C.red      },
              { label: "VENUE",      value: "SIM STUDENT HUB BLK B LVL 1", vc: C.offWhite },
              { label: "DEADLINE",   value: "12:00 SGT",                   vc: C.red      },
            ].map(({ label, value, vc }) => (
              <div key={label}>
                <div style={{ fontFamily: FM, fontSize: 10, color: C.muted, letterSpacing: "0.06em" }}>{label}</div>
                <div style={{ fontFamily: FM, fontSize: 11, color: vc, marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="r-body" style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <aside
          className="r-sidebar"
          style={{ width: 230, flexShrink: 0, background: C.topbarBg, borderRight: `1px solid ${C.darkRed}` }}
        >
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontFamily: FM, fontSize: 10, color: C.muted, paddingLeft: 32, marginBottom: 6, letterSpacing: "0.1em" }}>JUDGING</div>
            <div style={{ background: C.darkRed, borderLeft: `3px solid ${C.red}`, padding: "13px 0 13px 30px" }}>
              <span style={{ fontFamily: FM, fontSize: 12, color: C.white, letterSpacing: "0.06em" }}>◆ SCORE PROJECTS</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Content header */}
          <div
            className="r-content-header"
            style={{ background: C.contentBg, borderBottom: `1px solid ${C.darkRed}`, padding: "18px 28px 16px", position: "relative" }}
          >
            <RedBar />
            <div style={{ fontFamily: FM, fontSize: 13, color: C.red, letterSpacing: "0.06em", marginBottom: 3 }}>&gt; SCORE_PROJECTS</div>
            <div style={{ fontFamily: FM, fontSize: 10, color: C.muted, letterSpacing: "0.06em", marginBottom: 3 }}>// JUDGE VIEW — SCORE APPROVED SUBMISSIONS</div>
            <div style={{ fontFamily: FM, fontSize: 10, color: C.muted, letterSpacing: "0.04em" }}>
              SCORED: <span style={{ color: C.white, fontWeight: 700 }}>{scoredCount}</span> / {MOCK_PROJECTS.length} PROJECTS
            </div>
          </div>

          {/* Project list */}
          <div
            className="r-project-list"
            style={{ background: C.pageBg, flex: 1, padding: "22px 28px" }}
          >
            {/* Track filter */}
            <div
              className="r-filter-bar"
              style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 22 }}
            >
              {TRACKS.map(track => (
                <motion.button
                  key={track}
                  onClick={() => { setActiveTrack(track); setExpandedId(null); }}
                  whileTap={{ y: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    padding: "5px 18px",
                    fontFamily: FM,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    border: "2px solid #1A1A1A",
                    borderRadius: 9999,
                    background: activeTrack === track ? C.red : C.panelBg,
                    color: activeTrack === track ? "#FFFFFF" : "#1A1A1A",
                    boxShadow: activeTrack === track ? "none" : "3px 3px 0 0 #1A1A1A",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {track === "ALL" ? "ALL_TRACKS" : track}
                </motion.button>
              ))}
              <span
                className="r-filter-count"
                style={{ marginLeft: "auto", fontFamily: FM, fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.1em", whiteSpace: "nowrap" as const }}
              >
                {projects.length} RECORDS_FOUND
              </span>
            </div>

            {projects.length === 0 ? (
              <div style={{ fontFamily: FM, fontSize: 12, color: C.muted, textAlign: "center", paddingTop: 40, letterSpacing: "0.06em" }}>
                [ NO APPROVED SUBMISSIONS TO SCORE YET ]
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {projects.map(p => {
                  const score      = scores[p.id];
                  const isExpanded = expandedId === p.id;

                  return (
                    <div key={p.id}>
                      <motion.div
                        className="r-project-row"
                        whileHover={{ boxShadow: SHADOW_LG }}
                        transition={{ duration: 0.15 }}
                        style={{
                          display: "flex", alignItems: "center",
                          background: C.darkRed,
                          borderTop: `0.5px solid ${C.red}`,
                          borderRight: `0.5px solid ${C.red}`,
                          borderBottom: `0.5px solid ${C.red}`,
                          borderLeft: `2px solid ${C.red}`,
                          padding: "12px 16px 12px 15px", gap: 14,
                          boxShadow: SHADOW,
                        }}
                      >
                        <div className="r-project-thumb" style={{ flexShrink: 0 }}>
                          <PlaceholderThumb />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FM, fontSize: 14, color: C.white, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.name}
                          </div>
                          <div style={{ fontFamily: FM, fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: "0.03em" }}>
                            {p.teamName} · {p.category}
                          </div>
                        </div>

                        {/* Actions — wrapped into a group so they move to next row on mobile */}
                        <div className="r-project-actions" style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                          <motion.button
                            onClick={() => setOverlayProject(p)}
                            whileHover={{ scale: 1.04, borderColor: C.red }}
                            whileTap={{ scale: 0.96 }}
                            transition={SPRING}
                            style={{ height: 36, padding: "0 14px", background: C.panelBg, border: `1px solid ${C.offWhite}`, fontFamily: FM, fontSize: 12, color: "#1A1A1A", cursor: "pointer", flexShrink: 0, letterSpacing: "0.06em", transition: "border-color 0.15s" }}
                          >
                            VIEW
                          </motion.button>
                          <motion.button
                            onClick={() => setExpandedId(isExpanded ? null : p.id)}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            transition={SPRING}
                            style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "0 4px", display: "flex", alignItems: "baseline", gap: 1 }}
                          >
                            <span style={{ fontFamily: FM, fontSize: 22, color: score.saved ? C.red : C.offWhite, fontWeight: 700, lineHeight: 1 }}>
                              {score.savedTotal}
                            </span>
                            <span style={{ fontFamily: FM, fontSize: 11, color: C.muted, lineHeight: 1 }}>/100</span>
                          </motion.button>
                        </div>
                      </motion.div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            key={`panel-${p.id}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <ScoringPanel
                              score={score}
                              onChange={(field, value) => updateScore(p.id, field, value)}
                              onSave={() => saveScore(p.id)}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {overlayProject && (
          <OverlayModal project={overlayProject} onClose={() => setOverlayProject(null)} />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 60 }}
              onClick={() => setMobileNavOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                position: "fixed", top: 0, left: 0, height: "100%", width: 280,
                background: C.topbarBg, borderRight: `1px solid ${C.red}`,
                zIndex: 61, display: "flex", flexDirection: "column", overflowY: "auto",
              }}
              aria-label="Mobile navigation"
            >
              {/* Header */}
              <div style={{
                height: 54, padding: "0 20px", flexShrink: 0,
                borderBottom: `1px solid ${C.red}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: FB, fontSize: 20, color: C.offWhite }}>
                  HACK<span style={{ color: C.red }}>X</span>JUDGE
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                  style={{
                    background: "transparent", border: `1px solid ${C.red}`,
                    color: C.red, width: 28, height: 28, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Nav */}
              <div style={{ flex: 1, paddingTop: 20 }}>
                <div style={{ fontFamily: FM, fontSize: 10, color: C.muted, paddingLeft: 32, marginBottom: 6, letterSpacing: "0.1em" }}>JUDGING</div>
                <div
                  style={{ background: C.darkRed, borderLeft: `3px solid ${C.red}`, padding: "13px 0 13px 30px", cursor: "pointer" }}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <span style={{ fontFamily: FM, fontSize: 12, color: C.white, letterSpacing: "0.06em" }}>◆ SCORE PROJECTS</span>
                </div>
              </div>

              {/* Footer — logout */}
              <div style={{ flexShrink: 0, padding: "16px 20px", borderTop: `1px solid #2a2a2a` }}>
                <motion.button
                  onClick={() => router.push("/judge/login")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING}
                  style={{
                    width: "100%", height: 34,
                    background: "transparent", border: `1px solid ${C.red}`,
                    fontFamily: FM, fontSize: 11, color: C.red, cursor: "pointer",
                    letterSpacing: "0.06em", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                  }}
                >
                  LOGOUT
                </motion.button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
