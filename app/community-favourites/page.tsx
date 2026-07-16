"use client";

import { useEffect, useMemo, useState } from "react";
import { Bebas_Neue, IBM_Plex_Mono, Montserrat } from "next/font/google";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { fetchCommunityVotingLeaderboard } from "@/lib/client/admin-api";
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

const CREAM = "#f2ede5";
const DARK = "#1d1c17";
const RED = "#c00000";
const WHITE = "#ffffff";

export default function CommunityFavouritesPage() {
  const [leaderboard, setLeaderboard] = useState<CommunityVotingLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cancelled) setLoading(true);
      try {
        const payload = await fetchCommunityVotingLeaderboard();
        if (!cancelled) {
          setLeaderboard(payload.leaderboard);
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load leaderboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const id = window.setInterval(() => {
      void load();
    }, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const podium = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const listRows = useMemo(() => leaderboard.slice(3), [leaderboard]);

  return (
    <main className={`${bodyFont.className} min-h-screen pt-11`} style={{ backgroundColor: CREAM }}>
      <Navbar />

      <section
        className="w-full border-b-4 py-14 shadow-[0px_4px_0px_#c00000]"
        style={{ backgroundColor: DARK, borderColor: DARK }}
      >
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className={`${monoFont.className} text-xs uppercase tracking-[0.2em] text-white/70`}>
            LIVE COMMUNITY FAVOURITES
          </p>
          <h1 className={`${displayFont.className} mt-4 text-5xl uppercase leading-none text-white md:text-7xl`}>
            COMMUNITY <span style={{ color: RED }}>FAVOURITES</span>
          </h1>
          <p className={`${monoFont.className} mx-auto mt-5 max-w-3xl text-xs uppercase tracking-[0.1em] text-white/70`}>
            LIVE VOTE COUNTS FROM APPROVED HACKATHON TEAMS. TOP 3 ARE HIGHLIGHTED BELOW.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {loading ? (
          <div
            className={`${monoFont.className} border px-5 py-4 text-sm uppercase`}
            style={{ borderColor: RED, backgroundColor: WHITE, color: DARK }}
          >
            {"// LOADING LIVE LEADERBOARD..."}
          </div>
        ) : error ? (
          <div
            className={`${monoFont.className} border px-5 py-4 text-sm uppercase`}
            style={{ borderColor: RED, backgroundColor: "rgba(192,0,0,0.06)", color: RED }}
          >
            {"// "}{error}
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              {podium.map((entry, index) => {
                const isLeader = index === 0;
                return (
                  <article
                    key={entry.submissionId}
                    className="relative overflow-hidden border p-6 shadow-[6px_6px_0px_#c00000]"
                    style={{
                      borderColor: RED,
                      backgroundColor: entry.thumbnailUrl ? DARK : WHITE,
                      backgroundImage: entry.thumbnailUrl ? `url(${entry.thumbnailUrl})` : undefined,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      transform: isLeader ? "translateY(-8px)" : "none",
                    }}
                  >
                    {entry.thumbnailUrl ? (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{ backgroundColor: "rgba(29,28,23,0.62)" }}
                      />
                    ) : null}
                    <div className="relative z-10">
                      <div className={`${monoFont.className} flex items-center justify-between text-xs uppercase`}>
                        <span style={{ color: entry.thumbnailUrl ? "#f8d6d6" : RED }}>#{entry.rank}</span>
                        <span style={{ color: entry.thumbnailUrl ? WHITE : DARK }}>{entry.voteCount} votes</span>
                      </div>
                      <h2
                        className={`${displayFont.className} mt-6 uppercase leading-none`}
                        style={{ color: entry.thumbnailUrl ? WHITE : DARK, fontSize: isLeader ? "3.8rem" : "3rem" }}
                      >
                        {entry.teamId}
                      </h2>
                      <p
                        className={`${monoFont.className} mt-4 text-sm uppercase tracking-[0.08em]`}
                        style={{ color: entry.thumbnailUrl ? "rgba(255,255,255,0.82)" : "#6f6a60" }}
                      >
                        {entry.projectName}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <section
              className="mt-10 border shadow-[6px_6px_0px_#1d1c17]"
              style={{ borderColor: DARK, backgroundColor: WHITE }}
            >
              <div
                className={`${monoFont.className} flex items-center justify-between gap-4 border-b px-5 py-4 text-xs uppercase`}
                style={{ borderColor: "rgba(29,28,23,0.14)", color: RED }}
              >
                <span>&gt; FULL STANDINGS</span>
                <span style={{ color: "#6f6a60" }}>{leaderboard.length} APPROVED PROJECTS</span>
              </div>

              <div className="divide-y" style={{ borderColor: "rgba(29,28,23,0.08)" }}>
                {listRows.map((entry) => (
                  <div
                    key={entry.submissionId}
                    className="grid grid-cols-[60px_minmax(0,1fr)_90px] items-center gap-4 px-5 py-4"
                  >
                    <span className={`${monoFont.className} text-sm uppercase`} style={{ color: RED }}>
                      #{entry.rank}
                    </span>
                    <div className="min-w-0">
                      <p className={`${monoFont.className} text-sm uppercase`} style={{ color: DARK }}>
                        {entry.teamId}
                      </p>
                      <p className="mt-1 truncate text-sm" style={{ color: "#6f6a60" }}>
                        {entry.projectName}
                      </p>
                    </div>
                    <span
                      className={`${monoFont.className} justify-self-end text-sm uppercase`}
                      style={{ color: DARK }}
                    >
                      {entry.voteCount} votes
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
