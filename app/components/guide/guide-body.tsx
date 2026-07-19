"use client";

import Link from "next/link";
import { IBM_Plex_Mono } from "next/font/google";
import {
  GUIDE_CREDITS,
  GUIDE_GAME,
  GUIDE_JUDGING,
  GUIDE_MENTORING,
  GUIDE_SITE_LINKS,
  GUIDE_VOTING,
} from "@/lib/guide-content";
import { HoverLift, RevealItem, RevealStagger } from "../ui/motion-ui";
import {
  GuideSectionLabel,
  GuideSectionShell,
  GuideSectionTitle,
  GuideSectionIntro,
} from "./guide-section";
import GuideScheduleMeta from "./guide-schedule-meta";
import {
  RED,
  CREAM_CARD,
  DARK_BG,
  WHITE,
  MUTED,
  TEXT_DIM,
  SHADOW_SM,
  SHADOW_RED,
} from "./guide-tokens";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function GuideQuickLinks() {
  const links: { label: string; href: string; external?: boolean }[] = [
    { label: "Telegram", href: "https://t.me/+GHOgsfbhI-0zOTll", external: true },
    { label: "Submit portal", href: "/submit" },
    ...GUIDE_SITE_LINKS.map((l) => ({ label: l.label, href: l.href })),
  ];

  return (
    <GuideSectionShell id="links">
      <GuideSectionIntro>
        <GuideSectionLabel>QUICK_LINKS</GuideSectionLabel>
        <GuideSectionTitle>Jump in</GuideSectionTitle>
        <p className="text-sm font-medium" style={{ color: MUTED }}>
          Day-of actions here. Tracks, prizes, timeline, and full FAQ live on the main site.
        </p>
      </GuideSectionIntro>
      <RevealStagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4" stagger={0.05}>
        {links.map((link) => (
          <RevealItem key={link.label}>
            <HoverLift lift={-3}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${ibmPlexMono.className} flex items-center justify-between gap-3 border-2 px-4 py-3.5 lg:py-4 text-xs font-bold uppercase tracking-widest h-full`}
                  style={{ borderColor: DARK_BG, backgroundColor: CREAM_CARD, color: DARK_BG, boxShadow: SHADOW_SM }}
                >
                  <span>{link.label}</span>
                  <span style={{ color: RED }}>→</span>
                </a>
              ) : (
                <Link
                  href={link.href}
                  className={`${ibmPlexMono.className} flex items-center justify-between gap-3 border-2 px-4 py-3.5 lg:py-4 text-xs font-bold uppercase tracking-widest h-full`}
                  style={{ borderColor: DARK_BG, backgroundColor: CREAM_CARD, color: DARK_BG, boxShadow: SHADOW_SM }}
                >
                  <span>{link.label}</span>
                  <span style={{ color: RED }}>→</span>
                </Link>
              )}
            </HoverLift>
          </RevealItem>
        ))}
      </RevealStagger>
    </GuideSectionShell>
  );
}

export function GuideCredits() {
  return (
    <GuideSectionShell id="credits">
      <GuideSectionIntro>
        <GuideSectionLabel>CREDITS</GuideSectionLabel>
        <GuideSectionTitle>Free cloud credits</GuideSectionTitle>
        <p className="text-sm lg:text-base font-medium" style={{ color: MUTED }}>
          Heads up: these aren&apos;t provided by us — they&apos;re public student / free-tier
          programs you can sign up for yourself. Just a tip on where to grab infra before
          you need it mid-hack.
        </p>
      </GuideSectionIntro>
      <RevealStagger className="grid sm:grid-cols-3 gap-4 lg:gap-6" stagger={0.06}>
        {GUIDE_CREDITS.map((credit) => (
          <RevealItem key={credit.id}>
            <HoverLift
              className="h-full p-5 lg:p-7 flex flex-col"
              style={{ backgroundColor: DARK_BG, color: WHITE, boxShadow: SHADOW_RED }}
            >
              <p className={`${ibmPlexMono.className} text-[10px] font-bold tracking-widest uppercase`} style={{ color: RED }}>
                {`// ${credit.name}`}
              </p>
              <div className="text-2xl lg:text-3xl font-black mt-2 mb-3">{credit.amount}</div>
              <p className="text-sm leading-relaxed flex-1" style={{ color: TEXT_DIM }}>
                {credit.blurb}
              </p>
              {credit.href && credit.cta ? (
                <a
                  href={credit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${ibmPlexMono.className} mt-4 inline-flex text-[11px] font-bold uppercase tracking-widest underline underline-offset-4`}
                  style={{ color: RED }}
                >
                  {credit.cta} ↗
                </a>
              ) : (
                <p className={`${ibmPlexMono.className} mt-4 text-[10px] tracking-widest uppercase`} style={{ color: MUTED }}>
                  {"// Sign up directly with the provider"}
                </p>
              )}
            </HoverLift>
          </RevealItem>
        ))}
      </RevealStagger>
    </GuideSectionShell>
  );
}

export function GuideGame() {
  const game = GUIDE_GAME;

  return (
    <GuideSectionShell id="game">
      <GuideSectionIntro>
        <GuideSectionLabel>GAME</GuideSectionLabel>
        <GuideSectionTitle>{game.name}</GuideSectionTitle>
        <GuideScheduleMeta when={game.schedule.when} where={game.schedule.where} />
      </GuideSectionIntro>

      <div
        className="border-2 p-5 lg:p-7"
        style={{ borderColor: DARK_BG, backgroundColor: WHITE, boxShadow: SHADOW_SM }}
      >
        <p
          className={`${ibmPlexMono.className} text-xs sm:text-sm font-bold tracking-wide uppercase`}
          style={{ color: DARK_BG }}
        >
          <span style={{ color: RED }}>Goal:</span> Relay prompts down the line and
          land as close to the original image as you can.
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 my-6">
          {game.stats.map((stat) => (
            <div
              key={stat.label}
              className="p-3 sm:p-4 text-center"
              style={{ backgroundColor: CREAM_CARD }}
            >
              <p className="text-xl sm:text-2xl font-black" style={{ color: RED }}>
                {stat.value}
              </p>
              <p
                className={`${ibmPlexMono.className} mt-1 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase`}
                style={{ color: MUTED }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {game.steps.map((step, index) => (
            <div
              key={step.title}
              className="relative border-2 p-4"
              style={{ borderColor: DARK_BG }}
            >
              <p
                className={`${ibmPlexMono.className} text-[10px] font-bold tracking-widest`}
                style={{ color: RED }}
              >
                {`0${index + 1}`}
              </p>
              <h3 className="mt-2 text-base font-black uppercase" style={{ color: DARK_BG }}>
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED }}>
                {step.body}
              </p>
              {index < game.steps.length - 1 ? (
                <span
                  className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 px-1 text-lg font-black"
                  style={{ color: RED, backgroundColor: WHITE }}
                  aria-hidden
                >
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div
          className="grid md:grid-cols-2 gap-5 mt-4 p-4 sm:p-5"
          style={{ backgroundColor: DARK_BG, color: WHITE }}
        >
          <div>
            <p
              className={`${ibmPlexMono.className} text-[10px] font-bold tracking-widest uppercase`}
              style={{ color: RED }}
            >
              {"// Team format"}
            </p>
            <p className="mt-2 text-sm" style={{ color: TEXT_DIM }}>
              {game.teamRule}
            </p>
          </div>
          <div>
            <p
              className={`${ibmPlexMono.className} text-[10px] font-bold tracking-widest uppercase`}
              style={{ color: RED }}
            >
              {"// How to win"}
            </p>
            <p className="mt-2 text-sm" style={{ color: TEXT_DIM }}>
              {game.scoring}
            </p>
          </div>
        </div>
      </div>
    </GuideSectionShell>
  );
}

export function GuideMentoring() {
  return (
    <GuideSectionShell id="mentoring">
      <GuideSectionIntro>
        <GuideSectionLabel>MENTORING</GuideSectionLabel>
        <GuideSectionTitle>Mentor slots</GuideSectionTitle>
        <GuideScheduleMeta when={GUIDE_MENTORING.schedule.when} where={GUIDE_MENTORING.schedule.where} />
      </GuideSectionIntro>

      <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
        {GUIDE_MENTORING.venues.map((venue) => (
          <div
            key={venue.id}
            className="border-2 p-5 lg:p-6 flex flex-col"
            style={{ borderColor: DARK_BG, backgroundColor: WHITE, boxShadow: SHADOW_SM }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <div>
                <p className={`${ibmPlexMono.className} text-[10px] font-bold tracking-widest uppercase mb-1`} style={{ color: RED }}>
                  {`// ${venue.label}`}
                </p>
                <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: DARK_BG }}>
                  {venue.room}
                </h3>
              </div>
              <p className={`${ibmPlexMono.className} text-[11px] font-bold tracking-widest uppercase`} style={{ color: MUTED }}>
                {venue.mentor}
              </p>
            </div>

            <div className="border-t pt-4 space-y-3" style={{ borderColor: "#d8d2c5" }}>
              {venue.slots.map((slot, i) => (
                <div
                  key={`${venue.id}-${i}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className={`${ibmPlexMono.className} text-[11px] font-bold tracking-widest`} style={{ color: RED }}>
                    {slot.time}
                  </span>
                  <span className="text-right font-medium" style={{ color: MUTED }}>
                    {slot.team}
                  </span>
                </div>
              ))}
            </div>

            <p className={`${ibmPlexMono.className} mt-5 text-[10px] tracking-widest uppercase`} style={{ color: MUTED }}>
              {"// Slot list updates once assignments are locked"}
            </p>
          </div>
        ))}
      </div>
    </GuideSectionShell>
  );
}

/** Judging — timed pitch (not booth showcase); criteria placeholders until locked. */
export function GuideJudging() {
  return (
    <GuideSectionShell id="judging">
      <GuideSectionIntro>
        <GuideSectionLabel>JUDGING</GuideSectionLabel>
        <GuideSectionTitle>Judging</GuideSectionTitle>
        <GuideScheduleMeta when={GUIDE_JUDGING.schedule.when} where={GUIDE_JUDGING.schedule.where} />
      </GuideSectionIntro>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="border-2 p-5 lg:p-6" style={{ borderColor: DARK_BG, backgroundColor: WHITE, boxShadow: SHADOW_SM }}>
          <p className={`${ibmPlexMono.className} text-[10px] font-bold tracking-widest uppercase mb-3`} style={{ color: RED }}>
            {"// Format"}
          </p>
          <ul className="space-y-3">
            {GUIDE_JUDGING.format.map((line) => (
              <li key={line} className="flex gap-2 text-sm font-medium" style={{ color: DARK_BG }}>
                <span style={{ color: RED }} aria-hidden>
                  ›
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 lg:p-6" style={{ backgroundColor: DARK_BG, color: WHITE, boxShadow: SHADOW_RED }}>
          <p className={`${ibmPlexMono.className} text-[10px] font-bold tracking-widest uppercase mb-3`} style={{ color: RED }}>
            {"// Criteria"}
          </p>
          <ul className="space-y-4">
            {GUIDE_JUDGING.criteria.map((item, i) => (
              <li key={`${item.label}-${i}`}>
                <p className="text-sm font-black uppercase tracking-tight">{item.label}</p>
                <p className="mt-1 text-sm" style={{ color: TEXT_DIM }}>
                  {item.note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GuideSectionShell>
  );
}

export function GuideVoting() {
  return (
    <GuideSectionShell id="voting">
      <GuideSectionIntro>
        <GuideSectionLabel>VOTING</GuideSectionLabel>
        <GuideSectionTitle>Community voting</GuideSectionTitle>
        <GuideScheduleMeta when={GUIDE_VOTING.schedule.when} where={GUIDE_VOTING.schedule.where} />
      </GuideSectionIntro>

      <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
        {GUIDE_VOTING.points.map((point) => (
          <div
            key={point.label}
            className="border-2 p-5"
            style={{ borderColor: DARK_BG, backgroundColor: WHITE, boxShadow: SHADOW_SM }}
          >
            <p className={`${ibmPlexMono.className} text-[10px] font-bold tracking-widest uppercase mb-2`} style={{ color: RED }}>
              {`// ${point.label}`}
            </p>
            <p className="text-sm font-medium" style={{ color: DARK_BG }}>
              {point.body}
            </p>
          </div>
        ))}
      </div>
    </GuideSectionShell>
  );
}
