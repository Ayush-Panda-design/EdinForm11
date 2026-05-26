"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth-provider";
import {
  Plus, FileText, Eye, BarChart3, Globe, Lock, MoreHorizontal,
  Trash2, Copy, ExternalLink, Loader2, QrCode, Layers
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { QRShareModal } from "~/components/forms/qr-share-modal";

export default function DashboardPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [qrForm, setQrForm] = useState<{ title: string; slug: string } | null>(null);

  const { data: forms, isLoading } = trpc.forms.list.useQuery({ includeArchived: false });
  const { data: dashboard } = trpc.analytics.dashboard.useQuery(undefined);

  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => { toast.success("Form published!"); utils.forms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => { toast.success("Form unpublished"); utils.forms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { toast.success("Form deleted"); utils.forms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: () => { toast.success("Form duplicated!"); utils.forms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const stats = [
    { label: "Total Forms", value: dashboard?.totalForms ?? 0, icon: FileText, bg: "bg-stone-50 dark:bg-stone-900/20", color: "text-stone-900 dark:text-stone-400" },
    { label: "Total Views", value: dashboard?.totalViews ?? 0, icon: Eye, bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-600 dark:text-blue-400" },
    { label: "Responses", value: dashboard?.totalResponses ?? 0, icon: BarChart3, bg: "bg-green-50 dark:bg-green-900/20", color: "text-green-600 dark:text-green-400" },
    { label: "Avg Conversion", value: dashboard ? `${dashboard.avgConversionRate.toFixed(1)}%` : "0%", icon: BarChart3, bg: "bg-orange-50 dark:bg-orange-900/20", color: "text-orange-600 dark:text-orange-400" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.fullName?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Here's an overview of your forms</p>
        </div>
        <Link href="/dashboard/forms/new"
          className="flex items-center gap-2 bg-gradient-to-r from-stone-900 to-stone-900 text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-stone-200 dark:shadow-stone-900/20">
          <Plus className="w-4 h-4" /> New Form
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Forms list */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Your Forms</h2>
          <Link href="/dashboard/forms/new" className="text-sm text-stone-900 dark:text-stone-400 hover:underline font-medium">
            + Create new
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-stone-900" />
          </div>
        ) : forms?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-50 dark:from-stone-900/20 dark:to-stone-900/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-stone-400 dark:text-stone-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No forms yet. Create your first one!</p>
            <Link href="/dashboard/forms/new"
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-900 transition-colors">
              <Plus className="w-4 h-4" /> Create Form
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {forms?.map((form) => (
              <div key={form.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-100 to-stone-100 dark:from-stone-900/30 dark:to-stone-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-stone-900 dark:text-stone-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={"/dashboard/forms/" + form.id + "/edit"}
                      className="font-medium text-gray-900 dark:text-white hover:text-stone-900 dark:hover:text-stone-400 truncate transition-colors">
                      {form.title}
                    </Link>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      form.visibility === "public"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : form.visibility === "unlisted"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {form.visibility === "public" && <Globe className="w-3 h-3" />}
                      {form.visibility === "unlisted" && <Lock className="w-3 h-3" />}
                      {form.visibility}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-500">
                    <span>{form.responseCount} responses</span>
                    <span>{form.viewCount} views</span>
                    {form.conversionRate > 0 && <span>{form.conversionRate.toFixed(0)}% conversion</span>}
                    {form.createdAt && <span>{formatDistanceToNow(new Date(form.createdAt))} ago</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* QR button */}
                  {form.visibility !== "unpublished" && (
                    <button
                      onClick={() => setQrForm({ title: form.title, slug: form.slug })}
                      className="p-2 text-gray-400 hover:text-stone-900 dark:hover:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/20 rounded-lg transition-colors"
                      title="Share QR">
                      <QrCode className="w-4 h-4" />
                    </button>
                  )}
                  {/* Analytics */}
                  <Link href={"/dashboard/forms/" + form.id + "/responses"}
                    className="p-2 text-gray-400 hover:text-stone-900 dark:hover:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/20 rounded-lg transition-colors"
                    title="View responses">
                    <BarChart3 className="w-4 h-4" />
                  </Link>

                  {/* More menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === form.id ? null : form.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenu === form.id && (
                      <div
                        className="absolute right-0 top-9 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1 z-20"
                        onClick={() => setOpenMenu(null)}>
                        <Link href={"/dashboard/forms/" + form.id + "/edit"}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Layers className="w-4 h-4" /> Edit & Preview
                        </Link>
                        {form.visibility !== "unpublished" ? (
                          <button
                            onClick={() => unpublishMutation.mutate({ id: form.id })}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Lock className="w-4 h-4" /> Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => publishMutation.mutate({ id: form.id, visibility: "public" })}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Globe className="w-4 h-4" /> Publish
                          </button>
                        )}
                        <button
                          onClick={() => duplicateMutation.mutate({ id: form.id })}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Copy className="w-4 h-4" /> Duplicate
                        </button>
                        {form.visibility !== "unpublished" && (
                          <>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(window.location.origin + "/forms/" + form.slug);
                                toast.success("Link copied!");
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <Copy className="w-4 h-4" /> Copy Link
                            </button>
                            <a href={"/forms/" + form.slug} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <ExternalLink className="w-4 h-4" /> Open Form
                            </a>
                          </>
                        )}
                        <hr className="my-1 border-gray-100 dark:border-gray-800" />
                        <button
                          onClick={() => { if (confirm("Delete this form and all its responses?")) deleteMutation.mutate({ id: form.id }); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrForm && (
        <QRShareModal
          open={!!qrForm}
          onClose={() => setQrForm(null)}
          formTitle={qrForm.title}
          formSlug={qrForm.slug}
        />
      )}
    </div>
  );
}
