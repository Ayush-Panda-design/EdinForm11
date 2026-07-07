"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
  Globe,
  Lock,
  Eye,
  Save,
  QrCode,
  Layers,
  CalendarClock,
  Hash,
  Pencil,
  Check,
  Shield,
  BookOpen,
  FolderPlus,
} from "lucide-react";
import { FormPreviewModal } from "~/components/forms/form-preview-modal";
import { QRShareModal } from "~/components/forms/qr-share-modal";
import { EmbedSharePanel } from "~/components/forms/embed-share-panel";
import { HelpTip } from "~/components/help/help-tip";
import {
  ConditionalLogicEditor,
  type ConditionalLogic,
} from "~/components/forms/conditional-logic-editor";
import { DndFieldList } from "~/components/forms/dnd-field-list";
import { ValidationRulesEditor } from "~/components/forms/validation-rules-editor";
import { FormField as PreviewField, type FieldOption } from "~/components/forms/field-renderer";
import type { ValidationRules } from "@repo/types/forms";
import { Lock as LockIcon, Unlock } from "lucide-react";
import { formatApiError } from "~/lib/format-api-error";

type EditorFormField = {
  id: string;
  formId: string;
  pageId: string | null;
  type: string;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  order: number;
  options: FieldOption[] | null;
  validationRules: Record<string, unknown> | null;
  conditionalLogic: ConditionalLogic | null;
  isLocked: boolean;
};

type FieldSaveUpdates = {
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: FieldOption[];
  conditionalLogic?: ConditionalLogic;
  validationRules?: ValidationRules;
};

type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "single_select"
  | "multi_select"
  | "checkbox"
  | "date"
  | "rating";
const FIELD_TYPES: { value: FieldType; label: string; icon: string }[] = [
  { value: "short_text", label: "Short Text", icon: "Aa" },
  { value: "long_text", label: "Long Text", icon: "¶" },
  { value: "email", label: "Email", icon: "@" },
  { value: "number", label: "Number", icon: "#" },
  { value: "single_select", label: "Single Select", icon: "◉" },
  { value: "multi_select", label: "Multi Select", icon: "☑" },
  { value: "checkbox", label: "Checkbox", icon: "✓" },
  { value: "date", label: "Date", icon: "📅" },
  { value: "rating", label: "Rating", icon: "★" },
];

type ActiveTab = "fields" | "settings" | "limits" | "pages" | "password";

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const utils = trpc.useUtils();

  const [tab, setTab] = useState<ActiveTab>("fields");
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [unlockFlashFieldId, setUnlockFlashFieldId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMultiStep, setPreviewMultiStep] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [multiStepMode, setMultiStepMode] = useState(true);

  // Settings state
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [maxResponses, setMaxResponses] = useState<string>("");
  const [closeAfterDate, setCloseAfterDate] = useState<string>("");
  const [submitButtonText, setSubmitButtonText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [allowMultipleResponses, setAllowMultipleResponses] = useState(true);
  const [notifyCreator, setNotifyCreator] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Password state
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Pages state
  const [newPageTitle, setNewPageTitle] = useState("");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState("");

  const { data: form, isLoading } = trpc.forms.getById.useQuery({ id });
  const { data: themes } = trpc.themes.list.useQuery();

  useEffect(() => {
    if (form && !settingsLoaded) {
      setMaxResponses(form.maxResponses ? String(form.maxResponses) : "");
      setCloseAfterDate(
        form.closeAfterDate ? new Date(form.closeAfterDate).toISOString().slice(0, 16) : "",
      );
      setSubmitButtonText(form.submitButtonText ?? "");
      setSuccessMessage(form.successMessage ?? "");
      setShowProgressBar(form.showProgressBar ?? true);
      setAllowMultipleResponses(form.allowMultipleResponses ?? true);
      setNotifyCreator(form.notifyCreatorOnSubmission ?? true);
      setWebhookUrl(form.webhookUrl ?? "");
      setDigestEnabled(form.digestEnabled ?? false);
      setSelectedThemeId(form.themeId ?? null);
      setSettingsLoaded(true);
    }
  }, [form, settingsLoaded]);

  const showError = (message: string, description?: string) => {
    toast.error(formatApiError(message), description ? { description } : undefined);
  };

  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success("Form published!");
      utils.forms.getById.invalidate({ id });
    },
    onError: (e) => showError(e.message),
  });
  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Unpublished");
      utils.forms.getById.invalidate({ id });
    },
    onError: (e) => showError(e.message),
  });
  const updateMutation = trpc.forms.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved!");
      utils.forms.getById.invalidate({ id });
      setSettingsSaving(false);
    },
    onError: (e) => {
      showError(e.message);
      setSettingsSaving(false);
    },
  });
  const addFieldMutation = trpc.forms.addField.useMutation({
    onSuccess: (data) => {
      toast.success("Field added!");
      utils.forms.getById.invalidate({ id });
      if (data?.id) setExpandedField(data.id);
    },
    onError: (e) => showError(e.message),
  });
  const updateFieldMutation = trpc.forms.updateField.useMutation({
    onSuccess: () => {
      toast.success("Field updated!");
      utils.forms.getById.invalidate({ id });
    },
    onError: (e) => showError(e.message),
  });
  const deleteFieldMutation = trpc.forms.deleteField.useMutation({
    onSuccess: () => {
      toast.success("Field removed");
      utils.forms.getById.invalidate({ id });
    },
    onError: (e) => showError(e.message),
  });
  const reorderFieldsMutation = trpc.forms.reorderFields.useMutation({
    onError: (e) =>
      toast.error("Couldn't reorder questions", { description: formatApiError(e.message) }),
  });
  const lockFieldMutation = trpc.forms.lockField.useMutation({
    onSuccess: () => {
      toast.success("Question locked", {
        description: "This field is protected from edits while locked.",
      });
      utils.forms.getById.invalidate({ id });
    },
    onError: (e) => showError(e.message),
  });
  const unlockFieldMutation = trpc.forms.unlockField.useMutation({
    onSuccess: (_, vars) => {
      setUnlockFlashFieldId(vars.fieldId);
      setExpandedField(vars.fieldId);
      window.setTimeout(() => setUnlockFlashFieldId(null), 2800);
      toast.success("Question unlocked", {
        description: "You can edit this field now — look for the green highlight on the canvas.",
      });
      utils.forms.getById.invalidate({ id });
    },
    onError: (e) => showError(e.message),
  });

  const setPasswordMutation = trpc.forms.setPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.isPasswordProtected ? "Password set!" : "Password removed");
      utils.forms.getById.invalidate({ id });
      setPasswordInput("");
      setPasswordConfirm("");
      setPasswordSaving(false);
    },
    onError: (e) => {
      showError(e.message);
      setPasswordSaving(false);
    },
  });

  const { data: pages, refetch: refetchPages } = trpc.forms.listPages.useQuery({ id });
  const addPageMutation = trpc.forms.addPage.useMutation({
    onSuccess: () => {
      toast.success("Page added!");
      refetchPages();
      setNewPageTitle("");
    },
    onError: (e) => showError(e.message),
  });
  const updatePageMutation = trpc.forms.updatePage.useMutation({
    onSuccess: () => {
      toast.success("Page updated");
      refetchPages();
      setEditingPageId(null);
    },
    onError: (e) => showError(e.message),
  });
  const deletePageMutation = trpc.forms.deletePage.useMutation({
    onSuccess: () => {
      toast.success("Page deleted");
      refetchPages();
      utils.forms.getById.invalidate({ id });
    },
    onError: (e) => showError(e.message),
  });
  const assignFieldToPageMutation = trpc.forms.assignFieldToPage.useMutation({
    onSuccess: () => {
      utils.forms.getById.invalidate({ id });
    },
    onError: (e) => showError(e.message),
  });

  const handleUnlockField = (fieldId: string) => {
    unlockFieldMutation.mutate({ formId: id, fieldId });
  };

  const handleReorder = useCallback(
    (newOrder: Array<{ fieldId: string; order: number }>) => {
      reorderFieldsMutation.mutate({ formId: id, fieldOrders: newOrder });
    },
    [id, reorderFieldsMutation],
  );

  const handleSaveSettings = () => {
    setSettingsSaving(true);
    updateMutation.mutate({
      id,
      maxResponses: maxResponses ? parseInt(maxResponses) : undefined,
      closeAfterDate: closeAfterDate ? new Date(closeAfterDate).toISOString() : undefined,
      submitButtonText: submitButtonText || undefined,
      successMessage: successMessage || undefined,
      showProgressBar,
      allowMultipleResponses,
      notifyCreatorOnSubmission: notifyCreator,
      webhookUrl: webhookUrl.trim(),
      digestEnabled,
      themeId: selectedThemeId ?? undefined,
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin dash-accent" />
      </div>
    );
  if (!form) return <div className="p-12 text-center dash-muted">Form not found</div>;

  const sortedFields = [...(form.fields ?? [])].sort((a, b) => a.order - b.order);
  const selectedField = sortedFields.find((f) => f.id === expandedField) ?? null;

  const quickAddField = (type: FieldType) => {
    const meta = FIELD_TYPES.find((t) => t.value === type);
    setTab("fields");
    setExpandedField(null);
    addFieldMutation.mutate({
      formId: id,
      type,
      label: meta?.label ?? "New question",
      required: false,
      order: form.fields?.length ?? 0,
      options:
        type === "single_select" || type === "multi_select"
          ? [
              { value: "option_1", label: "Option 1" },
              { value: "option_2", label: "Option 2" },
            ]
          : undefined,
    });
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col bg-[var(--dash-bg)]">
      {/* Builder top bar */}
      <header
        className="flex items-center gap-3 px-3 sm:px-4 h-14 border-b shrink-0"
        style={{
          background: "var(--dash-surface)",
          borderColor: "var(--dash-border)",
        }}
      >
        <Link
          href="/dashboard"
          className="ef-btn-ghost w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-sm font-medium dash-text truncate">{form.title}</h1>
            <HelpTip
              section={tab === "settings" ? "builderSettings" : "builder"}
              className="shrink-0"
            />
          </div>
          <p className="text-[11px] dash-faint truncate">
            {form.visibility === "public"
              ? "Public"
              : form.visibility === "unlisted"
                ? "Unlisted"
                : "Draft"}{" "}
            · /{form.slug}
          </p>
        </div>

        <nav
          className="hidden md:flex items-center gap-0.5 p-0.5 rounded-full"
          style={{ background: "var(--dash-accent-soft)" }}
        >
          {(
            [
              { id: "fields", label: "Build" },
              { id: "settings", label: "Settings" },
              { id: "limits", label: "Limits" },
              { id: "pages", label: "Pages" },
              { id: "password", label: "Password" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: tab === t.id ? "var(--dash-card)" : "transparent",
                color: tab === t.id ? "var(--dash-text)" : "var(--dash-muted)",
                boxShadow: tab === t.id ? "var(--dash-shadow)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setPreviewMultiStep(multiStepMode);
              setShowPreview(true);
            }}
            className="ef-btn-ghost rounded-full px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          {form.visibility !== "unpublished" && (
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="ef-btn-ghost w-9 h-9 rounded-full inline-flex items-center justify-center"
              title="QR code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
          {form.visibility === "unpublished" ? (
            <button
              type="button"
              onClick={() => publishMutation.mutate({ id, visibility: "public" })}
              disabled={publishMutation.isPending}
              className="ef-btn-primary rounded-full px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5"
            >
              {publishMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              Publish
            </button>
          ) : (
            <button
              type="button"
              onClick={() => unpublishMutation.mutate({ id })}
              disabled={unpublishMutation.isPending}
              className="ef-btn-ghost rounded-full px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Unpublish
            </button>
          )}
        </div>
      </header>

      {/* Mobile tab strip */}
      <div
        className="md:hidden flex gap-1 px-2 py-2 overflow-x-auto border-b shrink-0"
        style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface)" }}
      >
        {(
          [
            { id: "fields", label: "Build" },
            { id: "settings", label: "Settings" },
            { id: "limits", label: "Limits" },
            { id: "pages", label: "Pages" },
            { id: "password", label: "Password" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{
              background: tab === t.id ? "var(--dash-accent-soft)" : "transparent",
              color: tab === t.id ? "var(--dash-accent)" : "var(--dash-muted)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== BUILD: 3-column editor ===== */}
      {tab === "fields" && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[200px_1fr_320px]">
          {/* Left: field palette */}
          <aside
            className="hidden lg:flex flex-col border-r overflow-y-auto"
            style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface)" }}
          >
            <div className="px-3 py-3 border-b" style={{ borderColor: "var(--dash-border)" }}>
              <p className="text-xs font-medium dash-text">Add field</p>
              <p className="text-[11px] dash-faint mt-0.5">Click to insert</p>
            </div>
            <div className="p-2 space-y-0.5">
              {FIELD_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => quickAddField(t.value)}
                  disabled={addFieldMutation.isPending}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm transition-colors hover:bg-[var(--dash-accent-soft)]"
                >
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{
                      background: "var(--dash-accent-soft)",
                      color: "var(--dash-accent)",
                    }}
                  >
                    {t.icon}
                  </span>
                  <span className="dash-text text-sm">{t.label}</span>
                </button>
              ))}
            </div>
            <div
              className="mt-auto p-3 border-t space-y-2"
              style={{ borderColor: "var(--dash-border)" }}
            >
              <label className="flex items-center justify-between gap-2 text-xs dash-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> One question at a time
                </span>
                <button
                  type="button"
                  onClick={() => setMultiStepMode(!multiStepMode)}
                  className="relative w-9 h-5 rounded-full"
                  style={{
                    background: multiStepMode ? "var(--dash-accent)" : "var(--dash-border)",
                  }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: multiStepMode ? "18px" : "2px" }}
                  />
                </button>
              </label>
              <Link
                href={`/dashboard/forms/${id}/responses`}
                className="block text-xs dash-accent hover:underline"
              >
                Responses →
              </Link>
              <Link
                href={`/dashboard/forms/${id}/analytics`}
                className="block text-xs dash-accent hover:underline"
              >
                Analytics →
              </Link>
            </div>
          </aside>

          {/* Center: canvas */}
          <section
            className="min-h-0 overflow-y-auto p-4 sm:p-6"
            style={{ background: "var(--dash-bg)" }}
          >
            <div className="max-w-xl mx-auto">
              <div
                className="rounded-xl border p-5 mb-4"
                style={{
                  background: "var(--dash-card)",
                  borderColor: "var(--dash-border)",
                  boxShadow: "var(--dash-shadow)",
                }}
              >
                <p className="text-lg font-medium dash-text">{form.title}</p>
                {form.description && <p className="text-sm dash-muted mt-1">{form.description}</p>}
                <p className="text-xs dash-faint mt-3">
                  {sortedFields.length} question{sortedFields.length !== 1 ? "s" : ""}
                  {multiStepMode ? " · Typeform style" : " · Classic"}
                </p>
              </div>

              {/* Mobile add field types */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-2">
                {FIELD_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => quickAddField(t.value)}
                    className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border"
                    style={{
                      borderColor: "var(--dash-border)",
                      background: "var(--dash-card)",
                      color: "var(--dash-text)",
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {sortedFields.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed p-10 text-center"
                  style={{ borderColor: "var(--dash-border)", background: "var(--dash-card)" }}
                >
                  <Plus className="w-8 h-8 mx-auto mb-3 dash-faint" />
                  <p className="text-sm font-medium dash-text">Add your first question</p>
                  <p className="text-xs dash-muted mt-1">Pick a field type from the left panel</p>
                </div>
              ) : (
                <DndFieldList
                  fields={sortedFields.map((f) => ({ ...f, order: f.order ?? 0 }))}
                  onReorder={handleReorder}
                  renderField={(field) => {
                    const isOpen = expandedField === field.id;
                    const hasLogic = !!field.conditionalLogic?.showIf?.fieldId;
                    const isFieldLocked = !!field.isLocked;
                    const isUnlockFlash = unlockFlashFieldId === field.id;
                    return (
                      <div
                        key={field.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedField(field.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setExpandedField(field.id);
                          }
                        }}
                        className={`w-full text-left rounded-xl border p-4 mb-2 transition-all duration-500 cursor-pointer ${
                          isUnlockFlash
                            ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[var(--dash-bg)] scale-[1.01] animate-pulse"
                            : ""
                        } ${isFieldLocked ? "border-amber-500/40 bg-amber-500/[0.04]" : ""}`}
                        style={{
                          background: isFieldLocked ? undefined : "var(--dash-card)",
                          borderColor: isUnlockFlash
                            ? "rgb(52 211 153 / 0.6)"
                            : isOpen
                              ? "var(--dash-accent)"
                              : isFieldLocked
                                ? "rgb(245 158 11 / 0.4)"
                                : "var(--dash-border)",
                          boxShadow: isOpen ? "0 0 0 1px var(--dash-accent)" : "var(--dash-shadow)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold shrink-0"
                            style={{
                              background: "var(--dash-accent-soft)",
                              color: "var(--dash-accent)",
                            }}
                          >
                            {FIELD_TYPES.find((t) => t.value === field.type)?.icon || "?"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium dash-text truncate">
                                {field.label}
                              </p>
                              {isFieldLocked && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                                  <LockIcon className="w-3 h-3" />
                                  Locked
                                </span>
                              )}
                              {isUnlockFlash && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0 animate-in fade-in duration-300">
                                  <Unlock className="w-3 h-3" />
                                  Unlocked
                                </span>
                              )}
                            </div>
                            <p className="text-xs dash-faint mt-0.5">
                              {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                              {field.required ? " · Required" : ""}
                              {hasLogic ? " · Logic" : ""}
                            </p>
                          </div>
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className={`p-1.5 rounded-md transition-colors ${
                                isFieldLocked
                                  ? "text-amber-500 hover:bg-amber-500/10"
                                  : "dash-faint hover:dash-text"
                              } ${isUnlockFlash ? "text-emerald-500" : ""}`}
                              title={isFieldLocked ? "Unlock this question" : "Lock this question"}
                              onClick={() =>
                                isFieldLocked
                                  ? handleUnlockField(field.id)
                                  : lockFieldMutation.mutate({ formId: id, fieldId: field.id })
                              }
                            >
                              {isFieldLocked ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <LockIcon className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              className="p-1.5 rounded-md text-red-500"
                              onClick={() => {
                                if (confirm("Remove this field?"))
                                  deleteFieldMutation.mutate({ formId: id, fieldId: field.id });
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </div>
          </section>

          {/* Right: inspector */}
          <aside
            className="border-t lg:border-t-0 lg:border-l overflow-y-auto"
            style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface)" }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--dash-border)" }}>
              <p className="text-xs font-medium dash-text">
                {selectedField ? "Field settings" : "Inspector"}
              </p>
            </div>
            <div className="p-4">
              {selectedField ? (
                <FieldExpander
                  field={selectedField}
                  allFields={sortedFields}
                  isLocked={!!selectedField.isLocked}
                  justUnlocked={unlockFlashFieldId === selectedField.id}
                  onUnlock={() => handleUnlockField(selectedField.id)}
                  onSave={(updates) => {
                    updateFieldMutation.mutate({
                      formId: id,
                      fieldId: selectedField.id,
                      ...updates,
                      validationRules: updates.validationRules ?? undefined,
                    });
                  }}
                  isSaving={updateFieldMutation.isPending}
                />
              ) : (
                <div className="text-center py-10 px-2">
                  <Pencil className="w-6 h-6 mx-auto mb-2 dash-faint" />
                  <p className="text-sm dash-text font-medium">No field selected</p>
                  <p className="text-xs dash-muted mt-1">
                    Select a question in the canvas, or add one from the left.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ===== SETTINGS / LIMITS / PAGES / PASSWORD ===== */}
      {tab !== "fields" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="w-full">
            {tab === "settings" && (
              <div className="ef-card p-6 space-y-6">
                <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Form Settings
                </h2>

                {/* Theme selector */}
                {themes && themes.length > 0 && (
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Form theme
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedThemeId(null)}
                        className="rounded-xl p-3 text-left text-sm transition-all"
                        style={{
                          border:
                            selectedThemeId === null
                              ? "2px solid var(--accent-amber)"
                              : "1px solid var(--border)",
                          background:
                            selectedThemeId === null ? "rgba(34,211,238,0.08)" : "transparent",
                        }}
                      >
                        <span style={{ color: "var(--foreground)" }}>Default</span>
                        <div className="flex gap-1 mt-2">
                          <span className="w-4 h-4 rounded-full bg-cyan-500" />
                          <span className="w-4 h-4 rounded-full bg-emerald-500" />
                        </div>
                      </button>
                      {themes.map((theme) => {
                        const cfg = theme.config as {
                          primaryColor?: string;
                          backgroundColor?: string;
                        };
                        const isSelected = selectedThemeId === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setSelectedThemeId(theme.id)}
                            className="rounded-xl p-3 text-left text-sm transition-all"
                            style={{
                              border: isSelected
                                ? "2px solid var(--accent-amber)"
                                : "1px solid var(--border)",
                              background: isSelected ? "rgba(34,211,238,0.08)" : "transparent",
                            }}
                          >
                            <span className="font-medium" style={{ color: "var(--foreground)" }}>
                              {theme.name}
                            </span>
                            <div className="flex gap-1 mt-2">
                              <span
                                className="w-4 h-4 rounded-full"
                                style={{ background: cfg.primaryColor ?? "#3b82f6" }}
                              />
                              <span
                                className="w-4 h-4 rounded-full"
                                style={{ background: cfg.backgroundColor ?? "#050816" }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Submit button text
                  </label>
                  <input
                    value={submitButtonText}
                    onChange={(e) => setSubmitButtonText(e.target.value)}
                    placeholder="Submit"
                    className="ef-input w-full px-4 py-2.5 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Success message
                  </label>
                  <textarea
                    value={successMessage}
                    onChange={(e) => setSuccessMessage(e.target.value)}
                    rows={3}
                    placeholder="Thank you for your response!"
                    className="ef-input w-full px-4 py-2.5 rounded-lg text-sm resize-none"
                  />
                </div>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                      Show progress bar
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      Show completion progress to respondents
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProgressBar(!showProgressBar)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ background: showProgressBar ? "var(--accent-amber)" : "var(--muted)" }}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${showProgressBar ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                      Allow multiple responses
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      Same person can submit more than once
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllowMultipleResponses(!allowMultipleResponses)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{
                      background: allowMultipleResponses ? "var(--accent-amber)" : "var(--muted)",
                    }}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${allowMultipleResponses ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </label>

                <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--foreground)" }}>
                    Notifications
                  </h3>
                  <label className="flex items-center justify-between cursor-pointer mb-4">
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                        Email me on new responses
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        Instant email with a summary of answers
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyCreator(!notifyCreator)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{ background: notifyCreator ? "var(--accent-amber)" : "var(--muted)" }}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${notifyCreator ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer mb-4">
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                        Include in daily digest
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        “You got N responses today” summary email
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDigestEnabled(!digestEnabled)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{ background: digestEnabled ? "var(--accent-amber)" : "var(--muted)" }}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${digestEnabled ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </label>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      Webhook URL (Slack / Discord / Zapier)
                    </label>
                    <input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://hooks.slack.com/services/… or Discord webhook"
                      className="ef-input w-full px-4 py-2.5 rounded-lg text-sm"
                    />
                    <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                      We POST JSON on every new response: event, formId, answers, submittedAt.
                    </p>
                  </div>
                </div>

                {form.visibility !== "unpublished" && (
                  <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <h3
                      className="font-semibold text-sm mb-3"
                      style={{ color: "var(--foreground)" }}
                    >
                      Share & embed
                    </h3>
                    <EmbedSharePanel slug={form.slug} formTitle={form.title} />
                  </div>
                )}

                <button
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="ef-btn-primary w-full py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {settingsSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Settings
                </button>
              </div>
            )}

            {/* ===== LIMITS & EXPIRY TAB ===== */}
            {tab === "limits" && (
              <div className="space-y-4">
                <div className="ef-card p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-5 h-5 ef-amber" />
                    <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
                      Response Limit
                    </h2>
                  </div>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Stop accepting responses after a certain number of submissions.
                  </p>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      Max responses
                    </label>
                    <input
                      type="number"
                      value={maxResponses}
                      onChange={(e) => setMaxResponses(e.target.value)}
                      placeholder="Unlimited"
                      min="1"
                      className="ef-input w-full px-4 py-2.5 rounded-lg text-sm"
                    />
                    {maxResponses && (
                      <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                        Max {maxResponses} responses configured
                      </p>
                    )}
                  </div>
                </div>

                <div className="ef-card p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarClock className="w-5 h-5 ef-amber" />
                    <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
                      Form Expiry
                    </h2>
                  </div>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Automatically close the form after a specific date and time.
                  </p>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      Close after date
                    </label>
                    <input
                      type="datetime-local"
                      value={closeAfterDate}
                      onChange={(e) => setCloseAfterDate(e.target.value)}
                      className="ef-input w-full px-4 py-2.5 rounded-lg text-sm"
                    />
                    {closeAfterDate && (
                      <p
                        className="text-xs mt-1.5 font-medium"
                        style={{
                          color: new Date(closeAfterDate) < new Date() ? "#c47070" : "#7ab882",
                        }}
                      >
                        {new Date(closeAfterDate) < new Date()
                          ? "⚠️ This date is in the past — form is currently closed"
                          : "✓ Form will close on " + new Date(closeAfterDate).toLocaleString()}
                      </p>
                    )}
                    {closeAfterDate && (
                      <button
                        onClick={() => setCloseAfterDate("")}
                        className="text-xs mt-1 hover:underline"
                        style={{ color: "#c47070" }}
                      >
                        Remove expiry
                      </button>
                    )}
                  </div>
                </div>

                {(maxResponses || closeAfterDate) && (
                  <div
                    className="p-4 rounded-xl text-sm"
                    style={{
                      background: "rgba(34,211,238,0.10)",
                      border: "1px solid rgba(34,211,238,0.25)",
                      color: "var(--accent-amber)",
                    }}
                  >
                    <strong>Active restrictions:</strong>
                    <ul className="mt-1 list-disc list-inside space-y-0.5">
                      {maxResponses && <li>Max {maxResponses} responses</li>}
                      {closeAfterDate && (
                        <li>Closes {new Date(closeAfterDate).toLocaleString()}</li>
                      )}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="ef-btn-primary w-full py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {settingsSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Limits
                </button>
              </div>
            )}

            {/* ===== PAGES TAB ===== */}
            {tab === "pages" && (
              <div className="space-y-4">
                <div className="ef-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 ef-amber" />
                    <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
                      Form Pages
                    </h2>
                  </div>
                  <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>
                    Organize fields into pages (sections). Respondents will navigate through one
                    page at a time.
                  </p>

                  {/* Existing pages */}
                  {pages && pages.length > 0 ? (
                    <div className="space-y-2 mb-5">
                      {pages.map((page, idx) => (
                        <div
                          key={page.id}
                          className="rounded-xl p-4"
                          style={{ border: "1px solid var(--border)" }}
                        >
                          {editingPageId === page.id ? (
                            <div className="flex gap-2">
                              <input
                                value={editingPageTitle}
                                onChange={(e) => setEditingPageTitle(e.target.value)}
                                className="ef-input flex-1 px-3 py-2 rounded-lg text-sm"
                                autoFocus
                              />
                              <button
                                onClick={() =>
                                  updatePageMutation.mutate({
                                    id,
                                    pageId: page.id,
                                    title: editingPageTitle,
                                  })
                                }
                                className="ef-btn-primary px-3 py-2 rounded-lg text-sm"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingPageId(null)}
                                className="ef-btn-ghost px-3 py-2 rounded-lg text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                  background: "rgba(34,211,238,0.12)",
                                  color: "var(--accent-amber)",
                                }}
                              >
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-medium text-sm truncate"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  {page.title || `Page ${idx + 1}`}
                                </p>
                                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                  {sortedFields.filter((f) => f.pageId === page.id).length} fields
                                  assigned
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingPageId(page.id);
                                    setEditingPageTitle(page.title ?? "");
                                  }}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{ color: "var(--muted-foreground)" }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "var(--accent-amber)";
                                    e.currentTarget.style.background = "rgba(34,211,238,0.1)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "var(--muted-foreground)";
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this page? Fields will be unassigned."))
                                      deletePageMutation.mutate({ id, pageId: page.id });
                                  }}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{ color: "var(--muted-foreground)" }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#c47070";
                                    e.currentTarget.style.background = "rgba(140,75,75,0.12)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "var(--muted-foreground)";
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="text-center py-8 text-sm mb-5"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      No pages yet. Add your first page below.
                    </div>
                  )}

                  {/* Add page */}
                  <div className="flex gap-2">
                    <input
                      value={newPageTitle}
                      onChange={(e) => setNewPageTitle(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        newPageTitle.trim() &&
                        addPageMutation.mutate({ id, title: newPageTitle.trim() })
                      }
                      placeholder="Page title (e.g. Basic Info)"
                      className="ef-input flex-1 px-3 py-2.5 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        if (newPageTitle.trim())
                          addPageMutation.mutate({ id, title: newPageTitle.trim() });
                      }}
                      disabled={!newPageTitle.trim() || addPageMutation.isPending}
                      className="ef-btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {addPageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FolderPlus className="w-4 h-4" />
                      )}
                      Add
                    </button>
                  </div>
                </div>

                {/* Assign fields to pages */}
                {pages && pages.length > 0 && sortedFields.length > 0 && (
                  <div className="ef-card p-6">
                    <h3
                      className="font-semibold text-sm mb-4"
                      style={{ color: "var(--foreground)" }}
                    >
                      Assign Fields to Pages
                    </h3>
                    <div className="space-y-2">
                      {sortedFields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{ border: "1px solid var(--border)" }}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: "var(--foreground)" }}
                            >
                              {field.label}
                            </p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                              {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                            </p>
                          </div>
                          <select
                            value={field.pageId ?? ""}
                            onChange={(e) =>
                              assignFieldToPageMutation.mutate({
                                formId: id,
                                fieldId: field.id,
                                pageId: e.target.value || null,
                              })
                            }
                            className="ef-input px-2 py-1.5 rounded-lg text-xs"
                          >
                            <option value="">No page</option>
                            {pages.map((page, idx) => (
                              <option key={page.id} value={page.id}>
                                {page.title || `Page ${idx + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== PASSWORD TAB ===== */}
            {tab === "password" && (
              <div className="ef-card p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 ef-amber" />
                  <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
                    Password Protection
                  </h2>
                </div>

                {form.isPasswordProtected ? (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "rgba(88,116,92,0.15)",
                      border: "1px solid rgba(88,116,92,0.3)",
                      color: "#7ab882",
                    }}
                  >
                    <Shield className="w-4 h-4" /> This form is currently password-protected
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    No password — this form is publicly accessible
                  </div>
                )}

                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Set a password to restrict access. Respondents must enter it before viewing the
                  form questions.
                </p>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    New password
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password (leave blank to remove)"
                    className="ef-input w-full px-4 py-2.5 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className="ef-input w-full px-4 py-2.5 rounded-lg text-sm"
                  />
                  {passwordInput && passwordConfirm && passwordInput !== passwordConfirm && (
                    <p className="text-xs mt-1" style={{ color: "#c47070" }}>
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (passwordInput && passwordInput !== passwordConfirm) {
                        toast.error("Passwords do not match");
                        return;
                      }
                      setPasswordSaving(true);
                      setPasswordMutation.mutate({ id, password: passwordInput || null });
                    }}
                    disabled={
                      passwordSaving || (!!passwordInput && passwordInput !== passwordConfirm)
                    }
                    className="ef-btn-primary flex-1 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {passwordSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    {passwordInput ? "Set Password" : "Remove Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <FormPreviewModal
        form={{
          title: form.title,
          description: form.description,
          fields: sortedFields as PreviewField[],
          showProgressBar: form.showProgressBar,
          submitButtonText: form.submitButtonText,
          successMessage: form.successMessage,
        }}
        open={showPreview}
        onClose={() => setShowPreview(false)}
        multiStep={previewMultiStep}
      />

      {form.visibility !== "unpublished" && (
        <QRShareModal
          open={showQR}
          onClose={() => setShowQR(false)}
          formTitle={form.title}
          formSlug={form.slug}
        />
      )}
    </div>
  );
}

// ─── Inline field expander ────────────────────────────────────────────────────
function FieldExpander({
  field,
  allFields,
  isLocked,
  justUnlocked,
  onUnlock,
  onSave,
  isSaving,
}: {
  field: EditorFormField;
  allFields: EditorFormField[];
  isLocked: boolean;
  justUnlocked: boolean;
  onUnlock: () => void;
  onSave: (updates: FieldSaveUpdates) => void;
  isSaving: boolean;
}) {
  const [label, setLabel] = useState(field.label);
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? "");
  const [helpText, setHelpText] = useState(field.helpText ?? "");
  const [required, setRequired] = useState(field.required);
  const [options, setOptions] = useState(
    field.options ? (field.options as { label: string }[]).map((o) => o.label).join("\n") : "",
  );
  const [logic, setLogic] = useState<ConditionalLogic | null>(field.conditionalLogic ?? null);
  const [validationRules, setValidationRules] = useState<ValidationRules | null>(
    (field.validationRules as ValidationRules | null) ?? null,
  );

  const fieldsBeforeThis = allFields.filter((f) => f.order < field.order);
  const inputDisabled = isLocked;

  return (
    <div className="space-y-4">
      {isLocked && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <LockIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              This question is locked
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
              Responses already exist for this form. Unlock it to edit the label, options, and
              conditional logic.
            </p>
            <button
              type="button"
              onClick={onUnlock}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200 hover:underline"
            >
              <Unlock className="w-3.5 h-3.5" />
              Unlock question
            </button>
          </div>
        </div>
      )}

      {justUnlocked && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Unlocked — you can edit and save your changes now.
          </p>
        </div>
      )}

      <div className={`space-y-4 ${isLocked ? "opacity-60 pointer-events-none" : ""}`}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Label
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={inputDisabled}
              className="ef-input w-full px-3 py-2 rounded-lg text-sm"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Placeholder
            </label>
            <input
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="ef-input w-full px-3 py-2 rounded-lg text-sm"
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Help text
            </label>
            <input
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              className="ef-input w-full px-3 py-2 rounded-lg text-sm"
            />
          </div>
        </div>
        {["single_select", "multi_select"].includes(field.type) && (
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Options (one per line)
            </label>
            <textarea
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              rows={3}
              className="ef-input w-full px-3 py-2 rounded-lg text-sm resize-none"
            />
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--accent-amber)" }}
          />
          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Required
          </span>
        </label>

        <ConditionalLogicEditor
          fieldId={field.id}
          currentLogic={logic}
          availableFields={fieldsBeforeThis.map((f) => ({
            id: f.id,
            label: f.label,
            type: f.type,
            order: f.order,
            options: f.options as FieldOption[] | null,
          }))}
          onChange={setLogic}
        />

        <ValidationRulesEditor
          fieldType={field.type as FieldType}
          rules={validationRules}
          onChange={setValidationRules}
        />
      </div>

      <button
        onClick={() => {
          if (isLocked) {
            toast.error("Unlock this question first", {
              description: "Click the lock icon on the canvas or use Unlock question above.",
            });
            return;
          }

          const showIf = logic?.showIf;
          if (
            showIf &&
            ["equals", "not_equals", "contains"].includes(showIf.operator) &&
            !showIf.value?.trim()
          ) {
            toast.error("Enter a comparison value for conditional logic", {
              description:
                "For equals, does not equal, or contains, specify what the previous answer should match.",
            });
            return;
          }

          const hasOptions = ["single_select", "multi_select"].includes(field.type);
          const parsedOptions =
            hasOptions && options
              ? options
                  .split("\n")
                  .filter(Boolean)
                  .map((o) => ({
                    value: o.trim().toLowerCase().replace(/\s+/g, "_"),
                    label: o.trim(),
                  }))
              : undefined;
          onSave({
            label,
            placeholder: placeholder || undefined,
            helpText: helpText || undefined,
            required,
            options: parsedOptions,
            conditionalLogic: logic ?? undefined,
            validationRules: validationRules ?? undefined,
          });
        }}
        disabled={isSaving || isLocked}
        className="ef-btn-primary w-full py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {isLocked ? "Unlock to save" : "Save changes"}
      </button>
    </div>
  );
}
