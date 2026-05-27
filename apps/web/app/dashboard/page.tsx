"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth-provider";
import {
  Plus, FileText, Eye, BarChart3, Globe, Lock,
  MoreHorizontal, Trash2, Copy, ExternalLink,
  Loader2, QrCode, Layers, TrendingUp,
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
    {
      label: "Total Forms",
      value: dashboard?.totalForms ?? 0,
      icon: FileText,
      suffix: "",
    },
    {
      label: "Total Views",
      value: dashboard?.totalViews ?? 0,
      icon: Eye,
      suffix: "",
    },
    {
      label: "Responses",
      value: dashboard?.totalResponses ?? 0,
      icon: BarChart3,
      suffix: "",
    },
    {
      label: "Avg Conversion",
      value: dashboard ? dashboard.avgConversionRate.toFixed(1) : "0",
      icon: TrendingUp,
      suffix: "%",
    },
  ];

  const visibilityBadge = (v: string) => {
    if (v === "public")
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase"
          style={{
            background: "rgba(88, 116, 92, 0.18)",
            color: "#7EB884",
            border: "1px solid rgba(88,116,92,0.3)",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.1em",
          }}
        >
          <Globe className="w-2.5 h-2.5" /> Public
        </span>
      );
    if (v === "unlisted")
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase"
          style={{
            background: "rgba(200, 155, 99, 0.12)",
            color: "#C89B63",
            border: "1px solid rgba(200,155,99,0.25)",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.1em",
          }}
        >
          <Lock className="w-2.5 h-2.5" /> Unlisted
        </span>
      );
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase"
        style={{
          background: "rgba(255,255,255,0.04)",
          color: "var(--muted-foreground)",
          border: "1px solid rgba(255,255,255,0.07)",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.1em",
        }}
      >
        Draft
      </span>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              color: "var(--muted-foreground)",
              marginBottom: "6px",
            }}
          >
            Studio
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 400,
              color: "var(--foreground)",
              lineHeight: 1.1,
            }}
          >
            Welcome back,{" "}
            <em style={{ color: "#C89B63" }}>
              {user?.fullName?.split(" ")[0]}
            </em>
            .
          </h1>
          <p
            style={{
              marginTop: "6px",
              fontSize: "14px",
              color: "var(--muted-foreground)",
            }}
          >
            Here's an overview of your forms.
          </p>
        </div>

        <Link
          href="/dashboard/forms/new"
          className="ef-btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"
          style={{ flexShrink: 0, marginTop: "4px" }}
        >
          <Plus className="w-4 h-4" />
          New Form
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="ef-card p-5"
            style={{
              animationDelay: `${i * 60}ms`,
              animation: "ef-fade-up .6s cubic-bezier(.2,.7,.2,1) both",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.28em",
                  color: "var(--muted-foreground)",
                }}
              >
                {s.label}
              </span>
              <s.icon
                style={{ width: 14, height: 14, color: "#C89B63", opacity: 0.7 }}
              />
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2rem",
                fontWeight: 400,
                color: "var(--foreground)",
                lineHeight: 1,
              }}
            >
              {s.value}
              <span style={{ fontSize: "1rem", color: "#C89B63" }}>{s.suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="ef-divider mb-8" />

      {/* ── Forms list ── */}
      <div className="ef-card overflow-hidden" style={{ borderRadius: "1rem" }}>
        {/* List header */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              color: "var(--muted-foreground)",
            }}
          >
            Your Forms
          </span>
          <Link
            href="/dashboard/forms/new"
            className="ef-btn-ghost inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
          >
            <Plus className="w-3 h-3" /> New
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            style={{
              padding: "4rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Loader2
              className="animate-spin"
              style={{ width: 20, height: 20, color: "#C89B63" }}
            />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && forms?.length === 0 && (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(200,155,99,0.08)",
                border: "1px solid rgba(200,155,99,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <FileText style={{ width: 22, height: 22, color: "#C89B63" }} />
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.4rem",
                color: "var(--foreground)",
                marginBottom: "0.5rem",
              }}
            >
              No forms yet.
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted-foreground)",
                marginBottom: "1.5rem",
              }}
            >
              Draft your first question. It only takes a minute.
            </p>
            <Link
              href="/dashboard/forms/new"
              className="ef-btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"
            >
              <Plus className="w-4 h-4" /> Begin a form
            </Link>
          </div>
        )}

        {/* Form rows */}
        {!isLoading && forms && forms.length > 0 && (
          <div>
            {forms.map((form, idx) => (
              <div
                key={form.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderBottom:
                    idx < forms.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.025)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "rgba(200,155,99,0.08)",
                    border: "1px solid rgba(200,155,99,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText style={{ width: 15, height: 15, color: "#C89B63" }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      marginBottom: "3px",
                    }}
                  >
                    <Link
                      href={`/dashboard/forms/${form.id}/edit`}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.05rem",
                        color: "var(--foreground)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "260px",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "#C89B63";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--foreground)";
                      }}
                    >
                      {form.title}
                    </Link>
                    {visibilityBadge(form.visibility)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                      fontFamily: "monospace",
                      letterSpacing: "0.04em",
                    }}
                  >
                    <span>{form.responseCount} replies</span>
                    <span>{form.viewCount} views</span>
                    {form.conversionRate > 0 && (
                      <span>{form.conversionRate.toFixed(0)}% conv.</span>
                    )}
                    {form.createdAt && (
                      <span>
                        {formatDistanceToNow(new Date(form.createdAt))} ago
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    flexShrink: 0,
                  }}
                >
                  {form.visibility !== "unpublished" && (
                    <button
                      onClick={() =>
                        setQrForm({ title: form.title, slug: form.slug })
                      }
                      title="Share QR"
                      className="ef-btn-ghost"
                      style={{
                        padding: "7px",
                        borderRadius: "8px",
                        display: "flex",
                        transition: "background 0.15s, color 0.15s",
                      }}
                    >
                      <QrCode style={{ width: 15, height: 15 }} />
                    </button>
                  )}

                  <Link
                    href={`/dashboard/forms/${form.id}/responses`}
                    title="Responses"
                    className="ef-btn-ghost"
                    style={{
                      padding: "7px",
                      borderRadius: "8px",
                      display: "flex",
                    }}
                  >
                    <BarChart3 style={{ width: 15, height: 15 }} />
                  </Link>

                  {/* Dropdown */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === form.id ? null : form.id)
                      }
                      className="ef-btn-ghost"
                      style={{
                        padding: "7px",
                        borderRadius: "8px",
                        display: "flex",
                      }}
                    >
                      <MoreHorizontal style={{ width: 15, height: 15 }} />
                    </button>

                    {openMenu === form.id && (
                      <div
                        className="ef-glass"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "calc(100% + 6px)",
                          width: 200,
                          borderRadius: "12px",
                          padding: "4px",
                          zIndex: 30,
                        }}
                        onClick={() => setOpenMenu(null)}
                      >
                        {[
                          {
                            icon: Layers,
                            label: "Edit & Preview",
                            href: `/dashboard/forms/${form.id}/edit`,
                          },
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={label}
                            href={href}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "13px",
                              color: "var(--foreground)",
                              textDecoration: "none",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background =
                                "rgba(255,255,255,0.05)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background =
                                "transparent";
                            }}
                          >
                            <Icon style={{ width: 14, height: 14, color: "#C89B63" }} />
                            {label}
                          </Link>
                        ))}

                        {form.visibility !== "unpublished" ? (
                          <MenuBtn
                            icon={Lock}
                            label="Unpublish"
                            onClick={() =>
                              unpublishMutation.mutate({ id: form.id })
                            }
                          />
                        ) : (
                          <MenuBtn
                            icon={Globe}
                            label="Publish"
                            onClick={() =>
                              publishMutation.mutate({
                                id: form.id,
                                visibility: "public",
                              })
                            }
                          />
                        )}

                        <MenuBtn
                          icon={Copy}
                          label="Duplicate"
                          onClick={() =>
                            duplicateMutation.mutate({ id: form.id })
                          }
                        />

                        {form.visibility !== "unpublished" && (
                          <>
                            <MenuBtn
                              icon={Copy}
                              label="Copy Link"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  window.location.origin + "/forms/" + form.slug
                                );
                                toast.success("Link copied!");
                              }}
                            />
                            <MenuAnchor
                              icon={ExternalLink}
                              label="Open Form"
                              href={`/forms/${form.slug}`}
                            />
                          </>
                        )}

                        <div
                          style={{
                            margin: "4px 0",
                            borderTop: "1px solid var(--border)",
                          }}
                        />
                        <MenuBtn
                          icon={Trash2}
                          label="Delete"
                          danger
                          onClick={() => {
                            if (
                              confirm(
                                "Delete this form and all its responses?"
                              )
                            )
                              deleteMutation.mutate({ id: form.id });
                          }}
                        />
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

/* ── tiny menu helpers ── */
function MenuBtn({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        color: danger ? "#C05050" : "var(--foreground)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s",
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = danger
          ? "rgba(192,80,80,0.08)"
          : "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <Icon
        style={{
          width: 14,
          height: 14,
          color: danger ? "#C05050" : "#C89B63",
        }}
      />
      {label}
    </button>
  );
}

function MenuAnchor({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        color: "var(--foreground)",
        textDecoration: "none",
        transition: "background 0.15s",
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <Icon style={{ width: 14, height: 14, color: "#C89B63" }} />
      {label}
    </a>
  );
}
