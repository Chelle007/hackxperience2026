"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView, useReducedMotion, useMotionValue, useTransform, animate } from "framer-motion";
import { HACKATHON_MAIN_TRACKS } from "@/lib/hackathon-content";
import { BRUTAL_EASE, HoverLift, RevealItem } from "./ui/motion-ui";

const RED = "#c00000";
const DARK_BG = "#1d1c17";
const CREAM_BG = "#f2ede5";
const CREAM_CARD = "#e7e2da";
const WHITE = "#ffffff";

const DISTRIBUTION = [
  {
    name: HACKATHON_MAIN_TRACKS[0].name,
    emoji: HACKATHON_MAIN_TRACKS[0].emoji,
    teams: 14,
    percent: 48,
    fill: RED,
  },
  {
    name: HACKATHON_MAIN_TRACKS[1].name,
    emoji: HACKATHON_MAIN_TRACKS[1].emoji,
    teams: 15,
    percent: 52,
    fill: DARK_BG,
  },
] as const;

const TOTAL_TEAMS = DISTRIBUTION.reduce((sum, t) => sum + t.teams, 0);

function CountUp({
  value,
  suffix = "",
  duration = 1.1,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const controls = animate(mv, value, { duration, ease: BRUTAL_EASE });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, value, duration, reduceMotion, mv, rounded]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function VerticalBar({
  percent,
  fill,
  delay = 0,
}: {
  percent: number;
  fill: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div
      ref={ref}
      className="relative w-full h-44 sm:h-52 md:h-56 border-2 overflow-hidden"
      style={{ borderColor: DARK_BG, backgroundColor: CREAM_CARD }}
      role="img"
      aria-label={`${percent}% of teams`}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {[25, 50, 75].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 right-0 border-t border-dashed"
            style={{
              bottom: `${tick}%`,
              borderColor: "rgba(29, 28, 23, 0.18)",
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 origin-bottom"
        style={{ backgroundColor: fill }}
        initial={reduceMotion ? false : { height: "0%" }}
        animate={inView || reduceMotion ? { height: `${percent}%` } : { height: "0%" }}
        transition={{ duration: 1.05, ease: BRUTAL_EASE, delay }}
      />
    </div>
  );
}

function TrackColumn({
  track,
  index,
}: {
  track: (typeof DISTRIBUTION)[number];
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6 md:p-8">
      <div>
        <p
          className="font-mono text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: RED }}
        >
          {`// TRACK ${index + 1}`}
        </p>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none" aria-hidden>
            {track.emoji}
          </span>
          <h3
            className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight"
            style={{ color: DARK_BG }}
          >
            {track.name}
          </h3>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <motion.p
          className="font-black text-4xl sm:text-5xl tracking-tight leading-none"
          style={{ color: track.fill === RED ? RED : DARK_BG }}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: BRUTAL_EASE, delay: index * 0.12 + 0.15 }}
        >
          <CountUp value={track.percent} suffix="%" duration={1} />
        </motion.p>
        <p
          className="font-mono text-[10px] uppercase font-bold tracking-[0.18em]"
          style={{ color: DARK_BG, opacity: 0.45 }}
        >
          of field
        </p>
      </div>

      <VerticalBar percent={track.percent} fill={track.fill} delay={index * 0.12} />

      <div>
        <p
          className="font-mono text-[10px] uppercase font-bold tracking-[0.18em] mb-1"
          style={{ color: DARK_BG, opacity: 0.55 }}
        >
          Teams locked in
        </p>
        <p className="text-4xl sm:text-5xl font-black tracking-tight leading-none" style={{ color: DARK_BG }}>
          <CountUp value={track.teams} duration={0.9} />
        </p>
      </div>
    </div>
  );
}

function ComparisonStrip() {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const left = DISTRIBUTION[0];
  const right = DISTRIBUTION[1];

  return (
    <div
      ref={ref}
      className="flex h-12 sm:h-14 w-full border-t-2"
      style={{ borderColor: DARK_BG }}
      role="img"
      aria-label="48% Care Forward, 52% Friction To Flow"
    >
      <motion.div
        className="h-full flex items-center px-4 sm:px-5 overflow-hidden"
        style={{ backgroundColor: left.fill, color: WHITE }}
        initial={reduceMotion ? false : { flexBasis: "0%", width: "0%" }}
        animate={
          inView || reduceMotion
            ? { flexBasis: `${left.percent}%`, width: `${left.percent}%` }
            : { flexBasis: "0%", width: "0%" }
        }
        transition={{ duration: 1.1, ease: BRUTAL_EASE, delay: 0.2 }}
      >
        <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase whitespace-nowrap">
          {left.emoji} {left.percent}%
        </span>
      </motion.div>
      <motion.div
        className="h-full flex items-center justify-end px-4 sm:px-5 overflow-hidden"
        style={{ backgroundColor: right.fill, color: WHITE }}
        initial={reduceMotion ? false : { flexBasis: "0%", width: "0%" }}
        animate={
          inView || reduceMotion
            ? { flexBasis: `${right.percent}%`, width: `${right.percent}%` }
            : { flexBasis: "0%", width: "0%" }
        }
        transition={{ duration: 1.1, ease: BRUTAL_EASE, delay: 0.32 }}
      >
        <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase whitespace-nowrap">
          {right.percent}% {right.emoji}
        </span>
      </motion.div>
    </div>
  );
}

const TrackDistribution: React.FC = () => {
  return (
    <section
      id="distribution"
      className="w-full py-20 md:py-24 scroll-mt-11"
      style={{ fontFamily: "Montserrat", backgroundColor: CREAM_BG }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 md:px-12">
        <div className="mb-10 md:mb-12">
          <div
            className="inline-block px-3 py-1.5 font-mono uppercase text-[10px] md:text-xs tracking-widest font-bold mb-5"
            style={{ backgroundColor: RED, color: WHITE }}
          >
            {"// LIVE FIELD"}
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-4"
            style={{ color: DARK_BG }}
          >
            Team Tracks Distribution
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed opacity-80 font-medium max-w-xl"
            style={{ color: DARK_BG }}
          >
            How the floor split across the two tracks — nearly even, both sides packed.
          </p>
        </div>

        <RevealItem>
          <HoverLift
            className="overflow-hidden"
            style={{
              backgroundColor: WHITE,
              border: `2px solid ${DARK_BG}`,
              boxShadow: `12px 12px 0px 0px ${RED}`,
            }}
            lift={-4}
          >
            {/* Card header */}
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 md:px-8 py-4 md:py-5 border-b-2"
              style={{ borderColor: DARK_BG, backgroundColor: DARK_BG }}
            >
              <p className="font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase" style={{ color: RED }}>
                {"// TRACK SPLIT · SIDE BY SIDE"}
              </p>
              <p className="font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white">
                TOTAL · <CountUp value={TOTAL_TEAMS} /> TEAMS
              </p>
            </div>

            {/* Side-by-side charts */}
            <div className="grid md:grid-cols-2 md:divide-x-2 md:divide-[#1d1c17]">
              {DISTRIBUTION.map((track, index) => (
                <div
                  key={track.name}
                  className={index === 0 ? "border-b-2 border-[#1d1c17] md:border-b-0" : ""}
                >
                  <TrackColumn track={track} index={index} />
                </div>
              ))}
            </div>

            <ComparisonStrip />
          </HoverLift>
        </RevealItem>
      </div>
    </section>
  );
};

export default TrackDistribution;
