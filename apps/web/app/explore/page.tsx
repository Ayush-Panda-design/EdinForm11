"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Search, FileText, Loader2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PublicShell } from "~/components/layout/public-shell";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading } = trpc.public.exploreForms.useQuery({
    page,
    limit: 12,
    search: query || undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  return (
    <PublicShell
      title="Explore public forms"
      subtitle="Discover surveys, applications, and creative workflows shared by the community."
    >
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl mx-auto"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forms, surveys, collections..."
            className="ef-input w-full rounded-xl pl-11 pr-4 py-3 text-sm"
          />
        </div>
        <button type="submit" className="ef-btn-primary rounded-xl px-6 py-3 text-sm shrink-0">
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="ef-card flex items-center gap-3 rounded-xl px-5 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--signal-accent)]" />
            <span className="text-sm text-muted-foreground">Loading public forms…</span>
          </div>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Nothing found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No public forms{query ? ` for "${query}"` : ""}.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                Public collection
              </p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">{data?.total ?? 0} forms</h2>
            </div>
            {query && (
              <span className="text-xs uppercase tracking-wider text-muted-foreground border border-[var(--border)] rounded-full px-4 py-2">
                Search: {query}
              </span>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data?.data.map((form) => (
              <Link href={"/forms/" + form.slug} key={form.id} className="public-card group block">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.08)]">
                  <FileText className="h-4 w-4 text-[var(--signal-accent)]" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-[var(--signal-accent)] transition-colors">
                  {form.title}
                </h3>
                {form.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {form.description}
                  </p>
                )}
                <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {form.createdAt
                      ? `${formatDistanceToNow(new Date(form.createdAt))} ago`
                      : "Recently"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--signal-accent)] font-medium group-hover:translate-x-0.5 transition-transform">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="ef-btn-ghost rounded-xl px-5 py-2.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground px-4">
                {page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="ef-btn-ghost rounded-xl px-5 py-2.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </PublicShell>
  );
}
