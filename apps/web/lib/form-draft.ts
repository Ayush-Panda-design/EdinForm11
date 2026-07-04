/** Client-side draft storage for save & resume */

export type LocalDraft = {
  answers: Record<string, string | string[]>;
  currentStep: number;
  draftResponseId?: string;
  savedAt: string;
};

const key = (formId: string) => `edinform_draft_${formId}`;

export function loadLocalDraft(formId: string): LocalDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key(formId));
    if (!raw) return null;
    return JSON.parse(raw) as LocalDraft;
  } catch {
    return null;
  }
}

export function saveLocalDraft(formId: string, draft: LocalDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(formId), JSON.stringify(draft));
  } catch {
    /* quota / private mode */
  }
}

export function clearLocalDraft(formId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key(formId));
  } catch {
    /* ignore */
  }
}
