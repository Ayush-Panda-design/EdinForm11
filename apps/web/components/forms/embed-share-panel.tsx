"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";

export function EmbedSharePanel({ slug, formTitle }: { slug: string; formTitle: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<"iframe" | "script" | "link" | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const formUrl = `${origin}/forms/${slug}`;
  const embedUrl = `${formUrl}?embed=1`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  title="${formTitle.replace(/"/g, "&quot;")}"
  width="100%"
  height="600"
  frameborder="0"
  style="border:none;border-radius:12px;min-height:480px"
  allow="clipboard-write"
></iframe>`;

  const scriptCode = `<div data-edinform-form="${slug}"></div>
<script async src="${origin}/embed.js" data-form="${slug}"></script>`;

  const copy = async (text: string, kind: "iframe" | "script" | "link") => {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium dash-text mb-1">Share link</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={formUrl}
            className="ef-input flex-1 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => copy(formUrl, "link")}
            className="ef-btn-ghost rounded-lg px-3 py-2 text-sm inline-flex items-center gap-1.5"
          >
            {copied === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium dash-text inline-flex items-center gap-1.5">
            <Code2 className="w-4 h-4 dash-accent" /> Embed iframe
          </p>
          <button
            type="button"
            onClick={() => copy(iframeCode, "iframe")}
            className="text-xs font-medium dash-accent hover:underline inline-flex items-center gap-1"
          >
            {copied === "iframe" ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy code
          </button>
        </div>
        <pre
          className="text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all"
          style={{
            background: "var(--dash-bg)",
            border: "1px solid var(--dash-border)",
            color: "var(--dash-muted)",
          }}
        >
          {iframeCode}
        </pre>
        {origin && (
          <div
            className="mt-3 rounded-xl overflow-hidden border"
            style={{ borderColor: "var(--dash-border)" }}
          >
            <p
              className="text-[10px] uppercase tracking-wider px-3 py-2 dash-faint border-b"
              style={{ borderColor: "var(--dash-border)" }}
            >
              Live preview
            </p>
            <iframe
              src={embedUrl}
              title={`Embed preview: ${formTitle}`}
              className="w-full bg-white"
              style={{ height: 360, border: "none" }}
            />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium dash-text">Script embed</p>
          <button
            type="button"
            onClick={() => copy(scriptCode, "script")}
            className="text-xs font-medium dash-accent hover:underline inline-flex items-center gap-1"
          >
            {copied === "script" ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy code
          </button>
        </div>
        <pre
          className="text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all"
          style={{
            background: "var(--dash-bg)",
            border: "1px solid var(--dash-border)",
            color: "var(--dash-muted)",
          }}
        >
          {scriptCode}
        </pre>
      </div>
    </div>
  );
}
