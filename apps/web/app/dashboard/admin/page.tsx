"use client";

import { useState } from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  Loader2, Users, FileText, BarChart3, Globe, Trash2,
  Search, ShieldCheck, ShieldOff, ChevronLeft, ChevronRight,
  RefreshCw
} from "lucide-react";
import { useAuth } from "~/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AdminTab = "overview" | "users" | "forms";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [formSearch, setFormSearch] = useState("");
  const [formPage, setFormPage] = useState(1);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.getStats.useQuery();
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.listUsers.useQuery(
    { page: userPage, limit: 20, search: userSearch || undefined },
    { enabled: tab === "users" }
  );
  const { data: formsData, isLoading: formsLoading, refetch: refetchForms } = trpc.admin.listForms.useQuery(
    { page: formPage, limit: 20, search: formSearch || undefined },
    { enabled: tab === "forms" }
  );

  const setRoleMutation = trpc.admin.setUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); refetchUsers(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteFormMutation = trpc.admin.deleteForm.useMutation({
    onSuccess: () => { toast.success("Form deleted"); refetchForms(); refetchStats(); },
    onError: (e) => toast.error(e.message),
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center">
          <ShieldOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-stone-900" /> Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage all users and forms platform-wide</p>
        </div>
        <button onClick={() => { refetchStats(); refetchUsers(); refetchForms(); }}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {([
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "users", label: "Users", icon: Users },
          { id: "forms", label: "All Forms", icon: FileText },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW ===== */}
      {tab === "overview" && (
        <div className="space-y-4">
          {statsLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-stone-900" /></div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "Total Forms", value: stats.totalForms, icon: FileText, color: "text-stone-900", bg: "bg-stone-50 dark:bg-stone-900/20" },
                { label: "Published Forms", value: stats.publishedForms, icon: Globe, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
                { label: "Total Responses", value: stats.totalResponses, icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
            <strong>Admin tip:</strong> Use the Users tab to promote/demote admins, or the Forms tab to view and delete any form on the platform.
          </div>
        </div>
      )}

      {/* ===== USERS ===== */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500 text-sm"
              />
            </div>
          </div>

          {usersLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-stone-900" /></div>
          ) : usersData ? (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Role</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Forms</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Joined</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {usersData.data.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-500 to-stone-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {u.fullName[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{u.fullName}</p>
                                <p className="text-xs text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              u.role === "admin"
                                ? "bg-stone-100 dark:bg-stone-900/30 text-stone-900 dark:text-stone-300"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            }`}>
                              {u.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : null}
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.formCount}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {u.id !== user.id && (
                              <button
                                onClick={() => {
                                  const newRole = u.role === "admin" ? "creator" : "admin";
                                  if (confirm(`${newRole === "admin" ? "Promote" : "Demote"} ${u.fullName} to ${newRole}?`)) {
                                    setRoleMutation.mutate({ id: u.id, role: newRole });
                                  }
                                }}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                                  u.role === "admin"
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600"
                                    : "bg-stone-50 dark:bg-stone-900/20 text-stone-900 dark:text-stone-300 hover:bg-stone-100"
                                }`}
                              >
                                {u.role === "admin" ? "Demote" : "Make Admin"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{usersData.total} users total</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>Page {userPage} of {usersData.totalPages}</span>
                  <button onClick={() => setUserPage(p => Math.min(usersData.totalPages, p + 1))} disabled={userPage >= usersData.totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ===== FORMS ===== */}
      {tab === "forms" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={formSearch}
                onChange={e => { setFormSearch(e.target.value); setFormPage(1); }}
                placeholder="Search forms by title..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500 text-sm"
              />
            </div>
          </div>

          {formsLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-stone-900" /></div>
          ) : formsData ? (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Form</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {formsData.data.map((f) => (
                        <tr key={f.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{f.title}</p>
                              <p className="text-xs text-gray-400 font-mono">/{f.slug}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              f.visibility === "public"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : f.visibility === "unlisted"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            }`}>
                              {f.visibility}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a href={`/forms/${f.slug}`} target="_blank"
                                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                View
                              </a>
                              <button
                                onClick={() => {
                                  if (confirm(`Permanently delete "${f.title}"? This cannot be undone.`)) {
                                    deleteFormMutation.mutate({ id: f.id });
                                  }
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formsData.total} forms total</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setFormPage(p => Math.max(1, p - 1))} disabled={formPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>Page {formPage} of {formsData.totalPages}</span>
                  <button onClick={() => setFormPage(p => Math.min(formsData.totalPages, p + 1))} disabled={formPage >= formsData.totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
