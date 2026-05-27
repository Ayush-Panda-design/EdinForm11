import Link from "next/link";
import { Check } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[rgba(200,155,99,0.10)] blur-3xl" />

        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[rgba(139,115,85,0.08)] blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px)] [background-size:80px_100%]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-4"
          >
            <div className="ef-btn-primary flex h-11 w-11 items-center justify-center rounded-2xl">
              <span className="font-display text-lg font-semibold">
                E
              </span>
            </div>

            <div>
              <div className="font-display text-2xl tracking-[-0.04em] text-foreground">
                EdinForm
              </div>

              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                cinematic form building
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="ef-btn-ghost rounded-2xl px-5 py-2.5 text-sm"
            >
              Sign in
            </Link>

            <Link
              href="/auth/register"
              className="ef-btn-primary rounded-2xl px-5 py-2.5 text-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-[rgba(200,155,99,0.18)] bg-[rgba(200,155,99,0.08)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--accent-amber)] backdrop-blur-xl">
            Pricing
          </div>

          <h1 className="font-display text-6xl leading-none tracking-[-0.06em] text-foreground md:text-7xl">
            Simple pricing,
            <br />
            built to scale
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Start free and grow naturally —
            from personal forms to enterprise workflows,
            without hidden costs or complexity.
          </p>

          <div className="mx-auto mt-10 h-px w-40 ef-divider" />
        </div>
      </section>

      {/* Pricing cards */}
      <section className="relative z-10 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative overflow-hidden rounded-[32px] p-8 transition-all duration-500 ${
                plan.highlight
                  ? "border border-[rgba(200,155,99,0.22)] bg-[linear-gradient(180deg,rgba(200,155,99,0.12),rgba(255,255,255,0.03))] shadow-[0_20px_80px_rgba(200,155,99,0.12)]"
                  : "ef-card"
              }`}
            >
              {/* Glow */}
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[rgba(200,155,99,0.08)] blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

              {/* Popular badge */}
              {plan.highlight && (
                <div className="absolute right-6 top-6 rounded-full border border-[rgba(200,155,99,0.24)] bg-[rgba(200,155,99,0.12)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--accent-amber)] backdrop-blur-xl">
                  Most popular
                </div>
              )}

              <div className="relative z-10">
                {/* Heading */}
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {plan.name}
                  </p>

                  <h2 className="mt-3 font-display text-5xl tracking-[-0.05em] text-foreground">
                    {plan.price}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    / {plan.period}
                  </p>

                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {plan.desc}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-300 ${
                    plan.highlight
                      ? "ef-btn-primary"
                      : "ef-btn-ghost"
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div className="my-8 h-px ef-divider" />

                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(200,155,99,0.20)] bg-[rgba(200,155,99,0.08)]">
                        <Check className="h-3 w-3 text-[var(--accent-amber)]" />
                      </div>

                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mx-auto mt-16 max-w-3xl text-center">
          <div className="ef-glass-soft rounded-3xl px-8 py-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every plan includes a 14-day free trial.
              No credit card required.
              Payment integration shown here is a demo placeholder.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
