"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Search, FileText, Loader2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-900 py-20 px-4 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-stone-200 hover:text-white transition-colors">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-stone-50 dark:text-stone-900 font-bold text-sm">E</span>
          </div>
          EdinForm
        </Link>
        <h1 className="text-4xl font-bold text-white mb-4">Explore Public Forms</h1>
        <p className="text-stone-200 max-w-md mx-auto mb-8">Discover forms created by the community. Fill them out or use them as inspiration.</p>
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search forms..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50" />
          </div>
          <button type="submit" className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors">Search</button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-stone-900" /></div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No public forms found{query ? ` for "${query}"` : ""}.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-600 dark:text-gray-400">
                {data?.total ?? 0} public forms {query && `matching "${query}"`}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data.map((form) => (
                <Link href={"/forms/" + form.slug} key={form.id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-stone-200 dark:hover:border-stone-900 transition-all fc-card-hover">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-100 to-stone-100 dark:from-stone-900/30 dark:to-stone-900/30 flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5 text-stone-900 dark:text-stone-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-stone-900 dark:group-hover:text-stone-400 transition-colors mb-2">
                    {form.title}
                  </h3>
                  {form.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{form.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    {form.createdAt && <span>{formatDistanceToNow(new Date(form.createdAt))} ago</span>}
                    <span className="flex items-center gap-1 text-stone-900 dark:text-stone-400 font-medium">
                      Fill out <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{page} / {data.totalPages}</span>
                <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
