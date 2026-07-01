export type DashboardTemplateId =
  | "edinform"
  | "studio"
  | "vintage"
  | "web3"
  | "restaurant"
  | "analytics";

export interface DashboardTemplateMeta {
  id: DashboardTemplateId;
  name: string;
  description: string;
  /** Preview swatches for the settings picker */
  swatches: [string, string, string];
  /** Mood label shown in settings */
  mood: string;
}

export const DASHBOARD_TEMPLATES: DashboardTemplateMeta[] = [
  {
    id: "edinform",
    name: "EdinForm Classic",
    description: "Warm Edinburgh gold on deep charcoal — the default studio look.",
    swatches: ["#14110C", "#C89B63", "#7EB884"],
    mood: "Editorial warmth",
  },
  {
    id: "studio",
    name: "Creative Studio",
    description: "High-contrast black canvas with layered cards and crisp typography.",
    swatches: ["#0A0A0A", "#F0F0F0", "#3A3A3A"],
    mood: "Minimal dark",
  },
  {
    id: "vintage",
    name: "Vintage Sage",
    description: "Muted sage and chocolate tones inspired by handcrafted editorial layouts.",
    swatches: ["#5C6B52", "#3D2B1F", "#E8DFC8"],
    mood: "Rustic calm",
  },
  {
    id: "web3",
    name: "Web3 Pulse",
    description: "Electric blues and purples with bold KPI cards and gradient depth.",
    swatches: ["#0B0B1A", "#5B8CFF", "#A855F7"],
    mood: "Vibrant tech",
  },
  {
    id: "restaurant",
    name: "Restaurant Coral",
    description: "Soft coral accents and rounded operational cards for day-to-day management.",
    swatches: ["#FFF8F5", "#FF7F5C", "#2D2D2D"],
    mood: "Warm operational",
  },
  {
    id: "analytics",
    name: "Analytics Neon",
    description: "Dark glass panels with neon pink highlights for data-heavy views.",
    swatches: ["#121018", "#FF4D8D", "#7C5CFF"],
    mood: "Data neon",
  },
];

export const DEFAULT_DASHBOARD_TEMPLATE: DashboardTemplateId = "edinform";

export const DASHBOARD_TEMPLATE_STORAGE_KEY = "edinform_dashboard_template";

export function getTemplateMeta(id: DashboardTemplateId): DashboardTemplateMeta {
  return DASHBOARD_TEMPLATES.find((t) => t.id === id) ?? DASHBOARD_TEMPLATES[0]!;
}
