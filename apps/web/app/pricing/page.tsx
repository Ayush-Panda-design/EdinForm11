import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for getting started",
    features: ["Up to 5 forms", "100 responses/month", "9 field types", "Basic analytics", "Public & unlisted forms", "Email notifications"],
    cta: "Get started",
    href: "/auth/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    desc: "For creators who need more",
    features: ["Unlimited forms", "10,000 responses/month", "All field types", "Advanced analytics", "CSV export", "Custom slugs", "Priority support", "Remove EdinForm branding"],
    cta: "Start free trial",
    href: "/auth/register",
    highlight: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    desc: "For teams and organizations",
    features: ["Everything in Pro", "Unlimited responses", "Team collaboration", "SSO / SAML", "Audit logs", "SLA guarantee", "Dedicated support", "Custom domain"],
    cta: "Contact sales",
    href: "/auth/register",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-900 to-stone-900 flex items-center justify-center">
            <span className="text-stone-50 dark:text-stone-900 font-bold text-sm">E</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">EdinForm</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Sign in</Link>
          <Link href="/auth/register" className="text-sm bg-gradient-to-r from-stone-900 to-stone-900 text-white px-4 py-2 rounded-lg hover:opacity-90">Get started</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-xl mx-auto">
          Start free. Scale as you grow. No hidden fees.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl p-8 text-left ${
              plan.highlight
                ? "bg-gradient-to-b from-stone-900 to-stone-900 text-white shadow-2xl shadow-stone-200 dark:shadow-stone-900/30 scale-105"
                : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
            }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-stone-700 to-stone-700 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h2 className={`text-lg font-semibold mb-1 ${plan.highlight ? "text-stone-100" : "text-gray-900 dark:text-white"}`}>{plan.name}</h2>
              <p className={`text-sm mb-4 ${plan.highlight ? "text-stone-200" : "text-gray-500"}`}>{plan.desc}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-gray-900 dark:text-white"}`}>{plan.price}</span>
                <span className={`text-sm mb-1 ${plan.highlight ? "text-stone-200" : "text-gray-500"}`}>/{plan.period}</span>
              </div>
              <Link href={plan.href} className={`block text-center py-3 rounded-xl font-semibold mb-8 transition-colors ${
                plan.highlight
                  ? "bg-white text-stone-900 hover:bg-stone-50"
                  : "bg-gradient-to-r from-stone-900 to-stone-900 text-white hover:opacity-90"
              }`}>
                {plan.cta}
              </Link>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-stone-200" : "text-stone-900 dark:text-stone-400"}`} />
                    <span className={plan.highlight ? "text-stone-100" : "text-gray-700 dark:text-gray-300"}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-12">
          All plans include a 14-day free trial. No credit card required. Real payment integration is a demo placeholder.
        </p>
      </div>
    </div>
  );
}
