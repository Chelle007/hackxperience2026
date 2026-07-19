"use client";

import type { ReactNode } from "react";
import { IBM_Plex_Mono, Montserrat } from "next/font/google";
import { RED, DARK_BG, WHITE } from "./guide-tokens";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export function GuideSectionLabel({ children }: { children: string }) {
  return (
    <div
      className={`${ibmPlexMono.className} inline-block px-3 py-1.5 uppercase text-[10px] md:text-xs tracking-widest font-bold mb-4`}
      style={{ backgroundColor: RED, color: WHITE }}
    >
      {children.startsWith("//") ? children : `// ${children}`}
    </div>
  );
}

export function GuideSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className={`${montserrat.className} text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black uppercase tracking-tight mb-3`}
      style={{ color: DARK_BG }}
    >
      {children}
    </h2>
  );
}

export function GuideSectionShell({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`w-full py-12 sm:py-16 lg:py-20 px-6 sm:px-10 lg:px-12 scroll-mt-24 ${className}`}
      style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
    >
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

/** Optional two-column section intro for desktop breathing room. */
export function GuideSectionIntro({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl mb-8 lg:mb-10">
      {children}
    </div>
  );
}
