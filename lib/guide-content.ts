/** Participant guide copy — lean ops hub at /guide (NFC + day-of, not a second landing). */

export const GUIDE_VENUE = {
  name: "SIM",
  address: "461 Clementi Road, Singapore 599491",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Singapore+Institute+of+Management+461+Clementi+Road",
} as const;

export const GUIDE_CREDITS = [
  {
    id: "azure",
    name: "Azure",
    amount: "US$200",
    blurb: "Microsoft's student program: free Azure credits for 30 days, no card needed. Sign up with your MyMail address.",
    href: "https://azure.microsoft.com/en-us/free/students",
    cta: "Sign up on Azure",
  },
  {
    id: "aws",
    name: "AWS",
    amount: "US$200",
    blurb: "AWS free-tier / student credits you can claim directly from AWS. Ask the crew if you need a hand.",
    href: null,
    cta: null,
  },
  {
    id: "gcp",
    name: "Google Cloud",
    amount: "Credits",
    blurb: "Google Cloud's own free trial / student credits, signed up directly with Google. Ask the crew if unsure.",
    href: null,
    cta: null,
  },
] as const;

export const GUIDE_RULES = [
  {
    title: "Fairness",
    body: "Code during the hackathon only. Brainstorming beforehand is fine.",
  },
  {
    title: "Presence",
    body: "At least one teammate on-site throughout.",
  },
  {
    title: "Timing",
    body: "Finalise by the deadline — no coding after submit.",
  },
  {
    title: "Ethical work",
    body: "No harm, discrimination, or unsafe AI use.",
  },
  {
    title: "Inclusivity",
    body: "Mutual respect. No bullying or abusive behaviour.",
  },
] as const;

export const GUIDE_SUBMISSION = {
  deadline: "Sat 25 Jul · 12:00 PM SGT",
  portalPath: "/submit",
  materials: ["GitHub repo", "Slide deck", "One submit per team"],
} as const;

export const GUIDE_JUDGING = {
  schedule: {
    when: "Sat 25 Jul · 1:00–4:00 PM",
    where: "A.1.20",
  },
  format: [
    "3 minutes presentation",
    "2 minutes Q&A",
  ],
  criteria: [
    { label: "Criteria TBC", note: "Full rubric drops once locked." },
    { label: "Criteria TBC", note: "Weights and categories to be confirmed." },
    { label: "Criteria TBC", note: "Check back here before demo day." },
  ],
} as const;

export const GUIDE_VOTING = {
  schedule: {
    when: "Sat 25 Jul · 1:00–4:00 PM",
    where: "B.5.12/B.5.13 & B.2.07/B.2.08",
  },
  points: [
    { label: "Who votes", body: "TBA — participants / attendees (confirm before event)." },
    { label: "How", body: "TBA — link / QR / on-site flow." },
    { label: "What it affects", body: "TBA — e.g. Community Choice (see prizes on main site)." },
    { label: "Window", body: "Same window as above — exact open/close TBA." },
  ],
} as const;

export const GUIDE_NFC_TIP =
  "Your NFC lanyard opens this participant guide. You can rewrite the card later (e.g. LinkedIn). Save this page URL first so you can always get back during the hackathon.";

export const GUIDE_NFC_REWRITE_STEPS = [
  {
    platform: "iPhone",
    steps: [
      "Open Shortcuts → Automation (or a free NFC writer app from the App Store).",
      "Scan your lanyard tag and choose Write / Encode.",
      "Paste your new URL (e.g. LinkedIn) and save. Your old HackX link is gone once overwritten.",
    ],
  },
  {
    platform: "Android",
    steps: [
      "Install a free NFC Tools / TagWriter app from Play Store.",
      "Tap Write → URL / URI and paste your new link.",
      "Hold the phone to the lanyard until it confirms. Save this guide URL elsewhere first.",
    ],
  },
] as const;

/** Sticky section nav — label + section id must stay in sync with GuideSectionShell ids. */
export const GUIDE_NAV_ITEMS = [
  { label: "Links", id: "links" },
  { label: "Credits", id: "credits" },
  { label: "Mentors", id: "mentoring" },
  { label: "Game", id: "game" },
  { label: "Judging", id: "judging" },
  { label: "Voting", id: "voting" },
] as const;

/** Deep links into the main marketing site — prefer these over cloning copy. */
export const GUIDE_SITE_LINKS = [
  { label: "Timeline", href: "/#timeline" },
  { label: "Tracks", href: "/#tracks" },
  { label: "Prizes", href: "/#prizes" },
  { label: "FAQ", href: "/#faq" },
] as const;

/** Fringe activity — Prompt Relay (synced from ops Notion). */
export const GUIDE_GAME = {
  name: "Prompt Relay",
  schedule: {
    when: "Fri 24 Jul · 6:00–10:00 PM",
    where: "SR B.4.07",
  },
  stats: [
    { value: "30 SEC", label: "Per prompt" },
    { value: "3", label: "Relay rounds" },
    { value: "3–4", label: "Players" },
  ],
  steps: [
    {
      title: "Original image",
      body: "Player 1 sees the original and writes a prompt in under 30s.",
    },
    {
      title: "Image from player 1",
      body: "Player 2 only sees that generated image, then writes their prompt.",
    },
    {
      title: "Image from player 2",
      body: "Player 3 only sees player 2's image and prompts — this is your entry.",
    },
  ],
  teamRule:
    "3 players: one round each. 4 players: two solo rounds + one paired round.",
  scoring:
    "Your final image is judged against the original reference — the closest match wins.",
} as const;

/**
 * Mentoring — 2 venues, 1 mentor each.
 * Each group: 7 mins with mentor + 1 min buffer between slots.
 * Track colours match the ops sheet: Care Forward = red, Friction To Flow = blue.
 */
export type GuideMentorTrack = "Care Forward" | "Friction To Flow";

export type GuideMentorSlot = {
  time: string;
  teamId: number;
  teamName: string;
  track: GuideMentorTrack;
};

export const GUIDE_MENTORING = {
  schedule: {
    when: "Fri 24 Jul · 1:00–2:52 PM",
    where: "SR B.4.07 & SR B.4.08",
  },
  note: "Each group gets 7 mins with your mentor + 1 min buffer in between.",
  venues: [
    {
      id: "venue-roger",
      label: "Venue A",
      room: "SR B.4.07",
      mentor: "Roger Yeo",
      slots: [
        { time: "13:00 – 13:08", teamId: 14, teamName: "Team QuestForge", track: "Friction To Flow" },
        { time: "13:08 – 13:16", teamId: 23, teamName: "HereForFood", track: "Care Forward" },
        { time: "13:16 – 13:24", teamId: 7, teamName: "Debugged", track: "Friction To Flow" },
        { time: "13:24 – 13:32", teamId: 19, teamName: "Among Us", track: "Care Forward" },
        { time: "13:32 – 13:40", teamId: 2, teamName: "67 Duck Hunters", track: "Friction To Flow" },
        { time: "13:40 – 13:48", teamId: 28, teamName: "IDONTKNOW", track: "Care Forward" },
        { time: "13:48 – 13:56", teamId: 11, teamName: "Eleven", track: "Care Forward" },
        { time: "13:56 – 14:04", teamId: 25, teamName: "Vedha", track: "Friction To Flow" },
        { time: "14:04 – 14:12", teamId: 4, teamName: "JJK", track: "Care Forward" },
        { time: "14:12 – 14:20", teamId: 16, teamName: "Ctrl+Alt+Hire+Us", track: "Friction To Flow" },
        { time: "14:20 – 14:28", teamId: 21, teamName: "9+10", track: "Friction To Flow" },
        { time: "14:28 – 14:36", teamId: 9, teamName: "KDP", track: "Friction To Flow" },
        { time: "14:36 – 14:44", teamId: 27, teamName: "🤓", track: "Care Forward" },
        { time: "14:44 – 14:52", teamId: 6, teamName: "Gut Genug", track: "Friction To Flow" },
      ] satisfies GuideMentorSlot[],
    },
    {
      id: "venue-senthamil",
      label: "Venue B",
      room: "SR B.4.08",
      mentor: "Senthamil",
      slots: [
        { time: "13:00 – 13:08", teamId: 18, teamName: "Copilot & Chaos", track: "Care Forward" },
        { time: "13:08 – 13:16", teamId: 12, teamName: "Blue Nova", track: "Friction To Flow" },
        { time: "13:16 – 13:24", teamId: 29, teamName: "SRS", track: "Friction To Flow" },
        { time: "13:24 – 13:32", teamId: 3, teamName: "Group 3", track: "Care Forward" },
        { time: "13:32 – 13:40", teamId: 24, teamName: "Agent Oreo", track: "Friction To Flow" },
        { time: "13:40 – 13:48", teamId: 15, teamName: "谢谢", track: "Friction To Flow" },
        { time: "13:48 – 13:56", teamId: 8, teamName: "BlankOut", track: "Friction To Flow" },
        { time: "13:56 – 14:04", teamId: 26, teamName: "SOS", track: "Care Forward" },
        { time: "14:04 – 14:12", teamId: 5, teamName: "WonderHut", track: "Care Forward" },
        { time: "14:12 – 14:20", teamId: 20, teamName: "PanTechnology", track: "Care Forward" },
        { time: "14:20 – 14:28", teamId: 10, teamName: "abcdefg", track: "Friction To Flow" },
        { time: "14:28 – 14:36", teamId: 17, teamName: "Larping Lords", track: "Care Forward" },
        { time: "14:36 – 14:44", teamId: 22, teamName: "Chief Of Staff", track: "Friction To Flow" },
        { time: "14:44 – 14:52", teamId: 13, teamName: "Syntax Error", track: "Friction To Flow" },
      ] satisfies GuideMentorSlot[],
    },
  ],
} as const;

