/** Built-in advanced templates — always available, no DB seed required */

export type BuiltinField = {
  type:
    | "short_text"
    | "long_text"
    | "email"
    | "number"
    | "single_select"
    | "multi_select"
    | "checkbox"
    | "date"
    | "rating";
  label: string;
  required: boolean;
  order: number;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  validationRules?: Record<string, unknown>;
};

export type BuiltinTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  estimatedMinutes: number;
  fieldCount: number;
  formSnapshot: {
    title: string;
    description?: string;
    submitButtonText?: string;
    successMessage?: string;
    showProgressBar?: boolean;
    fields: BuiltinField[];
  };
};

function opts(...labels: string[]) {
  return labels.map((label) => ({
    value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    label,
  }));
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: "builtin:nps",
    name: "NPS survey",
    description: "Measure loyalty with a Net Promoter Score and follow-up reasons.",
    category: "Feedback",
    tags: ["nps", "loyalty", "product"],
    estimatedMinutes: 2,
    fieldCount: 4,
    formSnapshot: {
      title: "How likely are you to recommend us?",
      description: "Your feedback helps us improve — takes under 2 minutes.",
      submitButtonText: "Send feedback",
      successMessage: "Thank you — your score helps us get better.",
      showProgressBar: true,
      fields: [
        {
          type: "rating",
          label: "How likely are you to recommend us to a friend or colleague?",
          required: true,
          order: 0,
          helpText: "0 = not at all likely, 5 = extremely likely",
          validationRules: { minRating: 0, maxRating: 5 },
        },
        {
          type: "single_select",
          label: "What best describes your experience?",
          required: true,
          order: 1,
          options: opts("Exceeded expectations", "Met expectations", "Below expectations"),
        },
        {
          type: "long_text",
          label: "What's the main reason for your score?",
          required: false,
          order: 2,
          placeholder: "Tell us more…",
        },
        {
          type: "email",
          label: "Email (optional — if we can follow up)",
          required: false,
          order: 3,
          placeholder: "you@company.com",
        },
      ],
    },
  },
  {
    id: "builtin:customer-feedback",
    name: "Customer feedback",
    description: "Product or service feedback with ratings and open comments.",
    category: "Feedback",
    tags: ["feedback", "product", "csat"],
    estimatedMinutes: 3,
    fieldCount: 5,
    formSnapshot: {
      title: "We'd love your feedback",
      description: "Help us understand what worked and what we can improve.",
      submitButtonText: "Submit feedback",
      successMessage: "Thanks for sharing your thoughts!",
      fields: [
        {
          type: "rating",
          label: "Overall, how satisfied are you?",
          required: true,
          order: 0,
          validationRules: { maxRating: 5 },
        },
        {
          type: "single_select",
          label: "Which area matters most to you?",
          required: true,
          order: 1,
          options: opts("Product quality", "Support", "Pricing", "Ease of use", "Other"),
        },
        {
          type: "long_text",
          label: "What did you like most?",
          required: false,
          order: 2,
        },
        {
          type: "long_text",
          label: "What should we improve?",
          required: false,
          order: 3,
        },
        {
          type: "email",
          label: "Your email",
          required: false,
          order: 4,
        },
      ],
    },
  },
  {
    id: "builtin:event-rsvp",
    name: "Event RSVP",
    description: "Collect attendance, guest count, and dietary needs.",
    category: "Events",
    tags: ["rsvp", "event", "registration"],
    estimatedMinutes: 2,
    fieldCount: 6,
    formSnapshot: {
      title: "You're invited — RSVP",
      description: "Please let us know if you can make it.",
      submitButtonText: "Confirm RSVP",
      successMessage: "You're on the list. See you there!",
      fields: [
        { type: "short_text", label: "Full name", required: true, order: 0 },
        { type: "email", label: "Email", required: true, order: 1 },
        {
          type: "single_select",
          label: "Will you attend?",
          required: true,
          order: 2,
          options: opts("Yes", "No", "Maybe"),
        },
        {
          type: "number",
          label: "Number of guests (including you)",
          required: true,
          order: 3,
          validationRules: { min: 1, max: 10 },
        },
        {
          type: "multi_select",
          label: "Dietary preferences",
          required: false,
          order: 4,
          options: opts("None", "Vegetarian", "Vegan", "Gluten-free", "Nut allergy"),
        },
        {
          type: "long_text",
          label: "Anything else we should know?",
          required: false,
          order: 5,
        },
      ],
    },
  },
  {
    id: "builtin:job-application",
    name: "Job application",
    description: "Screen candidates with role fit, experience, and contact details.",
    category: "HR",
    tags: ["hiring", "jobs", "careers"],
    estimatedMinutes: 5,
    fieldCount: 7,
    formSnapshot: {
      title: "Apply for this role",
      description: "Tell us about yourself — we'll review every application.",
      submitButtonText: "Submit application",
      successMessage: "Application received. We'll be in touch.",
      fields: [
        { type: "short_text", label: "Full name", required: true, order: 0 },
        { type: "email", label: "Email", required: true, order: 1 },
        {
          type: "short_text",
          label: "LinkedIn or portfolio URL",
          required: false,
          order: 2,
          placeholder: "https://",
        },
        {
          type: "single_select",
          label: "Years of relevant experience",
          required: true,
          order: 3,
          options: opts("0–1", "2–4", "5–7", "8+"),
        },
        {
          type: "long_text",
          label: "Why are you a great fit?",
          required: true,
          order: 4,
        },
        {
          type: "single_select",
          label: "When can you start?",
          required: true,
          order: 5,
          options: opts("Immediately", "In 2 weeks", "In a month", "Flexible"),
        },
        {
          type: "checkbox",
          label: "I confirm the information is accurate",
          required: true,
          order: 6,
        },
      ],
    },
  },
  {
    id: "builtin:registration",
    name: "Registration form",
    description: "Sign-ups for waitlists, courses, or early access.",
    category: "Lead gen",
    tags: ["signup", "waitlist", "leads"],
    estimatedMinutes: 1,
    fieldCount: 4,
    formSnapshot: {
      title: "Join the waitlist",
      description: "Be first to know when we launch.",
      submitButtonText: "Join waitlist",
      successMessage: "You're on the list!",
      fields: [
        { type: "short_text", label: "Name", required: true, order: 0 },
        { type: "email", label: "Work email", required: true, order: 1 },
        {
          type: "short_text",
          label: "Company",
          required: false,
          order: 2,
        },
        {
          type: "single_select",
          label: "Team size",
          required: false,
          order: 3,
          options: opts("Just me", "2–10", "11–50", "51–200", "200+"),
        },
      ],
    },
  },
  {
    id: "builtin:bug-report",
    name: "Bug report",
    description: "Structured issue reports for product and support teams.",
    category: "Support",
    tags: ["bugs", "support", "qa"],
    estimatedMinutes: 3,
    fieldCount: 6,
    formSnapshot: {
      title: "Report a bug",
      description: "The more detail you share, the faster we can fix it.",
      submitButtonText: "Submit report",
      successMessage: "Report received — thank you!",
      fields: [
        {
          type: "short_text",
          label: "Short summary",
          required: true,
          order: 0,
          placeholder: "e.g. Submit button does nothing on mobile",
        },
        {
          type: "single_select",
          label: "Severity",
          required: true,
          order: 1,
          options: opts("Blocker", "Major", "Minor", "Cosmetic"),
        },
        {
          type: "long_text",
          label: "Steps to reproduce",
          required: true,
          order: 2,
        },
        {
          type: "long_text",
          label: "Expected vs actual behavior",
          required: true,
          order: 3,
        },
        {
          type: "short_text",
          label: "Browser / device",
          required: false,
          order: 4,
        },
        { type: "email", label: "Your email", required: false, order: 5 },
      ],
    },
  },
  {
    id: "builtin:quiz",
    name: "Knowledge quiz",
    description: "Short quiz with multiple choice and a confidence rating.",
    category: "Education",
    tags: ["quiz", "education", "training"],
    estimatedMinutes: 4,
    fieldCount: 5,
    formSnapshot: {
      title: "Quick knowledge check",
      description: "Answer a few questions — no grades, just learning.",
      submitButtonText: "Finish quiz",
      successMessage: "Done! Thanks for taking the quiz.",
      fields: [
        { type: "short_text", label: "Your name", required: false, order: 0 },
        {
          type: "single_select",
          label: "What is the capital of France?",
          required: true,
          order: 1,
          options: opts("Berlin", "Paris", "Madrid", "Rome"),
        },
        {
          type: "single_select",
          label: "2 + 2 × 2 = ?",
          required: true,
          order: 2,
          options: opts("6", "8", "4", "2"),
        },
        {
          type: "multi_select",
          label: "Which are programming languages?",
          required: true,
          order: 3,
          options: opts("Python", "HTML", "JavaScript", "CSS"),
        },
        {
          type: "rating",
          label: "How confident are you in your answers?",
          required: false,
          order: 4,
          validationRules: { maxRating: 5 },
        },
      ],
    },
  },
  {
    id: "builtin:contact",
    name: "Contact form",
    description: "Simple contact intake with topic and message.",
    category: "Lead gen",
    tags: ["contact", "support"],
    estimatedMinutes: 1,
    fieldCount: 4,
    formSnapshot: {
      title: "Contact us",
      description: "We usually reply within one business day.",
      submitButtonText: "Send message",
      successMessage: "Message sent — we'll get back to you soon.",
      fields: [
        { type: "short_text", label: "Name", required: true, order: 0 },
        { type: "email", label: "Email", required: true, order: 1 },
        {
          type: "single_select",
          label: "Topic",
          required: true,
          order: 2,
          options: opts("Sales", "Support", "Partnership", "Other"),
        },
        {
          type: "long_text",
          label: "Message",
          required: true,
          order: 3,
          placeholder: "How can we help?",
        },
      ],
    },
  },
];

export function getBuiltinTemplate(id: string): BuiltinTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}

export function listBuiltinTemplates(opts?: {
  category?: string;
  search?: string;
}): BuiltinTemplate[] {
  let list = [...BUILTIN_TEMPLATES];
  if (opts?.category && opts.category !== "All") {
    list = list.filter((t) => t.category === opts.category);
  }
  if (opts?.search?.trim()) {
    const q = opts.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q)) ||
        t.category.toLowerCase().includes(q),
    );
  }
  return list;
}

export const TEMPLATE_CATEGORIES = [
  "All",
  "Feedback",
  "Events",
  "HR",
  "Lead gen",
  "Support",
  "Education",
] as const;
