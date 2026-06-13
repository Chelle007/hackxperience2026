"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShellConfig, type AdminMetric } from "../components/AdminShell";
import { type AdminSubmission } from "@/lib/types";
import { fetchAdminSubmissions } from "@/lib/client/admin-api";
import ActivityLogsClient from "./activity-logs/ActivityLogsClient";

type DashboardState = "empty" | "populated";

const emptySubmissions: AdminSubmission[] = [];

function buildMetrics(submissions: AdminSubmission[]): AdminMetric[] {
  const pending  = submissions.filter((s) => s.status === "pending").length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const rejected = submissions.filter((s) => s.status === "rejected").length;

  return [
    { key: "total_submissions",  label: "TOTAL_SUBMISSIONS",  value: String(submissions.length), helper: "received",              tone: "neutral"  },
    { key: "pending",            label: "PENDING",            value: String(pending),            helper: "awaiting review",        tone: "amber"    },
    { key: "approved",           label: "APPROVED",           value: String(approved),           helper: "cleared for showcase",   tone: "emerald"  },
    { key: "rejected",           label: "REJECTED",           value: String(rejected),           helper: "returned to team",       tone: "red"      },
    { key: "deadline_countdown", label: "DEADLINE_COUNTDOWN", value: "00.00.00.00",              helper: "until close",            tone: "neutral"  },
  ];
}

export default function DashboardClient({ initialState }: { initialState: DashboardState }) {
  const [data, setData] = useState<AdminSubmission[]>(emptySubmissions);
  const shellMetrics = useMemo(() => buildMetrics(data), [data]);

  useEffect(() => {
    if (initialState === "empty") return;
    void (async () => {
      try {
        const payload = await fetchAdminSubmissions();
        setData(payload.submissions);
      } catch {
        // Metrics stay at 0 on fetch error — non-critical.
      }
    })();
  }, [initialState]);

  return (
    <>
      <AdminShellConfig value={{ metrics: shellMetrics }} />
      <ActivityLogsClient />
    </>
  );
}
