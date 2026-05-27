"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(1, "Title required").max(300),
  description: z.string().max(2000).optional(),
  allowMultipleResponses: z.boolean().default(true),
  showProgressBar: z.boolean().default(true),
  submitButtonText: z.string().optional(),
  successMessage: z.string().optional(),
});

/* ── shared label style ── */
const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.24em",
    color: "var(--muted-foreground)",
    fontFamily: "'Inter', sans-serif",
    marginBottom: "8px",
    fontWeight: 500,
  }}>
    {children}
  </p>
);

/* ── text input ── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  fontSize: "14px",
  fontFamily: "'Inter', sans-serif",
  color: "var(--foreground)",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s, box-shadow .2s, background .2s",
};

/* ── toggle switch ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 42,
        height: 24,
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        position: "relative",
        transition: "background 0.25s",
        background: checked
          ? "linear-gradient(180deg, #D6A872 0%, #B7884F 100%)"
          : "rgba(255,255,255,0.08)",
      }}
    >
      <span style={{
        position: "absolute",
        top: "3px",
        left: checked ? "21px" : "3px",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: checked ? "#14110C" : "rgba(255,255,255,0.5)",
        transition: "left 0.22s cubic-bezier(.4,0,.2,1)",
        display: "block",
      }} />
    </button>
  );
}

/* ── section card ── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "16px",
      padding: "1.75rem",
      backdropFilter: "blur(24px)",
    }}>
      {children}
    </div>
  );
}

export default function NewFormPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { allowMultipleResponses: true, showProgressBar: true },
  });

  const allowMultiple = watch("allowMultipleResponses");
  const showProgress = watch("showProgressBar");

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const focusStyle = (name: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === name
      ? "rgba(200,155,99,0.55)"
      : "rgba(255,255,255,0.09)",
    boxShadow: focusedField === name
      ? "0 0 0 3px rgba(200,155,99,0.10)"
      : "none",
    background: focusedField === name
      ? "rgba(255,255,255,0.06)"
      : "rgba(255,255,255,0.04)",
  });

  const createForm = trpc.forms.create.useMutation({
    onSuccess: (data) => {
      toast.success("Form created!");
      router.push("/dashboard/forms/" + data.id + "/edit");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div style={{ maxWidth: "640px", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "2.5rem" }}>
        <Link
          href="/dashboard"
          style={{
            width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--muted-foreground)",
            textDecoration: "none", marginTop: "2px",
            transition: "background .2s, color .2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
          }}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
        </Link>
        <div>
          <p style={{
            fontSize: "11px", textTransform: "uppercase",
            letterSpacing: "0.28em", color: "var(--muted-foreground)",
            marginBottom: "5px",
          }}>
            New Form
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 400,
            color: "var(--foreground)",
            lineHeight: 1.1,
          }}>
            Draft a new <em style={{ color: "#C89B63" }}>form</em>.
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "5px" }}>
            Set up the basics, then add your fields.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => createForm.mutate(d))}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* ── Basic Info ── */}
          <Card>
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{
                fontSize: "11px", textTransform: "uppercase",
                letterSpacing: "0.28em", color: "var(--muted-foreground)",
                marginBottom: "1.25rem", fontWeight: 500,
              }}>
                Basic Info
              </p>

              <div style={{ marginBottom: "1.25rem" }}>
                <Label>Form Title *</Label>
                <input
                  {...register("title")}
                  placeholder="e.g. Morning survey, Team feedback…"
                  style={focusStyle("title")}
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.title && (
                  <p style={{ fontSize: "12px", color: "#C05050", marginTop: "5px" }}>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Tell respondents what this form is about…"
                  style={{
                    ...focusStyle("description"),
                    resize: "none",
                    lineHeight: 1.6,
                  }}
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </Card>

          {/* ── Settings ── */}
          <Card>
            <p style={{
              fontSize: "11px", textTransform: "uppercase",
              letterSpacing: "0.28em", color: "var(--muted-foreground)",
              marginBottom: "1.25rem", fontWeight: 500,
            }}>
              Settings
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {/* Toggle row */}
              {[
                {
                  key: "allowMultipleResponses" as const,
                  checked: allowMultiple,
                  title: "Allow multiple responses",
                  sub: "Same person can submit more than once",
                },
                {
                  key: "showProgressBar" as const,
                  checked: showProgress,
                  title: "Show progress bar",
                  sub: "Displays completion progress to respondents",
                },
              ].map(({ key, checked, title, sub }, i) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 0",
                    borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "14px", color: "var(--foreground)", marginBottom: "2px" }}>{title}</p>
                    <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{sub}</p>
                  </div>
                  <Toggle checked={checked} onChange={(v) => setValue(key, v)} />
                </div>
              ))}
            </div>

            {/* Text fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.25rem" }}>
              <div>
                <Label>Submit button text</Label>
                <input
                  {...register("submitButtonText")}
                  placeholder="Submit"
                  style={focusStyle("submitButtonText")}
                  onFocus={() => setFocusedField("submitButtonText")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              <div>
                <Label>Success message</Label>
                <input
                  {...register("successMessage")}
                  placeholder="Thank you for your time."
                  style={focusStyle("successMessage")}
                  onFocus={() => setFocusedField("successMessage")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </Card>

          {/* ── Actions ── */}
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/dashboard"
              style={{
                flex: 1,
                textAlign: "center",
                padding: "11px 0",
                borderRadius: "999px",
                fontSize: "13px",
                fontFamily: "'Inter', sans-serif",
                color: "var(--muted-foreground)",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                textDecoration: "none",
                transition: "background .2s, color .2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
              }}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={createForm.isPending}
              className="ef-btn-primary"
              style={{
                flex: 2,
                padding: "11px 0",
                borderRadius: "999px",
                fontSize: "13px",
                fontFamily: "'Inter', sans-serif",
                cursor: createForm.isPending ? "not-allowed" : "pointer",
                opacity: createForm.isPending ? 0.65 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: "none",
              }}
            >
              {createForm.isPending
                ? <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Creating…</>
                : <>Create &amp; add fields <ArrowRight style={{ width: 14, height: 14 }} /></>
              }
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
