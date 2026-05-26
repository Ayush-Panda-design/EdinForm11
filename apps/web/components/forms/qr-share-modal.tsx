"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Download, QrCode, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QRShareModalProps {
  open: boolean;
  onClose: () => void;
  formTitle: string;
  formSlug: string;
}

export function QRShareModal({ open, onClose, formTitle, formSlug }: QRShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const formUrl = `${origin}/forms/${formSlug}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById("form-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    canvas.width = 400;
    canvas.height = 400;
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 400, 400);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formSlug}-qr.png`;
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-900/30 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-stone-900 dark:text-stone-400" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Share Form</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
            Share <span className="font-medium text-gray-700 dark:text-gray-300">{formTitle}</span> with a link or QR code
          </p>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="p-5 bg-white rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-inner">
              {origin && (
                <QRCodeSVG
                  id="form-qr-svg"
                  value={formUrl}
                  size={180}
                  level="H"
                  includeMargin={false}
                  fgColor="#4f46e5"
                  bgColor="#ffffff"
                />
              )}
            </div>
          </div>

          {/* URL */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-w-0">
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{formUrl}</span>
            </div>
            <button
              onClick={copyLink}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-stone-900 hover:bg-stone-900 text-white"
              }`}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadQR}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" /> Download QR
            </button>
            <a
              href={formUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Open Form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
