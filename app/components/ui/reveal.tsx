"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  /** Optional stagger delay in seconds. */
  delay?: number;
  className?: string;
}

/**
 * Scroll-into-view reveal. Children fade and rise into place the first time
 * they enter the viewport. Honours `prefers-reduced-motion` by rendering the
 * content statically. Kept intentionally subtle to suit the brutalist look.
 */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
