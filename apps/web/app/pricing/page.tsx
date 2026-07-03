import Link from "next/link";
import { Check } from "lucide-react";
import { PublicShell } from "~/components/layout/public-shell";

const plans = [
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

export default function PricingPage() {
  return (
    <PublicShell
      title="Simple pricing, built to scale"
      subtitle="Start free and grow from personal forms to team workflows — no hidden costs."
    >
      <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`public-card relative p-8 ${
              plan.highlight
                ? "border-[rgba(34,211,238,0.35)] shadow-[0_0_40px_rgba(34,211,238,0.08)]"
                : ""
            }`}
          >
            {plan.highlight && (
              <span className="absolute right-6 top-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--signal-accent)] border border-[rgba(34,211,238,0.3)] rounded-full px-3 py-1">
                Popular
              </span>
            )}

            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{plan.name}</p>
            <p className="mt-3 text-4xl font-bold text-foreground">{plan.price}</p>
            <p className="text-sm text-muted-foreground">/ {plan.period}</p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{plan.desc}</p>

            <Link
              href={plan.href}
              className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold ${
                plan.highlight ? "ef-btn-primary" : "ef-btn-ghost"
              }`}
            >
              {plan.cta}
            </Link>

            <ul className="mt-8 space-y-3 border-t border-[var(--border)] pt-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.08)]">
                    <Check className="h-3 w-3 text-[var(--signal-accent)]" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground max-w-xl mx-auto">
        Every plan includes a 14-day free trial. No credit card required. Payment integration shown
        here is a demo placeholder.
      </p>
    </PublicShell>
  );
}
