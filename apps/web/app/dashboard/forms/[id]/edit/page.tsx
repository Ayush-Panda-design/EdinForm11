"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  Loader2, Plus, Trash2, GripVertical, ArrowLeft, Globe, Lock, Eye,
  Save, Settings, GitBranch, QrCode, ChevronDown, ChevronUp, Layers,
  CalendarClock, Hash, Pencil, Check, Shield, BookOpen, FolderPlus
} from "lucide-react";
import { FormPreviewModal } from "~/components/forms/form-preview-modal";
import { QRShareModal } from "~/components/forms/qr-share-modal";
import { ConditionalLogicEditor, type ConditionalLogic } from "~/components/forms/conditional-logic-editor";
import { DndFieldList } from "~/components/forms/dnd-field-list";
import { Lock as LockIcon } from "lucide-react";

type FieldType = "short_text"|"long_text"|"email"|"number"|"single_select"|"multi_select"|"checkbox"|"date"|"rating";
const FIELD_TYPES: {value: FieldType; label: string; icon: string}[] = [
  {value:"short_text",label:"Short Text",icon:"Aa"},
  {value:"long_text",label:"Long Text",icon:"¶"},
  {value:"email",label:"Email",icon:"@"},
  {value:"number",label:"Number",icon:"#"},
  {value:"single_select",label:"Single Select",icon:"◉"},
  {value:"multi_select",label:"Multi Select",icon:"☑"},
  {value:"checkbox",label:"Checkbox",icon:"✓"},
  {value:"date",label:"Date",icon:"📅"},
  {value:"rating",label:"Rating",icon:"★"},
];

type ActiveTab = "fields" | "settings" | "limits" | "pages" | "password";

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const utils = trpc.useUtils();

  const [tab, setTab] = useState<ActiveTab>("fields");
  const [addingField, setAddingField] = useState(false);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMultiStep, setPreviewMultiStep] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showPreviewMenu, setShowPreviewMenu] = useState(false);
  const [multiStepMode, setMultiStepMode] = useState(true);

  // New field state
  const [newFieldType, setNewFieldType] = useState<FieldType>("short_text");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldHelpText, setNewFieldHelpText] = useState("");
  const [newFieldLogic, setNewFieldLogic] = useState<ConditionalLogic | null>(null);

  // Settings state
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [maxResponses, setMaxResponses] = useState<string>("");
  const [closeAfterDate, setCloseAfterDate] = useState<string>("");
  const [submitButtonText, setSubmitButtonText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [allowMultipleResponses, setAllowMultipleResponses] = useState(true);
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

  useEffect(() => {
    if (form && !settingsLoaded) {
      setMaxResponses(form.maxResponses ? String(form.maxResponses) : "");
      setCloseAfterDate(form.closeAfterDate
        ? new Date(form.closeAfterDate).toISOString().slice(0, 16) : "");
      setSubmitButtonText(form.submitButtonText ?? "");
      setSuccessMessage(form.successMessage ?? "");
      setShowProgressBar(form.showProgressBar ?? true);
      setAllowMultipleResponses(form.allowMultipleResponses ?? true);
      setSettingsLoaded(true);
    }
  }, [form, settingsLoaded]);

  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => { toast.success("Form published!"); utils.forms.getById.invalidate({ id }); },
    onError: (e) => toast.error(e.message),
  });
  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => { toast.success("Unpublished"); utils.forms.getById.invalidate({ id }); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.forms.update.useMutation({
    onSuccess: () => { toast.success("Settings saved!"); utils.forms.getById.invalidate({ id }); setSettingsSaving(false); },
    onError: (e) => { toast.error(e.message); setSettingsSaving(false); },
  });
  const addFieldMutation = trpc.forms.addField.useMutation({
    onSuccess: () => {
      toast.success("Field added!");
      utils.forms.getById.invalidate({ id });
      setAddingField(false);
      setNewFieldLabel(""); setNewFieldOptions(""); setNewFieldRequired(false);
      setNewFieldPlaceholder(""); setNewFieldHelpText(""); setNewFieldLogic(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateFieldMutation = trpc.forms.updateField.useMutation({
    onSuccess: () => { toast.success("Field updated!"); utils.forms.getById.invalidate({ id }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteFieldMutation = trpc.forms.deleteField.useMutation({
    onSuccess: () => { toast.success("Field removed"); utils.forms.getById.invalidate({ id }); },
    onError: (e) => toast.error(e.message),
  });
  const reorderFieldsMutation = trpc.forms.reorderFields.useMutation({
    onError: (e) => toast.error("Reorder failed: " + e.message),
  });
  const lockFieldMutation = trpc.forms.lockField.useMutation({
    onSuccess: () => { toast.success("Field locked"); utils.forms.getById.invalidate({ id }); },
    onError: (e) => toast.error(e.message),
  });
  const unlockFieldMutation = trpc.forms.unlockField.useMutation({
    onSuccess: () => { toast.success("Field unlocked"); utils.forms.getById.invalidate({ id }); },
    onError: (e) => toast.error(e.message),
  });

  const setPasswordMutation = trpc.forms.setPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.isPasswordProtected ? "Password set!" : "Password removed");
      utils.forms.getById.invalidate({ id });
      setPasswordInput(""); setPasswordConfirm(""); setPasswordSaving(false);
    },
    onError: (e) => { toast.error(e.message); setPasswordSaving(false); },
  });

  const { data: pages, refetch: refetchPages } = trpc.forms.listPages.useQuery({ id });
  const addPageMutation = trpc.forms.addPage.useMutation({
    onSuccess: () => { toast.success("Page added!"); refetchPages(); setNewPageTitle(""); },
    onError: (e) => toast.error(e.message),
  });
  const updatePageMutation = trpc.forms.updatePage.useMutation({
    onSuccess: () => { toast.success("Page updated"); refetchPages(); setEditingPageId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deletePageMutation = trpc.forms.deletePage.useMutation({
    onSuccess: () => { toast.success("Page deleted"); refetchPages(); utils.forms.getById.invalidate({ id }); },
    onError: (e) => toast.error(e.message),
  });
  const assignFieldToPageMutation = trpc.forms.assignFieldToPage.useMutation({
    onSuccess: () => { utils.forms.getById.invalidate({ id }); },
    onError: (e) => toast.error(e.message),
  });

  const handleReorder = useCallback((newOrder: Array<{ fieldId: string; order: number }>) => {
    reorderFieldsMutation.mutate({ formId: id, fieldOrders: newOrder });
  }, [id, reorderFieldsMutation]);

  const handleAddField = () => {
    if (!newFieldLabel.trim()) { toast.error("Label is required"); return; }
    const hasOptions = ["single_select","multi_select"].includes(newFieldType);
    const options = hasOptions && newFieldOptions
      ? newFieldOptions.split("\n").filter(Boolean).map(o => ({ value: o.trim().toLowerCase().replace(/\s+/g,"_"), label: o.trim() }))
      : undefined;
    addFieldMutation.mutate({
      formId: id,
      type: newFieldType,
      label: newFieldLabel.trim(),
      placeholder: newFieldPlaceholder || undefined,
      helpText: newFieldHelpText || undefined,
      required: newFieldRequired,
      order: form?.fields?.length ?? 0,
      options,
      conditionalLogic: newFieldLogic ?? undefined,
    });
  };

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
    });
  };

  if (isLoading) return (
    <div className="flex justify-center p-16">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent-amber)" }} />
    </div>
  );
  if (!form) return (
    <div className="p-12 text-center" style={{ color: "var(--muted-foreground)" }}>Form not found</div>
  );

  const sortedFields = [...(form.fields ?? [])].sort((a, b) => a.order - b.order);
  const isLimited = (maxResponses && parseInt(maxResponses) > 0) || closeAfterDate;
  const isExpired = closeAfterDate && new Date(closeAfterDate) < new Date();
  const isLimitReached = maxResponses && parseInt(maxResponses) > 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/dashboard"
          className="p-2 rounded-lg transition-colors mt-1"
          style={{ color: "var(--muted-foreground)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate" style={{ color: "var(--foreground)" }}>{form.title}</h1>
          <p className="text-sm mt-0.5 font-mono" style={{ color: "var(--muted-foreground)" }}>/{form.slug}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Preview button with dropdown */}
          <div className="relative">
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <button
                onClick={() => { setPreviewMultiStep(multiStepMode); setShowPreview(true); }}
                className="flex items-center gap-1.5 text-sm px-3 py-2 transition-colors"
                style={{ background: "var(--card)", color: "var(--foreground)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--card)")}>
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button
                onClick={() => setShowPreviewMenu(!showPreviewMenu)}
                className="px-2 py-2 transition-colors"
                style={{ background: "var(--card)", color: "var(--muted-foreground)", borderLeft: "1px solid var(--border)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--card)")}>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            {showPreviewMenu && (
              <div
                className="absolute right-0 top-10 w-52 rounded-xl shadow-lg py-1 z-20"
                style={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                onClick={() => setShowPreviewMenu(false)}>
                <button
                  onClick={() => { setPreviewMultiStep(true); setShowPreview(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "var(--foreground)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <Layers className="w-4 h-4 ef-amber" /> Multi-step (Typeform)
                </button>
                <button
                  onClick={() => { setPreviewMultiStep(false); setShowPreview(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "var(--foreground)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <Eye className="w-4 h-4 ef-amber" /> All fields at once
                </button>
              </div>
            )}
          </div>

          {/* QR share */}
          {form.visibility !== "unpublished" && (
            <button
              onClick={() => setShowQR(true)}
              className="p-2 rounded-xl transition-colors"
              style={{ border: "1px solid var(--border)", background: "var(--card)", color: "var(--muted-foreground)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--card)")}
              title="Share QR">
              <QrCode className="w-4 h-4" />
            </button>
          )}

          {/* Publish / Unpublish */}
          {form.visibility === "unpublished" ? (
            <div className="flex gap-1.5">
              <button
                onClick={() => publishMutation.mutate({ id, visibility: "unlisted" })}
                disabled={publishMutation.isPending}
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl transition-colors"
                style={{ border: "1px solid rgba(200,155,99,0.35)", color: "var(--accent-amber)", background: "rgba(200,155,99,0.08)" }}>
                <Lock className="w-3.5 h-3.5" /> Unlisted
              </button>
              <button
                onClick={() => publishMutation.mutate({ id, visibility: "public" })}
                disabled={publishMutation.isPending}
                className="ef-btn-primary flex items-center gap-1 text-xs px-3 py-2 rounded-xl">
                {publishMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />} Publish
              </button>
            </div>
          ) : (
            <button
              onClick={() => unpublishMutation.mutate({ id })}
              disabled={unpublishMutation.isPending}
              className="ef-btn-ghost flex items-center gap-1 text-xs px-3 py-2 rounded-xl transition-colors">
              <Lock className="w-3.5 h-3.5" /> Unpublish
            </button>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div className={`mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 flex-wrap`} style={{
        background: isExpired || isLimitReached
          ? "rgba(140,75,75,0.15)"
          : form.visibility === "public"
          ? "rgba(88,116,92,0.18)"
          : form.visibility === "unlisted"
          ? "rgba(200,155,99,0.12)"
          : "var(--muted)",
        border: `1px solid ${isExpired || isLimitReached
          ? "rgba(140,75,75,0.35)"
          : form.visibility === "public"
          ? "rgba(88,116,92,0.35)"
          : form.visibility === "unlisted"
          ? "rgba(200,155,99,0.30)"
          : "var(--border)"}`,
        color: isExpired || isLimitReached
          ? "#c47070"
          : form.visibility === "public"
          ? "#7ab882"
          : form.visibility === "unlisted"
          ? "var(--accent-amber)"
          : "var(--muted-foreground)",
      }}>
        {form.visibility === "public" ? <Globe className="w-4 h-4 flex-shrink-0" /> : <Lock className="w-4 h-4 flex-shrink-0" />}
        <span>
          {isExpired ? "⏰ Form expired — no longer accepting responses" :
           isLimitReached ? "🔒 Response limit reached" :
           form.visibility === "public" ? "Public — visible on explore" :
           form.visibility === "unlisted" ? "Unlisted — direct link only" : "Draft — not published"}
        </span>
        {form.visibility !== "unpublished" && !isExpired && !isLimitReached && (
          <span className="ml-auto text-xs opacity-70 hidden sm:block truncate">
            {typeof window !== "undefined" ? window.location.origin : ""}/forms/{form.slug}
          </span>
        )}
        {isLimited && !isExpired && !isLimitReached && (
          <span className="ml-auto text-xs font-medium opacity-80">
            {maxResponses && `${maxResponses} response limit`}
            {maxResponses && closeAfterDate && " · "}
            {closeAfterDate && `Closes ${new Date(closeAfterDate).toLocaleDateString()}`}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 mb-6 flex-wrap" style={{ background: "var(--muted)" }}>
        {([
          { id: "fields", label: "Fields", icon: Pencil },
          { id: "settings", label: "Settings", icon: Settings },
          { id: "limits", label: "Limits & Expiry", icon: CalendarClock },
          { id: "pages", label: "Pages", icon: BookOpen },
          { id: "password", label: "Password", icon: Shield },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={tab === t.id ? {
              background: "var(--card)",
              color: "var(--foreground)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            } : {
              color: "var(--muted-foreground)",
            }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ===== FIELDS TAB ===== */}
      {tab === "fields" && (
        <div className="space-y-4">
          {/* Multi-step toggle */}
          <div className="ef-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 ef-amber" />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Multi-step mode</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Show one field at a time (Typeform-style)</p>
              </div>
            </div>
            <button type="button" onClick={() => setMultiStepMode(!multiStepMode)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ background: multiStepMode ? "var(--accent-amber)" : "var(--muted)" }}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${multiStepMode ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="ef-card" style={{ borderRadius: "0.75rem", overflow: "hidden" }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Fields ({sortedFields.length})</h2>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Drag to reorder</span>
            </div>

            {sortedFields.length === 0 ? (
              <div className="p-10 text-center" style={{ color: "var(--muted-foreground)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--muted)" }}>
                  <Plus className="w-6 h-6" />
                </div>
                No fields yet — add your first field below
              </div>
            ) : (
              <div className="p-2">
                <DndFieldList
                  fields={sortedFields.map(f => ({ ...f, order: f.order ?? 0 }))}
                  onReorder={handleReorder}
                  renderField={(field) => {
                    const isOpen = expandedField === field.id;
                    const hasLogic = !!(field.conditionalLogic as any)?.showIf?.fieldId;
                    const isFieldLocked = !!(field as any).isLocked;
                    return (
                      <div key={field.id} className="rounded-lg transition-colors" style={{
                        border: `1px solid ${isOpen ? "rgba(200,155,99,0.25)" : "transparent"}`,
                        background: isOpen ? "rgba(200,155,99,0.04)" : "transparent",
                      }}
                      onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLDivElement).style.background = "var(--muted)"; }}
                      onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                        <div className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: "rgba(200,155,99,0.12)", color: "var(--accent-amber)" }}>
                            {FIELD_TYPES.find(t=>t.value===field.type)?.icon || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate" style={{ color: "var(--foreground)" }}>{field.label}</span>
                              {field.required && (
                                <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "rgba(140,75,75,0.18)", color: "#c47070" }}>required</span>
                              )}
                              {hasLogic && (
                                <span className="text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5" style={{ background: "rgba(200,155,99,0.12)", color: "var(--accent-amber)" }}>
                                  <GitBranch className="w-3 h-3" /> conditional
                                </span>
                              )}
                              {isFieldLocked && (
                                <span className="text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5" style={{ background: "rgba(200,155,99,0.18)", color: "#D4A96A" }}>
                                  <LockIcon className="w-3 h-3" /> locked
                                </span>
                              )}
                            </div>
                            <span className="text-xs mt-0.5 block" style={{ color: "var(--muted-foreground)" }}>
                              {FIELD_TYPES.find(t=>t.value===field.type)?.label || field.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => setExpandedField(isOpen ? null : field.id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "var(--muted-foreground)" }}
                              onMouseEnter={e => { (e.currentTarget.style.color = "var(--accent-amber)"); (e.currentTarget.style.background = "rgba(200,155,99,0.1)"); }}
                              onMouseLeave={e => { (e.currentTarget.style.color = "var(--muted-foreground)"); (e.currentTarget.style.background = "transparent"); }}>
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                if (isFieldLocked) {
                                  unlockFieldMutation.mutate({ formId: id, fieldId: field.id });
                                } else {
                                  lockFieldMutation.mutate({ formId: id, fieldId: field.id });
                                }
                              }}
                              title={isFieldLocked ? "Unlock field" : "Lock field"}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: isFieldLocked ? "#D4A96A" : "var(--muted-foreground)" }}
                              onMouseEnter={e => { (e.currentTarget.style.color = "#D4A96A"); (e.currentTarget.style.background = "rgba(200,155,99,0.12)"); }}
                              onMouseLeave={e => { (e.currentTarget.style.color = isFieldLocked ? "#D4A96A" : "var(--muted-foreground)"); (e.currentTarget.style.background = "transparent"); }}>
                              <LockIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (confirm("Remove this field?")) deleteFieldMutation.mutate({ formId: id, fieldId: field.id }); }}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "var(--muted-foreground)" }}
                              onMouseEnter={e => { (e.currentTarget.style.color = "#c47070"); (e.currentTarget.style.background = "rgba(140,75,75,0.12)"); }}
                              onMouseLeave={e => { (e.currentTarget.style.color = "var(--muted-foreground)"); (e.currentTarget.style.background = "transparent"); }}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded field editor */}
                        {isOpen && (
                          <div className="px-4 pb-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                            <FieldExpander
                              field={field}
                              allFields={sortedFields}
                              onSave={(updates) => {
                                updateFieldMutation.mutate({ formId: id, fieldId: field.id, ...updates });
                                setExpandedField(null);
                              }}
                              isSaving={updateFieldMutation.isPending}
                            />
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            )}
          </div>

          {/* Add field */}
          {addingField ? (
            <div className="ef-card p-5 space-y-4" style={{ border: "1px solid rgba(200,155,99,0.3)" }}>
              <h3 className="font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <Plus className="w-4 h-4 ef-amber" /> Add New Field
              </h3>

              {/* Type grid */}
              <div className="grid grid-cols-3 gap-2">
                {FIELD_TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => setNewFieldType(t.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={newFieldType === t.value ? {
                      border: "1px solid rgba(200,155,99,0.5)",
                      background: "rgba(200,155,99,0.10)",
                      color: "var(--accent-amber)",
                    } : {
                      border: "1px solid var(--border)",
                      color: "var(--muted-foreground)",
                      background: "transparent",
                    }}>
                    <span className="text-base">{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Label *</label>
                  <input value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)}
                    placeholder="What is your name?"
                    className="ef-input w-full px-3 py-2.5 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Placeholder</label>
                  <input value={newFieldPlaceholder} onChange={e => setNewFieldPlaceholder(e.target.value)}
                    placeholder="Enter text..."
                    className="ef-input w-full px-3 py-2.5 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Help text</label>
                  <input value={newFieldHelpText} onChange={e => setNewFieldHelpText(e.target.value)}
                    placeholder="Optional hint..."
                    className="ef-input w-full px-3 py-2.5 rounded-lg text-sm" />
                </div>
              </div>

              {["single_select","multi_select"].includes(newFieldType) && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Options (one per line)</label>
                  <textarea value={newFieldOptions} onChange={e => setNewFieldOptions(e.target.value)}
                    rows={4} placeholder={"Option 1\nOption 2\nOption 3"}
                    className="ef-input w-full px-3 py-2.5 rounded-lg text-sm resize-none" />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newFieldRequired} onChange={e => setNewFieldRequired(e.target.checked)}
                  className="w-4 h-4 rounded" style={{ accentColor: "var(--accent-amber)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Required field</span>
              </label>

              {/* Conditional Logic */}
              <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <ConditionalLogicEditor
                  fieldId={`new-${Date.now()}`}
                  currentLogic={newFieldLogic}
                  availableFields={sortedFields.map(f => ({
                    id: f.id, label: f.label, type: f.type, order: f.order,
                    options: f.options as any,
                  }))}
                  onChange={setNewFieldLogic}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setAddingField(false)}
                  className="ef-btn-ghost flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddField} disabled={addFieldMutation.isPending}
                  className="ef-btn-primary flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {addFieldMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Add Field
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingField(true)}
              className="w-full py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
              style={{ border: "2px dashed var(--border)", color: "var(--muted-foreground)" }}
              onMouseEnter={e => {
                (e.currentTarget.style.borderColor = "rgba(200,155,99,0.45)");
                (e.currentTarget.style.color = "var(--accent-amber)");
              }}
              onMouseLeave={e => {
                (e.currentTarget.style.borderColor = "var(--border)");
                (e.currentTarget.style.color = "var(--muted-foreground)");
              }}>
              <Plus className="w-5 h-5" /> Add Field
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Link href={"/dashboard/forms/"+id+"/responses"}
              className="ef-btn-ghost text-center py-2.5 rounded-xl text-sm font-medium transition-colors">
              View Responses
            </Link>
            <Link href={"/dashboard/forms/"+id+"/analytics"}
              className="ef-btn-ghost text-center py-2.5 rounded-xl text-sm font-medium transition-colors">
              Analytics
            </Link>
          </div>
        </div>
      )}

      {/* ===== SETTINGS TAB ===== */}
      {tab === "settings" && (
        <div className="ef-card p-6 space-y-6">
          <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Form Settings</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Submit button text</label>
            <input value={submitButtonText} onChange={e => setSubmitButtonText(e.target.value)} placeholder="Submit"
              className="ef-input w-full px-4 py-2.5 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Success message</label>
            <textarea value={successMessage} onChange={e => setSuccessMessage(e.target.value)} rows={3}
              placeholder="Thank you for your response!"
              className="ef-input w-full px-4 py-2.5 rounded-lg text-sm resize-none" />
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>Show progress bar</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Show completion progress to respondents</p>
            </div>
            <button type="button" onClick={() => setShowProgressBar(!showProgressBar)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ background: showProgressBar ? "var(--accent-amber)" : "var(--muted)" }}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${showProgressBar ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>Allow multiple responses</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Same person can submit more than once</p>
            </div>
            <button type="button" onClick={() => setAllowMultipleResponses(!allowMultipleResponses)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ background: allowMultipleResponses ? "var(--accent-amber)" : "var(--muted)" }}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${allowMultipleResponses ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </label>
          <button onClick={handleSaveSettings} disabled={settingsSaving}
            className="ef-btn-primary w-full py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
              <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Response Limit</h2>
            </div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Stop accepting responses after a certain number of submissions.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Max responses</label>
              <input type="number" value={maxResponses} onChange={e => setMaxResponses(e.target.value)}
                placeholder="Unlimited" min="1"
                className="ef-input w-full px-4 py-2.5 rounded-lg text-sm" />
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
              <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Form Expiry</h2>
            </div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Automatically close the form after a specific date and time.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Close after date</label>
              <input type="datetime-local" value={closeAfterDate} onChange={e => setCloseAfterDate(e.target.value)}
                className="ef-input w-full px-4 py-2.5 rounded-lg text-sm" />
              {closeAfterDate && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: new Date(closeAfterDate) < new Date() ? "#c47070" : "#7ab882" }}>
                  {new Date(closeAfterDate) < new Date()
                    ? "⚠️ This date is in the past — form is currently closed"
                    : "✓ Form will close on " + new Date(closeAfterDate).toLocaleString()}
                </p>
              )}
              {closeAfterDate && (
                <button onClick={() => setCloseAfterDate("")} className="text-xs mt-1 hover:underline" style={{ color: "#c47070" }}>
                  Remove expiry
                </button>
              )}
            </div>
          </div>

          {(maxResponses || closeAfterDate) && (
            <div className="p-4 rounded-xl text-sm" style={{
              background: "rgba(200,155,99,0.10)",
              border: "1px solid rgba(200,155,99,0.25)",
              color: "var(--accent-amber)",
            }}>
              <strong>Active restrictions:</strong>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {maxResponses && <li>Max {maxResponses} responses</li>}
                {closeAfterDate && <li>Closes {new Date(closeAfterDate).toLocaleString()}</li>}
              </ul>
            </div>
          )}

          <button onClick={handleSaveSettings} disabled={settingsSaving}
            className="ef-btn-primary w-full py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
              <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Form Pages</h2>
            </div>
            <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>
              Organize fields into pages (sections). Respondents will navigate through one page at a time.
            </p>

            {/* Existing pages */}
            {pages && pages.length > 0 ? (
              <div className="space-y-2 mb-5">
                {pages.map((page, idx) => (
                  <div key={page.id} className="rounded-xl p-4" style={{ border: "1px solid var(--border)" }}>
                    {editingPageId === page.id ? (
                      <div className="flex gap-2">
                        <input
                          value={editingPageTitle}
                          onChange={e => setEditingPageTitle(e.target.value)}
                          className="ef-input flex-1 px-3 py-2 rounded-lg text-sm"
                          autoFocus
                        />
                        <button onClick={() => updatePageMutation.mutate({ id, pageId: page.id, title: editingPageTitle })}
                          className="ef-btn-primary px-3 py-2 rounded-lg text-sm">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingPageId(null)}
                          className="ef-btn-ghost px-3 py-2 rounded-lg text-sm">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "rgba(200,155,99,0.12)", color: "var(--accent-amber)" }}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate" style={{ color: "var(--foreground)" }}>{page.title || `Page ${idx + 1}`}</p>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {sortedFields.filter(f => f.pageId === page.id).length} fields assigned
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingPageId(page.id); setEditingPageTitle(page.title ?? ""); }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "var(--muted-foreground)" }}
                            onMouseEnter={e => { (e.currentTarget.style.color = "var(--accent-amber)"); (e.currentTarget.style.background = "rgba(200,155,99,0.1)"); }}
                            onMouseLeave={e => { (e.currentTarget.style.color = "var(--muted-foreground)"); (e.currentTarget.style.background = "transparent"); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { if (confirm("Delete this page? Fields will be unassigned.")) deletePageMutation.mutate({ id, pageId: page.id }); }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "var(--muted-foreground)" }}
                            onMouseEnter={e => { (e.currentTarget.style.color = "#c47070"); (e.currentTarget.style.background = "rgba(140,75,75,0.12)"); }}
                            onMouseLeave={e => { (e.currentTarget.style.color = "var(--muted-foreground)"); (e.currentTarget.style.background = "transparent"); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>
                No pages yet. Add your first page below.
              </div>
            )}

            {/* Add page */}
            <div className="flex gap-2">
              <input
                value={newPageTitle}
                onChange={e => setNewPageTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && newPageTitle.trim() && addPageMutation.mutate({ id, title: newPageTitle.trim() })}
                placeholder="Page title (e.g. Basic Info)"
                className="ef-input flex-1 px-3 py-2.5 rounded-lg text-sm"
              />
              <button onClick={() => { if (newPageTitle.trim()) addPageMutation.mutate({ id, title: newPageTitle.trim() }); }}
                disabled={!newPageTitle.trim() || addPageMutation.isPending}
                className="ef-btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                {addPageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                Add
              </button>
            </div>
          </div>

          {/* Assign fields to pages */}
          {pages && pages.length > 0 && sortedFields.length > 0 && (
            <div className="ef-card p-6">
              <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>Assign Fields to Pages</h3>
              <div className="space-y-2">
                {sortedFields.map(field => (
                  <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ border: "1px solid var(--border)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{field.label}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{FIELD_TYPES.find(t => t.value === field.type)?.label}</p>
                    </div>
                    <select
                      value={field.pageId ?? ""}
                      onChange={e => assignFieldToPageMutation.mutate({ formId: id, fieldId: field.id, pageId: e.target.value || null })}
                      className="ef-input px-2 py-1.5 rounded-lg text-xs">
                      <option value="">No page</option>
                      {pages.map((page, idx) => (
                        <option key={page.id} value={page.id}>{page.title || `Page ${idx + 1}`}</option>
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
            <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>Password Protection</h2>
          </div>

          {(form as any).isPasswordProtected ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ background: "rgba(88,116,92,0.15)", border: "1px solid rgba(88,116,92,0.3)", color: "#7ab882" }}>
              <Shield className="w-4 h-4" /> This form is currently password-protected
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
              No password — this form is publicly accessible
            </div>
          )}

          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Set a password to restrict access. Respondents must enter it before viewing the form questions.
          </p>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>New password</label>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="Enter password (leave blank to remove)"
              className="ef-input w-full px-4 py-2.5 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Confirm password</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="ef-input w-full px-4 py-2.5 rounded-lg text-sm"
            />
            {passwordInput && passwordConfirm && passwordInput !== passwordConfirm && (
              <p className="text-xs mt-1" style={{ color: "#c47070" }}>Passwords do not match</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (passwordInput && passwordInput !== passwordConfirm) { toast.error("Passwords do not match"); return; }
                setPasswordSaving(true);
                setPasswordMutation.mutate({ id, password: passwordInput || null });
              }}
              disabled={passwordSaving || (!!passwordInput && passwordInput !== passwordConfirm)}
              className="ef-btn-primary flex-1 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {passwordInput ? "Set Password" : "Remove Password"}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <FormPreviewModal
        form={{
          title: form.title,
          description: form.description,
          fields: sortedFields as any,
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
  field, allFields, onSave, isSaving
}: {
  field: any;
  allFields: any[];
  onSave: (updates: any) => void;
  isSaving: boolean;
}) {
  const [label, setLabel] = useState(field.label);
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? "");
  const [helpText, setHelpText] = useState(field.helpText ?? "");
  const [required, setRequired] = useState(field.required);
  const [options, setOptions] = useState(
    field.options ? (field.options as {label:string}[]).map(o=>o.label).join("\n") : ""
  );
  const [logic, setLogic] = useState<ConditionalLogic | null>(field.conditionalLogic ?? null);

  const fieldsBeforeThis = allFields.filter(f => f.order < field.order);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Label</label>
          <input value={label} onChange={e => setLabel(e.target.value)}
            className="ef-input w-full px-3 py-2 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Placeholder</label>
          <input value={placeholder} onChange={e => setPlaceholder(e.target.value)}
            className="ef-input w-full px-3 py-2 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Help text</label>
          <input value={helpText} onChange={e => setHelpText(e.target.value)}
            className="ef-input w-full px-3 py-2 rounded-lg text-sm" />
        </div>
      </div>
      {["single_select","multi_select"].includes(field.type) && (
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Options (one per line)</label>
          <textarea value={options} onChange={e => setOptions(e.target.value)} rows={3}
            className="ef-input w-full px-3 py-2 rounded-lg text-sm resize-none" />
        </div>
      )}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)}
          className="w-4 h-4 rounded" style={{ accentColor: "var(--accent-amber)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Required</span>
      </label>

      <ConditionalLogicEditor
        fieldId={field.id}
        currentLogic={logic}
        availableFields={fieldsBeforeThis.map(f => ({
          id: f.id, label: f.label, type: f.type, order: f.order,
          options: f.options as any,
        }))}
        onChange={setLogic}
      />

      <button onClick={() => {
        const hasOptions = ["single_select","multi_select"].includes(field.type);
        const parsedOptions = hasOptions && options
          ? options.split("\n").filter(Boolean).map(o => ({ value: o.trim().toLowerCase().replace(/\s+/g,"_"), label: o.trim() }))
          : undefined;
        onSave({ label, placeholder: placeholder||undefined, helpText: helpText||undefined, required, options: parsedOptions, conditionalLogic: logic });
      }} disabled={isSaving}
        className="ef-btn-primary w-full py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Save changes
      </button>
    </div>
  );
}
