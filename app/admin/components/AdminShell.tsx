"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  Circle,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Settings2,
  Sigma,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import styles from "./AdminShell.module.css";

export type AdminMetricTone = "neutral" | "amber" | "emerald" | "red";

export type AdminMetric = {
  key: string;
  label: string;
  value: string;
  helper: string;
  tone: AdminMetricTone;
  suffix?: string;
};

export type AdminShellState = {
  metrics: AdminMetric[];
};

const toneClassNames: Record<AdminMetricTone, string> = {
  neutral: styles.toneNeutral,
  amber: styles.toneAmber,
  emerald: styles.toneEmerald,
  red: styles.toneRed,
};

const defaultShellState: AdminShellState = {
  metrics: [
    {
      key: "total_submissions",
      label: "TOTAL_SUBMISSIONS",
      value: "0",
      helper: "received",
      tone: "neutral",
    },
    {
      key: "pending",
      label: "PENDING",
      value: "0",
      helper: "awaiting review",
      tone: "amber",
    },
    {
      key: "approved",
      label: "APPROVED",
      value: "0",
      helper: "cleared for showcase",
      tone: "emerald",
    },
    {
      key: "rejected",
      label: "REJECTED",
      value: "0",
      helper: "returned to team",
      tone: "red",
    },
    {
      key: "deadline_countdown",
      label: "DEADLINE_COUNTDOWN",
      value: "00.00.00",
      suffix: "s",
      helper: "until close",
      tone: "neutral",
    },
  ],
};

type AdminShellContextValue = {
  state: AdminShellState;
  setShell: (next: Partial<AdminShellState>) => void;
  resetShell: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

function useAdminShellContext() {
  const context = useContext(AdminShellContext);

  if (!context) {
    throw new Error("Admin shell context is unavailable.");
  }

  return context;
}

export function useAdminShell() {
  return useAdminShellContext();
}

export function AdminShellConfig({ value }: { value: Partial<AdminShellState> }) {
  const { setShell, resetShell } = useAdminShellContext();
  const signature = JSON.stringify(value);

  useEffect(() => {
    setShell(JSON.parse(signature) as Partial<AdminShellState>);
    return () => {
      resetShell();
    };
  }, [resetShell, setShell, signature]);

  return null;
}

export function AdminShellProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(defaultShellState);

  const setShell = useCallback((next: Partial<AdminShellState>) => {
    setState((prev) => ({
      ...prev,
      ...next,
      metrics: next.metrics ?? prev.metrics,
    }));
  }, []);

  const resetShell = useCallback(() => {
    setState(defaultShellState);
  }, []);

  const value = useMemo(
    () => ({
      state,
      setShell,
      resetShell,
    }),
    [state, setShell, resetShell],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

const navGroups = [
  {
    heading: "OVERVIEW",
    items: [
      { key: "dashboard", href: "/admin/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
    ],
  },
  {
    heading: "SUBMISSIONS",
    items: [
      { key: "all", href: "/admin/submissions", label: "ALL", icon: List },
      { key: "pending", href: "/admin/submissions/pending", label: "PENDING", icon: Circle },
      { key: "approved", href: "/admin/submissions/approved", label: "APPROVED", icon: Check },
      { key: "rejected", href: "/admin/submissions/rejected", label: "REJECTED", icon: X },
    ],
  },
  {
    heading: "RESULTS",
    items: [
      { key: "results", href: "/admin/results", label: "AGGREGATE SCORES", icon: Sigma },
    ],
  },
  {
    heading: "SYSTEM",
    items: [{ key: "settings", href: "/admin/settings", label: "SETTINGS", icon: Settings2 }],
  },
] as const;

function getActiveNav(pathname: string) {
  if (pathname.startsWith("/admin/submissions/approved")) return "approved";
  if (pathname.startsWith("/admin/submissions/pending")) return "pending";
  if (pathname.startsWith("/admin/submissions/rejected")) return "rejected";
  if (pathname.startsWith("/admin/submissions")) return "all";
  if (pathname.startsWith("/admin/results")) return "results";
  if (pathname.startsWith("/admin/settings")) return "settings";
  return "dashboard";
}

function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${styles.sidebarLink} ${active ? styles.sidebarLinkActive : ""}`}
      onClick={onClick}
    >
      <Icon className={styles.sidebarIcon} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

function MetricCard({ metric }: { metric: AdminMetric }) {
  return (
    <article className={`${styles.metricCard} ${toneClassNames[metric.tone]}`}>
      <div className={styles.metricLabel}>{metric.label}</div>
      <div className={styles.metricValueRow}>
        <span className={styles.metricValue}>{metric.value}</span>
        {metric.suffix ? <span className={styles.metricSuffix}>{metric.suffix}</span> : null}
      </div>
      <div className={styles.metricHelper}>{metric.helper}</div>
    </article>
  );
}

export function AdminShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state } = useAdminShellContext();
  const activeNav = useMemo(() => getActiveNav(pathname), [pathname]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (pathname === "/admin/login" || pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/admin/dashboard" className={styles.brandLink} aria-label="HackX Admin home">
            <span className={styles.brandMark}>
              <span>HACK</span>
              <span className={styles.brandAccent}>X</span>
              <span>ADMIN</span>
            </span>
            <span className={styles.brandDivider} aria-hidden="true" />
            <span className={styles.commandText}>COMMAND_CENTER · 2026</span>
          </Link>

          <div className={styles.topbarRight}>
            <span className={styles.statusText}>
              SUBMISSION: <span className={styles.brandAccent}>STATUS</span>
            </span>
            <span className={styles.handleText}>&gt; admin@simitc</span>
            <button type="button" className={`${styles.topbarButton} ${styles.logoutButton}`}>
              <LogOut className={styles.buttonIcon} aria-hidden="true" />
              <span>LOGOUT</span>
            </button>
            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileNavOpen}
            >
              <Menu className={styles.buttonIcon} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={`${styles.heroTitle} ${styles.displayFont}`}>
            PROJECT <span className={styles.brandAccent}>SUBMISSION</span> PORTAL
          </h1>

          <div className={styles.heroMeta}>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>EVENT_DATE</span>
              <span className={`${styles.metaValue} ${styles.metaAccent}`}>JUN 25, 2026</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>VENUE</span>
              <span className={styles.metaValue}>SIM STUDENT HUB BLK B LVL 1</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>DEADLINE</span>
              <span className={`${styles.metaValue} ${styles.metaAccent}`}>12:00 SGT</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Portal metrics">
        {state.metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </section>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Admin navigation">
          {navGroups.map((group) => (
            <section key={group.heading} className={styles.sidebarGroup}>
              <h2 className={styles.sidebarHeading}>{group.heading}</h2>
              <nav className={styles.navList}>
                {group.items.map((item) => {
                  const isActive = activeNav === item.key;
                  return (
                    <SidebarItem
                      key={item.key}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isActive}
                    />
                  );
                })}
              </nav>
            </section>
          ))}
        </aside>

        <main className={styles.main}>{children}</main>
      </div>

      {/* ── Mobile drawer backdrop ── */}
      <div
        className={`${styles.mobileDrawerBackdrop} ${mobileNavOpen ? styles.mobileDrawerBackdropOpen : ""}`}
        aria-hidden="true"
        onClick={() => setMobileNavOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <nav
        className={`${styles.mobileDrawer} ${mobileNavOpen ? styles.mobileDrawerOpen : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileNavOpen}
      >
        {/* Drawer header */}
        <div className={styles.mobileDrawerHeader}>
          <span className={styles.brandMark}>
            <span>HACK</span>
            <span className={styles.brandAccent}>X</span>
            <span>ADMIN</span>
          </span>
          <button
            type="button"
            className={styles.mobileDrawerClose}
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        {/* Nav groups */}
        <div className={styles.mobileDrawerNav}>
          {navGroups.map((group) => (
            <section key={group.heading} className={styles.sidebarGroup}>
              <h2 className={styles.sidebarHeading}>{group.heading}</h2>
              <nav className={styles.navList}>
                {group.items.map((item) => {
                  const isActive = activeNav === item.key;
                  return (
                    <SidebarItem
                      key={item.key}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isActive}
                      onClick={() => setMobileNavOpen(false)}
                    />
                  );
                })}
              </nav>
            </section>
          ))}
        </div>

        {/* Logout at bottom */}
        <div className={styles.mobileDrawerFooter}>
          <button type="button" className={`${styles.topbarButton} ${styles.logoutButton} ${styles.mobileDrawerLogout}`}>
            <LogOut className={styles.buttonIcon} aria-hidden="true" />
            <span>LOGOUT</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
