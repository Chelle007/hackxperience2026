"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bebas_Neue, IBM_Plex_Mono, Montserrat } from "next/font/google";
import Navbar from "../components/navbar";
import { fetchCommunityVotingLeaderboard } from "@/lib/client/admin-api";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { CommunityVotingLeaderboardEntry } from "@/lib/types";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const RED = "#c00000";
const WHITE = "#ffffff";
const COUNTDOWN_TARGET_MS = new Date("2026-07-25T16:00:00+08:00").getTime();

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}

export default function CommunityFavouritesPage() {
  const [leaderboard, setLeaderboard] = useState<CommunityVotingLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeUntilDeadline, setTimeUntilDeadline] = useState(() => Math.max(0, COUNTDOWN_TARGET_MS - Date.now()));
  const hasLoadedOnceRef = useRef(false);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load({ showLoading }: { showLoading: boolean }) {
      if (!cancelled && showLoading) setLoading(true);
      try {
        const payload = await fetchCommunityVotingLeaderboard();
        if (!cancelled) {
          setLeaderboard(payload.leaderboard);
          setError("");
          hasLoadedOnceRef.current = true;
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load leaderboard.");
        }
      } finally {
        if (!cancelled && showLoading) setLoading(false);
      }
    }

    const scheduleRefresh = () => {
      if (cancelled) return;
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = window.setTimeout(() => {
        void load({ showLoading: !hasLoadedOnceRef.current });
      }, 250);
    };

    void load({ showLoading: true });
    const countdownId = window.setInterval(() => {
      setTimeUntilDeadline(Math.max(0, COUNTDOWN_TARGET_MS - Date.now()));
    }, 250);

    const channel = supabaseBrowser
      .channel("community_leaderboard")
      .on("broadcast", { event: "leaderboard_updated" }, () => {
        scheduleRefresh();
      })
      .subscribe();

    return () => {
      cancelled = true;
      window.clearInterval(countdownId);
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      void supabaseBrowser.removeChannel(channel);
    };
  }, []);

  const podium = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const podiumDisplay = useMemo(() => {
    const [first, second, third] = podium;
    return [second, first, third].filter(Boolean);
  }, [podium]);
  const listRows = useMemo(() => leaderboard.slice(3), [leaderboard]);

  return (
    <main className={`${bodyFont.className} min-h-screen pt-11`} style={{ backgroundColor: "#050505" }}>
      <Navbar />

      <section
        className="w-full border-b py-14"
        style={{
          background: "linear-gradient(180deg, #0c0c0c 0%, #050505 100%)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={`${monoFont.className} text-xs uppercase tracking-[0.28em] text-white/55`}>
              LIVE RESULTS
            </p>
            <h1
              className={`${displayFont.className} mt-3 text-5xl uppercase italic leading-none md:text-7xl`}
              style={{ color: "#ff2b2b" }}
            >
              LEADERBOARD
            </h1>
          </div>

          <div
            className="w-full max-w-xs rounded-[28px] border px-6 py-5 text-center shadow-[0_0_24px_rgba(255,40,40,0.18)]"
            style={{ borderColor: "rgba(255,43,43,0.4)", backgroundColor: "rgba(14,14,14,0.95)" }}
          >
            <p className={`${monoFont.className} text-[11px] uppercase tracking-[0.22em] text-white/45`}>
              CLOSING IN
            </p>
            <p className={`${displayFont.className} mt-3 text-4xl uppercase leading-none`} style={{ color: "#ff2b2b" }}>
              {formatCountdown(timeUntilDeadline)}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {loading ? (
          <div
            className={`${monoFont.className} rounded-[22px] border px-5 py-4 text-sm uppercase`}
            style={{ borderColor: "rgba(255,43,43,0.35)", backgroundColor: "#0d0d0d", color: WHITE }}
          >
            {"// LOADING LIVE LEADERBOARD..."}
          </div>
        ) : error ? (
          <div
            className={`${monoFont.className} rounded-[22px] border px-5 py-4 text-sm uppercase`}
            style={{ borderColor: RED, backgroundColor: "rgba(192,0,0,0.1)", color: "#ff6868" }}
          >
            {"// "}{error}
          </div>
        ) : (
          <>
            <section
              className="overflow-hidden rounded-[32px] border px-4 py-8 md:px-8"
              style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#070707" }}
            >
              <div className="flex items-end justify-center gap-3 md:gap-6">
                {podiumDisplay.map((entry) => {
                  const isLeader = entry.rank === 1;
                  const isSecond = entry.rank === 2;
                  const heightClass =
                    isLeader
                      ? "h-[21rem] md:h-[24rem]"
                      : isSecond
                        ? "h-[17rem] md:h-[19.5rem]"
                        : "h-[15.75rem] md:h-[18rem]";
                  const glowColor =
                    isLeader
                      ? "0 0 30px rgba(255,214,10,0.28)"
                      : isSecond
                        ? "0 0 24px rgba(210,214,227,0.22)"
                        : "0 0 24px rgba(255,140,58,0.22)";
                  const accent = isLeader ? "#ffd60a" : isSecond ? "#d2d6e3" : "#ff8c3a";
                  const contentClass = isLeader ? "px-3 pb-5 pt-4 md:px-5" : "px-2 pb-3 pt-3 md:px-4 md:pb-4";
                  const thumbClass = isLeader ? "mb-3 h-14 w-14 md:h-16 md:w-16" : "mb-2 h-10 w-10 md:h-12 md:w-12";
                  const teamHeadingClass = isLeader ? "mt-2 text-lg md:text-2xl" : "mt-1 text-sm md:text-lg";
                  const voteValueClass = isLeader ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl";
                  const rankValueClass = isLeader ? "mt-3 text-2xl md:text-3xl" : "mt-2 text-xl md:text-2xl";
                  const votesLabelClass = isLeader ? "mt-1 text-[11px]" : "mt-1 text-[10px]";

                  return (
                    <article
                      key={entry.submissionId}
                      className={`relative flex w-[31%] min-w-0 max-w-[260px] flex-col justify-end overflow-hidden rounded-t-[26px] border ${heightClass}`}
                      style={{
                        borderColor: "rgba(255,255,255,0.12)",
                        backgroundColor: "#101010",
                        boxShadow: glowColor,
                      }}
                    >
                      {entry.thumbnailUrl ? (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${entry.thumbnailUrl})`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                          }}
                        />
                      ) : null}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.72) 50%, rgba(0,0,0,0.9) 100%)",
                        }}
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-24"
                        style={{
                          background: `linear-gradient(180deg, transparent 0%, ${accent}35 100%)`,
                        }}
                      />
                      <div className={`relative z-10 flex h-full flex-col justify-between text-center ${contentClass}`}>
                        <div className="mx-auto">
                          {entry.thumbnailUrl ? (
                            <div
                              className={`mx-auto overflow-hidden rounded-xl border ${thumbClass}`}
                              style={{
                                borderColor: "rgba(255,255,255,0.22)",
                                backgroundImage: `url(${entry.thumbnailUrl})`,
                                backgroundPosition: "center",
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                              }}
                            />
                          ) : null}
                          <p className={`${monoFont.className} text-[10px] uppercase tracking-[0.16em] text-white/70`}>
                            TEAM
                          </p>
                          <h2 className={`${bodyFont.className} line-clamp-2 font-semibold leading-tight text-white ${teamHeadingClass}`}>
                            {entry.teamId}
                          </h2>
                        </div>

                        <div>
                          <p className={`${displayFont.className} leading-none ${voteValueClass}`} style={{ color: accent }}>
                            {entry.voteCount}
                          </p>
                          <p className={`${monoFont.className} uppercase tracking-[0.16em] text-white/65 ${votesLabelClass}`}>
                            VOTES
                          </p>
                          <p className={`${displayFont.className} leading-none ${rankValueClass}`} style={{ color: accent }}>
                            #{entry.rank}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-4 px-1">
                <div>
                  <p className={`${monoFont.className} text-[11px] uppercase tracking-[0.22em] text-white/40`}>
                    FULL STANDINGS
                  </p>
                  <h2 className={`${displayFont.className} mt-1 text-3xl uppercase leading-none text-white md:text-4xl`}>
                    Rankings
                  </h2>
                </div>
                <p className={`${monoFont.className} text-[11px] uppercase tracking-[0.16em] text-white/40`}>
                  {listRows.length} MORE PROJECTS
                </p>
              </div>

              <div className="space-y-3">
                {listRows.map((entry) => {
                  const accent =
                    entry.rank === 1 ? "#ffd60a" : entry.rank === 2 ? "#d2d6e3" : entry.rank === 3 ? "#ff8c3a" : "#ff2b2b";

                  return (
                    <article
                      key={entry.submissionId}
                      className="grid grid-cols-[58px_60px_minmax(0,1fr)_72px] items-center gap-3 rounded-[20px] border px-4 py-3 md:grid-cols-[72px_72px_minmax(0,1fr)_90px] md:px-5 md:py-4"
                      style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(10,10,10,0.92)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      }}
                    >
                      <span
                        className={`${monoFont.className} text-sm uppercase`}
                        style={{ color: entry.rank <= 3 ? accent : "rgba(255,255,255,0.6)" }}
                      >
                        #{entry.rank}
                      </span>
                      <div
                        className="h-12 w-12 overflow-hidden rounded-xl border md:h-14 md:w-14"
                        style={{
                          borderColor: "rgba(255,255,255,0.1)",
                          backgroundColor: "#111111",
                          backgroundImage: entry.thumbnailUrl ? `url(${entry.thumbnailUrl})` : undefined,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                      <div className="min-w-0">
                        <p className={`${bodyFont.className} truncate text-sm font-semibold uppercase text-white md:text-base`}>
                          {entry.teamId}
                        </p>
                        <p className="truncate text-xs md:text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {entry.projectName}
                        </p>
                      </div>
                      <span
                        className={`${displayFont.className} justify-self-end text-3xl uppercase leading-none md:text-4xl`}
                        style={{ color: accent }}
                      >
                        {entry.voteCount}
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
