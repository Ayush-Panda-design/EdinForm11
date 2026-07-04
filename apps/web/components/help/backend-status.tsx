"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Loader2, Server } from "lucide-react";
import { env } from "~/env.js";

type RuntimeStatus = {
  status: string;
  neverSleeps: boolean;
  awake: boolean;
  message: string;
  startedAt: string;
  uptimeSeconds: number;
  uptimeHuman: string;
  scheduler: { enabled: boolean; lastExternalPingAt: string | null };
  jobs: Array<{
    name: string;
    lastRunAt: string | null;
    lastSuccessAt: string | null;
    lastError: string | null;
    runCount: number;
    successCount: number;
  }>;
  timestamp: string;
};

function apiBase() {
  return (
    env.NEXT_PUBLIC_API_BASE_URL ??
    (env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc").replace(/\/trpc\/?$/, "")
  );
}

export function BackendStatusCard({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<RuntimeStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch(`${apiBase()}/status`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as RuntimeStatus;
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 30_000);
    return () => clearInterval(id);
  }, []);

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border"
        style={{
          borderColor: "var(--dash-border)",
          background: "var(--dash-card)",
          color: "var(--dash-text)",
        }}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin dash-accent" />
        ) : (
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: status?.awake ? "var(--dash-success)" : "var(--dash-warn)",
              boxShadow: status?.awake
                ? "0 0 0 3px color-mix(in srgb, var(--dash-success) 25%, transparent)"
                : undefined,
            }}
          />
        )}
        {error ? "API offline" : status?.neverSleeps ? "API never sleeps" : "API status"}
        {status?.uptimeHuman ? ` · ${status.uptimeHuman}` : ""}
      </div>
    );
  }

  return (
    <div className="ef-bento">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--dash-accent-soft)", color: "var(--dash-accent)" }}
          >
            <Server className="w-4 h-4" />
          </span>
          <div>
            <p className="text-sm font-semibold dash-text">Backend status</p>
            <p className="text-xs dash-muted">Live health from the API process</p>
          </div>
        </div>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin dash-accent" />
        ) : (
          <span className="kpi-chip">
            <Activity className="w-3 h-3" />
            {status?.awake ? "Awake" : "Warming"}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-500">Could not reach API: {error}</p>
      ) : status ? (
        <div className="space-y-3">
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-2"
            style={{ background: "var(--dash-accent-soft)" }}
          >
            <CheckCircle2 className="w-4 h-4 dash-accent shrink-0" />
            <p className="text-sm dash-text font-medium">
              {status.neverSleeps ? "Never sleeps" : "Online"} — {status.message}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-wider dash-faint">Uptime</dt>
              <dd className="font-semibold dash-text mt-0.5">{status.uptimeHuman}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider dash-faint">Scheduler</dt>
              <dd className="font-semibold dash-text mt-0.5">
                {status.scheduler.enabled ? "Running" : "Starting…"}
              </dd>
            </div>
          </dl>

          <div>
            <p className="text-[10px] uppercase tracking-wider dash-faint mb-2">Jobs</p>
            <ul className="space-y-1.5">
              {status.jobs.map((job) => (
                <li
                  key={job.name}
                  className="flex items-center justify-between text-xs rounded-lg px-2.5 py-2"
                  style={{ background: "var(--dash-bg)" }}
                >
                  <span className="font-medium dash-text capitalize">
                    {job.name.replace("-", " ")}
                  </span>
                  <span className="dash-muted">
                    {job.lastSuccessAt
                      ? `ok · ${new Date(job.lastSuccessAt).toLocaleTimeString()}`
                      : job.lastError
                        ? "error"
                        : "pending"}
                    {" · "}
                    {job.successCount}/{job.runCount} runs
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
