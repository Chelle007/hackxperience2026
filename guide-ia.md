# HackXperience 2026 — Participant Guide (Website IA)

Planning notes for turning the Notion participant guide into a phone-first website for NFC lanyard merch.

- **Notion (current):** [Participant Guide](https://app.notion.com/p/simitclub/HackXperience-2026-Agentic-Hackathon-Participant-Guide-39cc2b5e1e3280f5aca1c89a5c10c9eb)
- **Style reference:** [hackxperience2026.simitclub.com](https://hackxperience2026.simitclub.com/)
- **Proposed URL:** `https://hackxperience2026.simitclub.com/guide`

---

## Why a website (not Notion on NFC)

The Notion page is too messy for physical merch. An NFC tap is the first inotimpression; it should feel intentional and on-brand.

Issues with the current Notion page:

1. **WIP notes at the top** — internal “Need to add: NFC…” bullets would be the first thing participants see
2. **Incomplete sections** — Judging / showcase / voting half-empty; TOC doesn’t match real headings
3. **Structure feels stacked, not guided** — long welcome + TOC, big red headers, many toggles — weak for phone-first NFC
4. **Polish gaps** — typos, duplicate bullets, empty blocks, broken nesting (Judging inside Submission)

The content is mostly right (dates, registration, prizes, rules, credits). The problem is presentation and completeness before burning the URL onto cards.

---



## Recommendation

**Don’t make a separate site.** Add a **participant hub** on the existing domain, e.g. `/guide` or `/participant`.

Why:

- Same brand, fonts, colors, “terminal” language as the main site
- One place to update after the event
- NFC URL stays short and stable: `https://hackxperience2026.simitclub.com/guide`
- Marketing homepage stays for recruitment; the hub is for people already in



### Match the site style — carefully

Reuse from the main site:

- Dark terminal aesthetic, `//` labels, monospace accents
- Same nav language / CTAs
- Accordion FAQ pattern (good for mobile)

Dial back for a guide:

- Less “STATUS: INITIALIZING…” theatre
- Fewer hero animations
- Prioritize scan speed over vibe

Same family, different job: homepage sells; guide helps people ship.

### Practical stack advice

If the main site is already Next/React on that domain, add a route there. Don’t stand up a second Vercel app unless needed.

Also plan for:

- **Mobile layout first** (NFC ≈ phone)
- **Fast load** (people tap mid-hacking)
- **Stable URL** before batch-writing cards
- Optional: keep Notion as a private ops draft; public = site



### What to avoid

- New random subdomain with a different look
- Dumping the whole Notion page 1:1 into HTML
- NFC → marketing homepage (wrong job)
- Shipping with WIP notes still visible

---



## URL & role


|         |                                                 |
| ------- | ----------------------------------------------- |
| **URL** | `https://hackxperience2026.simitclub.com/guide` |
| **Job** | Phone-first participant hub after NFC tap       |
| **Not** | Recruitment landing (that stays `/`)            |


---



## First viewport (one job)

Keep only:

1. Brand: HackXperience 2026
2. Label: Participant Guide
3. One line: dates + SIM HQ
4. CTA group (primary actions)
5. Tiny NFC line (1 sentence)

**CTA group (max 6):**

- Schedule
- Submit
- Credits
- Rules
- Telegram
- Tracks

No long welcome essay, no TOC wall, no sponsor logos in the first screen.

---



## Section order (below fold)


| #   | Section                 | Keep?                         | Notes                                                                                |
| --- | ----------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| 0   | **NFC card tip**        | Keep (new, short)             | Rewritable; save this link before overwrite; optional “how to rewrite” link/modal    |
| 1   | **Quick links**         | Keep                          | Telegram, main site, submission portal, team forms if still relevant                 |
| 2   | **Event dates & venue** | Keep                          | Pre-event 17 Jul · Main 24–25 Jul · map link                                         |
| 3   | **Schedule**            | Keep if you have real content | Notion TOC lists it but page barely has it — add a real timeline or cut the nav item |
| 4   | **Tracks & theme**      | Keep (curated)                | Don’t dump the full booklet; short theme blurb + link to booklet/PDF if needed       |
| 5   | **Credits & perks**     | Keep                          | Azure / AWS / GCP as cards linking to detail pages or expandables                    |
| 6   | **Prizes**              | Keep                          | Use **website** prize set as truth (incl. Community Choice / Game if confirmed)      |
| 7   | **Submission**          | Keep                          | Link, materials, deadline, one-per-team                                              |
| 8   | **Judging & showcase**  | Keep only what’s real         | Time limit yes; empty “Voting / Showcase format” → hide until written                |
| 9   | **Golden rules**        | Keep                          | Compress to 5 short rules                                                            |
| 10  | **Sponsors**            | Keep (light)                  | Logos + labels; not a long thank-you essay                                           |
| 11  | **Help**                | Keep (new)                    | Telegram + `it@mymail.sim.edu.sg`                                                    |


---



## Stay vs cut (from Notion)



### Keep (clean + rewrite)

- Dates, location, Telegram, website
- Team size 3–4, registration deadline (if still pre-event useful; post-close → demote or remove)
- Credits subpages (Azure / AWS / GCP)
- Prizes (align with [main site](https://hackxperience2026.simitclub.com/))
- Submission link + materials + Sat 25 Jul 12PM
- Judging: showcase, 7+3 mins
- Golden rules (Fairness, Presence, Timing, Ethical, Inclusivity)
- Sponsors: Supported by + title sponsors



### Cut / don’t ship

- Top “Need to add…” WIP bullets (replace with polished NFC tip)
- Long poetic welcome (homepage already does that)
- Side TOC callout that doesn’t match real sections
- Empty blocks / unfinished Voting & Showcase Format shells
- Duplicate team-size bullets
- Broken nested “VI inside V” structure
- Typos / unclear eligibility (“SIMuntudent”) — rewrite once, match FAQ on main site
- Full tracks booklet inline — link out instead



### Decide before build (content blockers)

1. **Schedule:** real timeline on `/guide`, or only link to “drops once locked”?
2. **Tracks:** named (Care Forward / Friction to Flow) vs “revealed at pre-event”? Pick one story.
3. **Registration block:** still needed on NFC day, or only for pre-event?
4. **Community Choice / Game Prize:** on site but weak on Notion — include only if confirmed.

---



## Suggested page skeleton (wireframe)

```
[ sticky mini-nav: Schedule · Submit · Credits · Rules ]

HERO
  HACKXPERIENCE_2026 / PARTICIPANT_GUIDE
  24–25 Jul · SIM HQ
  [Submit] [Telegram] [Credits]
  // Your NFC lanyard opens this page. Save the link before rewriting.

NFC_TIP (compact callout)
QUICK_LINKS
DATES_VENUE
SCHEDULE          ← only if content exists
THEME_TRACKS      ← short + “full booklet” link
CREDITS           ← 3 tiles
PRIZES            ← table or prize cards (match site)
SUBMISSION
JUDGING           ← only confirmed bullets
GOLDEN_RULES
SPONSORS
HELP
```

Match main-site language (`// SECTION`, dark terminal UI) but denser, less animation.

---



## NFC-specific copy (draft)

> **About your NFC lanyard**  
> This card opens the HackXperience participant guide. You can rewrite it later (e.g. LinkedIn). Save this page URL first so you can always get back during the hackathon.

Optional second line: link to a 3-step “How to rewrite (iPhone / Android)” accordion.

---



## What not to duplicate


| Lives on `/` (marketing)                                            | Lives on `/guide` (ops)                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Theme pitch, who should join, past events, org chart, sponsor sales | Schedule, submit, credits how-to, rules, judging format, NFC tip |
| FAQ for undecided joiners                                           | Day-of actions for builders                                      |


Link across; don’t clone the whole homepage into `/guide`.

---



## Ship checklist before writing cards

- [ ] `/guide` live and fast on mobile
- [ ] No WIP / empty sections
- [ ] Prizes + tracks aligned with public site
- [ ] Submission + Telegram work
- [ ] Final URL locked for NFC batch write

---



## Next steps

1. Resolve the four content blockers above
2. Scaffold `/guide` in the existing site repo (same UI system)
3. Optionally write final copy per section before build

