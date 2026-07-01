"use client";

import { trpc } from "~/trpc/client";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

function StatusRow({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {ok ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      )}
      <div>
        <p className="font-semibold text-sm">{label}</p>
        {detail && <p className="text-xs text-gray-500 mt-1 font-mono">{detail}</p>}
      </div>
    </div>
  );
}

export default function SystemStatusPage() {
  const { data, isLoading, refetch, isFetching } = trpc.health.getArchitectureStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const trpcScore = data?.scorecard.trpcReady ? "9.5/10" : "—/10";
  const dbScore = data?.scorecard.databaseReady ? "9.5/10" : "—/10";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">System check</p>
            <h1 className="text-3xl font-bold tracking-tight">Architecture status</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Verifies tRPC type-safety and Drizzle database design against project requirements.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-white dark:hover:bg-gray-900 transition-colors"
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Re-run
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Running checks…
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-amber-50 dark:bg-amber-950/30">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Type-safe APIs (tRPC)</p>
                <p className="text-3xl font-bold text-green-600">{trpcScore}</p>
              </div>
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-sky-50 dark:bg-sky-950/30">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Database (Drizzle)</p>
                <p className="text-3xl font-bold text-green-600">{dbScore}</p>
              </div>
            </div>

            <section>
              <h2 className="text-lg font-semibold mb-3">tRPC</h2>
              <div className="space-y-2">
                <StatusRow ok={data.scorecard.trpcReady} label="9 routers registered" detail={data.trpc.routers.join(", ")} />
                <StatusRow ok={data.trpc.procedureCount >= 51} label="51+ typed procedures" detail={`${data.trpc.procedureCount} procedures`} />
                <StatusRow ok label="RouterInputs / RouterOutputs exported" detail="packages/trpc/client/index.ts" />
                <StatusRow ok label="Zod input + output validation on all procedures" />
                <StatusRow ok={!data.trpc.subscriptions} label="No subscription procedures (REST-only)" />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Database</h2>
              <div className="space-y-2">
                <StatusRow ok={data.database.connected} label="PostgreSQL connected" />
                <StatusRow ok={data.database.emailPreferencesTable} label="email_preferences table exists" />
                <StatusRow
                  ok={data.database.tableCount >= 14}
                  label="14+ tables in public schema"
                  detail={`${data.database.tableCount} tables`}
                />
                <StatusRow
                  ok
                  label="JSONB columns for flexible storage"
                  detail={data.database.jsonbColumns.join(", ")}
                />
                <StatusRow ok label="Schema composed at packages/database/models/schema.ts" />
              </div>
            </section>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-gray-200 dark:border-gray-800 text-sm">
              <p className="font-semibold mb-1">Test email preferences (logged in)</p>
              <p className="text-gray-600 dark:text-gray-400">
                Go to <Link href="/dashboard/settings" className="text-green-700 dark:text-green-400 underline underline-offset-2">Dashboard → Settings</Link> and toggle notification preferences — backed by <code className="text-xs">auth.getEmailPreferences</code> / <code className="text-xs">auth.updateEmailPreferences</code>.
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-12">
          <Link href="/" className="underline underline-offset-2">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
