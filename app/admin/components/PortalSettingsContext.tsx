"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type PortalSettings = {
  submissionsOpen: boolean;
  allowResubmissions: boolean;
};

type PortalSettingsContextValue = PortalSettings & {
  toggleSubmissionsOpen: () => void;
  toggleAllowResubmissions: () => void;
};

const PortalSettingsContext = createContext<PortalSettingsContextValue | null>(null);

export function usePortalSettings() {
  const ctx = useContext(PortalSettingsContext);
  if (!ctx) throw new Error("usePortalSettings must be used inside PortalSettingsProvider");
  return ctx;
}

export function PortalSettingsProvider({ children }: { children: ReactNode }) {
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [allowResubmissions, setAllowResubmissions] = useState(true);

  const toggleSubmissionsOpen = useCallback(() => setSubmissionsOpen((v) => !v), []);
  const toggleAllowResubmissions = useCallback(() => setAllowResubmissions((v) => !v), []);

  const value = useMemo(
    () => ({ submissionsOpen, allowResubmissions, toggleSubmissionsOpen, toggleAllowResubmissions }),
    [submissionsOpen, allowResubmissions, toggleSubmissionsOpen, toggleAllowResubmissions],
  );

  return <PortalSettingsContext.Provider value={value}>{children}</PortalSettingsContext.Provider>;
}
