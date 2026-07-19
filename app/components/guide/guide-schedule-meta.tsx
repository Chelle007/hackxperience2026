"use client";

import { Clock, MapPin } from "lucide-react";
import { IBM_Plex_Mono } from "next/font/google";
import { MUTED, RED } from "./guide-tokens";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type GuideScheduleMetaProps = {
  when: string;
  where: string;
};

export default function GuideScheduleMeta({ when, where }: GuideScheduleMetaProps) {
  return (
    <div className={`${ibmPlexMono.className} mt-1 space-y-2 text-sm lg:text-base font-medium tracking-wide`} style={{ color: MUTED }}>
      <p className="flex items-start gap-2">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} aria-hidden />
        <span>{when}</span>
      </p>
      <p className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} aria-hidden />
        <span>{where}</span>
      </p>
    </div>
  );
}
