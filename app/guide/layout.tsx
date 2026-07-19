import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Participant Guide",
  description:
    "HackXperience 2026 day-of participant hub: NFC tip, credits, submit checklist, and quick links.",
  alternates: { canonical: "/guide" },
  openGraph: {
    title: "Participant Guide | HackXperience 2026",
    description:
      "NFC tip, cloud credits, submit checklist, and help — tracks/prizes/FAQ live on the main site.",
    url: "/guide",
  },
};

export default function GuideLayout({ children }: { children: ReactNode }) {
  return children;
}
