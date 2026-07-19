"use client";

import Navbar from "../components/navbar";
import Footer from "../components/footer";
import ScrollToTopButton from "../components/ui/scroll-to-top-button";
import Reveal from "../components/ui/reveal";
import GuideHero from "../components/guide/guide-hero";
import GuideStickyNav from "../components/guide/guide-sticky-nav";
import {
  GuideQuickLinks,
  GuideCredits,
  GuideGame,
  GuideMentoring,
  GuideJudging,
  GuideVoting,
} from "../components/guide/guide-body";
import { CREAM_BG } from "../components/guide/guide-tokens";

export default function GuidePage() {
  return (
    <main className="pt-11 min-h-screen" style={{ backgroundColor: CREAM_BG }}>
      <Navbar />
      <GuideHero />
      <GuideStickyNav />

      <Reveal delay={0.03}>
        <GuideQuickLinks />
      </Reveal>
      <Reveal delay={0.03}>
        <GuideCredits />
      </Reveal>
      <Reveal delay={0.03}>
        <GuideMentoring />
      </Reveal>
      <Reveal delay={0.03}>
        <GuideGame />
      </Reveal>
      <Reveal delay={0.03}>
        <GuideJudging />
      </Reveal>
      <Reveal delay={0.03}>
        <GuideVoting />
      </Reveal>

      <Footer />

      <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50">
        <ScrollToTopButton />
      </div>
    </main>
  );
}
