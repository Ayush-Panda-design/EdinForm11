import type { LucideIcon } from "lucide-react";
import {
  Layers,
  GitBranch,
  Eye,
  BarChart3,
  ShieldCheck,
  Share2,
  Zap,
  Users,
  Globe,
} from "lucide-react";

import { LANDING_IMAGES } from "~/components/landing/landing-images";

export const TRUST_LOGOS = ["DEPT®", "Mono", "Forma", "Layers", "Craft", "Arc", "DEPT®", "Mono"];

export const HOW_STEPS = [
  {
    n: "01",
    title: "Draft your form",
    body: "Pick from 9 field types and reorder with drag-and-drop.",
    color: "#34d399",
    image: LANDING_IMAGES.steps.draft,
    imageAlt: "Person drafting a multi-step form on a laptop",
  },
  {
    n: "02",
    title: "Add logic & branching",
    body: "Set if/then rules so respondents only see relevant questions.",
    color: "#22d3ee",
    image: LANDING_IMAGES.steps.logic,
    imageAlt: "Team mapping form logic with sticky notes on a wall",
  },
  {
    n: "03",
    title: "Publish in one click",
    body: "Share a link, embed snippet, or QR code — works on any device.",
    color: "#22d3ee",
    image: LANDING_IMAGES.steps.publish,
    imageAlt: "Respondent filling out a form on a smartphone",
  },
  {
    n: "04",
    title: "Read and act on replies",
    body: "Filter, search, export CSV, and view charts in real time.",
    color: "#34d399",
    image: LANDING_IMAGES.steps.analytics,
    imageAlt: "Form response analytics on a dashboard",
  },
];

export type BentoFeature = {
  icon: LucideIcon;
  n: string;
  title: string;
  body: string;
  color: string;
};

export const BENTO_FEATURES: BentoFeature[] = [
  {
    icon: Layers,
    n: "01",
    title: "Nine field types",
    body: "Short text, long text, multiple choice, checkboxes, rating, date, file upload, email, and number — accessible by default.",
    color: "#34d399",
  },
  {
    icon: GitBranch,
    n: "02",
    title: "Conditional branching",
    body: "Skip irrelevant questions and build decision trees without code.",
    color: "#22d3ee",
  },
  {
    icon: Eye,
    n: "03",
    title: "Live preview",
    body: "See every logic path before you publish.",
    color: "#22d3ee",
  },
  {
    icon: BarChart3,
    n: "04",
    title: "Built-in analytics",
    body: "Completion rates, drop-off points, and per-question summaries.",
    color: "#34d399",
  },
  {
    icon: ShieldCheck,
    n: "05",
    title: "Spam protection",
    body: "Rate limits, honeypots, and email validation keep data clean.",
    color: "#22d3ee",
  },
  {
    icon: Share2,
    n: "06",
    title: "Flexible sharing",
    body: "Public links, passwords, embeds, and QR codes.",
    color: "#34d399",
  },
  {
    icon: Zap,
    n: "07",
    title: "Webhooks & integrations",
    body: "Route submissions to Zapier, Make, or any REST endpoint.",
    color: "#22d3ee",
  },
  {
    icon: Users,
    n: "08",
    title: "Team collaboration",
    body: "Invite editors and viewers with full audit history on paid plans.",
    color: "#34d399",
  },
  {
    icon: Globe,
    n: "09",
    title: "Custom branding",
    body: "Your domain, logo, colors, and fonts — not a generic form tool.",
    color: "#22d3ee",
  },
];

export const LANDING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for getting started",
    features: [
      "Up to 5 forms",
      "100 responses/month",
      "9 field types",
      "Basic analytics",
      "Public & unlisted forms",
      "Email notifications",
    ],
    cta: "Get started",
    href: "/auth/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    desc: "For creators who need more",
    features: [
      "Unlimited forms",
      "10,000 responses/month",
      "All field types",
      "Advanced analytics",
      "CSV export",
      "Custom slugs",
      "Priority support",
      "Remove EdinForm branding",
    ],
    cta: "Start free trial",
    href: "/auth/register",
    highlight: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    desc: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Unlimited responses",
      "Team collaboration",
      "SSO / SAML",
      "Audit logs",
      "SLA guarantee",
      "Dedicated support",
      "Custom domain",
    ],
    cta: "Contact sales",
    href: "/auth/register",
    highlight: false,
  },
];

export const TESTIMONIALS = [
  {
    q: "We replaced three different tools with EdinForm. It does everything, in one place, and it looks better than any of them.",
    name: "Isla M.",
    role: "Head of Research",
    company: "DEPT®",
    metric: "34%",
    metricLabel: "faster launch",
    category: "Research Software",
    stars: 5,
    avatar: LANDING_IMAGES.testimonials.isla,
  },
  {
    q: "The branching logic is the best I've used. Building a path for yes/no answers used to take me 30 minutes. With EdinForm it takes 90 seconds.",
    name: "Marcus K.",
    role: "Product Designer",
    company: "Mono",
    metric: "90s",
    metricLabel: "to ship logic",
    category: "Product Teams",
    stars: 5,
    avatar: LANDING_IMAGES.testimonials.marcus,
  },
  {
    q: "Completion rates went up when we switched. I attribute most of that to the cleaner interface and conditional logic eliminating irrelevant questions.",
    name: "Tom H.",
    role: "Growth Lead",
    company: "Layers",
    metric: "↑34%",
    metricLabel: "completion rate",
    category: "Growth & Ops",
    stars: 5,
    avatar: LANDING_IMAGES.testimonials.tom,
  },
  {
    q: "Clients mention the forms. That never happened before. They say things like 'that felt polished'. That's EdinForm.",
    name: "Priya R.",
    role: "Studio Lead",
    company: "Forma",
    metric: "5★",
    metricLabel: "client feedback",
    category: "Creative Agencies",
    stars: 5,
    avatar: LANDING_IMAGES.testimonials.priya,
  },
  {
    q: "The analytics are genuinely useful. I can see exactly where people abandon the form and fix it.",
    name: "Sara L.",
    role: "UX Researcher",
    company: "Craft",
    metric: "100%",
    metricLabel: "visibility",
    category: "UX Research",
    stars: 5,
    avatar: LANDING_IMAGES.testimonials.sara,
  },
  {
    q: "We run all our user interviews through EdinForm now. The embed is clean and our completion rates reflect that.",
    name: "James O.",
    role: "Design Lead",
    company: "Arc",
    metric: "2×",
    metricLabel: "response rate",
    category: "Design Studios",
    stars: 5,
    avatar: LANDING_IMAGES.testimonials.james,
  },
];

export const PROBLEM_INSIGHTS = [
  {
    title: "Response volume",
    viz: "sparkline" as const,
    caption: "See every submission stream in — no refresh, no export lag.",
  },
  {
    title: "Time spent on form setup",
    viz: "bar" as const,
    caption: "Cut setup from hours to minutes with drag-and-drop and templates.",
  },
  {
    title: "Drop-off detection",
    viz: "calendar" as const,
    caption: "Pinpoint exactly where respondents leave — fix it before the next send.",
  },
];

export const STATS = [
  { raw: 10000, suffix: "+", label: "Forms created" },
  { raw: 1200000, suffix: "+", label: "Responses collected" },
  { raw: 99.9, suffix: "%", label: "Uptime SLA", fixed: 1 as const },
  { raw: 4.9, suffix: "/5", label: "Average rating", fixed: 1 as const },
];
