"use client";

import { useEffect, useRef, useState } from "react";
import { IBM_Plex_Mono } from "next/font/google";
import { GUIDE_NAV_ITEMS } from "@/lib/guide-content";
import { CREAM_BG, DARK_BG, RED, WHITE } from "./guide-tokens";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function GuideStickyNav() {
  const [active, setActive] = useState<string>(GUIDE_NAV_ITEMS[0]?.id ?? "");
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Position-based active tracking. Picks the last section whose top has
  // crossed the sticky bars — works for both short and tall sections
  // (intersectionRatio skips tall ones like Mentors / Game).
  useEffect(() => {
    const ids = GUIDE_NAV_ITEMS.map((item) => item.id);

    const onScroll = () => {
      // Line just below the navbar (44px) + this sticky nav bar.
      const line = 120;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }

      // Snap to the last item once the page is scrolled near the bottom.
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
      setActive(nearBottom ? ids[ids.length - 1] : current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Keep the active chip visible in the horizontal sticky bar (esp. on phone).
  useEffect(() => {
    if (!active) return;
    btnRefs.current[active]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`${ibmPlexMono.className} sticky top-11 z-40 border-b-2 backdrop-blur-sm`}
      style={{ backgroundColor: `${CREAM_BG}f2`, borderColor: `${DARK_BG}18` }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 flex items-center gap-1 lg:gap-2 overflow-x-auto py-2.5 lg:py-3 scrollbar-none">
        {GUIDE_NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              ref={(el) => {
                btnRefs.current[item.id] = el;
              }}
              onClick={() => scrollTo(item.id)}
              className="shrink-0 px-3 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              style={{
                backgroundColor: isActive ? RED : "transparent",
                color: isActive ? WHITE : DARK_BG,
              }}
            >
              [{item.label}]
            </button>
          );
        })}
      </div>
    </div>
  );
}
