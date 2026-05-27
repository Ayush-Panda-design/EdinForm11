"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import {
  Search,
  FileText,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading } =
    trpc.public.exploreForms.useQuery({
      page,
      limit: 12,
      search: query || undefined,
    });

  const handleSearch = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Atmospheric layers */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />

        <div className="absolute bottom-[-20%] right-[-10%] h-[700px] w-[700px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px)] [background-size:80px_100%]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 border-b border-border/60 px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Brand */}
          <Link
            href="/"
            className="mb-10 inline-flex flex-col items-center"
          >
            <div className="ef-btn-primary flex h-14 w-14 items-center justify-center rounded-2xl">
              <span className="font-display text-xl font-semibold">
                E
              </span>
            </div>

            <div className="mx-auto mt-6 mb-5 h-px w-24 ef-divider" />

            <span className="font-display text-3xl tracking-[-0.04em] text-foreground">
              EdinForm
            </span>
          </Link>

          <h1 className="font-display text-6xl leading-none tracking-[-0.06em] text-foreground md:text-7xl">
            Explore public forms
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Discover forms shared by the community —
            from surveys and applications to creative
            workflows and research collections.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <div className="ef-glass-soft relative flex-1 rounded-2xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search forms, surveys, collections..."
                className="h-14 w-full rounded-2xl bg-transparent pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="ef-btn-primary rounded-2xl px-6 py-3 text-sm font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Content */}
      <section className="relative z-10 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <div className="ef-card flex items-center gap-3 rounded-2xl px-5 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-amber)]" />

                <span className="text-sm text-muted-foreground">
                  Loading public forms…
                </span>
              </div>
            </div>
          ) : data?.data.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card/60 backdrop-blur-xl">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>

              <h2 className="font-display text-4xl tracking-[-0.04em] text-foreground">
                Nothing found
              </h2>

              <p className="mt-4 text-sm text-muted-foreground">
                No public forms found
                {query ? ` for "${query}"` : "."}
              </p>
            </div>
          ) : (
            <>
              {/* Top meta */}
              <div className="mb-10 flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Public collection
                  </p>

                  <h2 className="mt-2 font-display text-4xl tracking-[-0.04em] text-foreground">
                    {data?.total ?? 0} forms discovered
                  </h2>
                </div>

                {query && (
                  <div className="rounded-full border border-border bg-card/40 px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-xl">
                    Search: {query}
                  </div>
                )}
              </div>

              {/* Grid */}
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {data?.data.map((form) => (
                  <Link
                    href={"/forms/" + form.slug}
                    key={form.id}
                    className="ef-card group relative overflow-hidden rounded-[28px] p-7"
                  >
                    {/* Glow */}
                    <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-[rgba(200,155,99,0.06)] blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(200,155,99,0.14)] bg-[rgba(200,155,99,0.08)]">
                        <FileText className="h-5 w-5 text-[var(--accent-amber)]" />
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-3xl leading-tight tracking-[-0.03em] text-foreground transition-colors group-hover:text-[var(--accent-amber)]">
                        {form.title}
                      </h3>

                      {/* Description */}
                      {form.description && (
                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {form.description}
                        </p>
                      )}

                      {/* Divider */}
                      <div className="my-6 h-px ef-divider" />

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          {form.createdAt
                            ? `${formatDistanceToNow(
                                new Date(form.createdAt)
                              )} ago`
                            : "Recently"}
                        </div>

                        <div className="inline-flex items-center gap-2 text-sm text-[var(--accent-amber)] transition-transform duration-300 group-hover:translate-x-1">
                          Open form

                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="mt-14 flex items-center justify-center gap-3">
                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.max(1, p - 1)
                      )
                    }
                    disabled={page === 1}
                    className="ef-btn-ghost rounded-2xl px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <div className="rounded-2xl border border-border bg-card/40 px-5 py-3 text-sm text-muted-foreground backdrop-blur-xl">
                    {page} / {data.totalPages}
                  </div>

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(
                          data.totalPages,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      page === data.totalPages
                    }
                    className="ef-btn-ghost rounded-2xl px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
