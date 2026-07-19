"use client";

import { IBM_Plex_Mono, Montserrat } from "next/font/google";
import { GUIDE_NFC_TIP } from "@/lib/guide-content";
import GuideNfcAccordion from "./guide-nfc-accordion";
import {
  RED,
  CREAM_BG,
  DARK_BG,
  WHITE,
  SHADOW_RED,
} from "./guide-tokens";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export default function GuideHero() {
  return (
    <section
      className="relative overflow-hidden px-6 sm:px-10 lg:px-12 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-20"
      style={{ backgroundColor: CREAM_BG, fontFamily: "Montserrat, system-ui, sans-serif" }}
    >
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${DARK_BG} 1px, transparent 1px), linear-gradient(90deg, ${DARK_BG} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-7">
          <h1
            className={`${montserrat.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-4`}
            style={{ color: DARK_BG }}
          >
            PARTICIPANT
            <br />
            <span style={{ color: RED }}>GUIDE</span>
          </h1>

          <p
            className={`${ibmPlexMono.className} text-sm sm:text-base lg:text-lg font-medium tracking-wide mb-6`}
            style={{ color: DARK_BG }}
          >
            24–25 Jul · SIM
          </p>
        </div>

        <div id="nfc" className="lg:col-span-5 scroll-mt-24">
          <div
            className="relative w-full border-4 p-5 sm:p-7 lg:p-8 overflow-hidden"
            style={{
              backgroundColor: WHITE,
              borderColor: DARK_BG,
              boxShadow: SHADOW_RED,
              color: DARK_BG,
            }}
          >
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2" style={{ borderColor: RED }} />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2" style={{ borderColor: RED }} />

            <p className={`${ibmPlexMono.className} text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4`} style={{ color: RED }}>
              {"// NFC_LANYARD"}
            </p>

            <div className={`${montserrat.className} text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight mb-6`}>
              About your
              <br />
              <span style={{ color: RED }}>lanyard.</span>
            </div>

            <p
              className="border-t pt-5 mb-5 text-sm sm:text-base font-medium leading-relaxed"
              style={{ borderColor: "#d8d2c5", color: DARK_BG }}
            >
              {GUIDE_NFC_TIP}
            </p>

            <GuideNfcAccordion />
          </div>
        </div>
      </div>
    </section>
  );
}
