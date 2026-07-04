/** Contextual and full-platform help copy for EdinForm */

export type HelpTipContent = {
  title: string;
  body: string;
  steps?: string[];
  tip?: string;
  guideHref?: string;
  guideLabel?: string;
};

export const SECTION_HELP = {
  home: {
    title: "Your forms home",
    body: "This is your workspace overview. Create forms, open recent ones, and jump into analytics.",
    steps: [
      "Click Blank form or browse Templates to start",
      "Open a form card to edit questions",
      "Use ⋮ on a card for publish, QR, duplicate, or delete",
    ],
    tip: "Published forms can be shared via link, QR, or embed.",
    guideHref: "/dashboard/help#getting-started",
    guideLabel: "Full getting started guide",
  },
  create: {
    title: "Create a form",
    body: "Start blank or use a template. Templates pre-fill questions, button text, and success messages.",
    steps: [
      "Browse the template gallery for NPS, RSVP, jobs, and more",
      "Or enter a title and create a blank form",
      "You’ll land in the builder to add fields",
    ],
    tip: "Templates are the fastest path for new users.",
    guideHref: "/dashboard/help#create",
    guideLabel: "How creation works",
  },
  templates: {
    title: "Template gallery",
    body: "Pick a use-case template, preview its questions, then create a form in one click.",
    steps: [
      "Filter by category or search",
      "Select a card to preview fields on the right",
      "Click Use this template to open the builder",
    ],
    tip: "You can edit every field after applying a template.",
    guideHref: "/dashboard/help#templates",
    guideLabel: "Templates guide",
  },
  analytics: {
    title: "Analytics",
    body: "Track views, submissions, conversion, and trends across all your forms.",
    steps: [
      "Use 7d / 30d / 90d to change the range",
      "Open a form’s Full analytics for field-level charts",
      "Enable daily digest in form Settings for email summaries",
    ],
    tip: "Conversion = submissions ÷ views.",
    guideHref: "/dashboard/help#analytics",
    guideLabel: "Analytics guide",
  },
  settings: {
    title: "Account settings",
    body: "Your profile details and appearance preferences for the workspace.",
    steps: ["Switch light or dark theme anytime", "Theme preference is saved on this device"],
    tip: "Form-level notifications live in each form’s Settings tab.",
    guideHref: "/dashboard/help#settings",
    guideLabel: "Settings guide",
  },
  builder: {
    title: "Form builder",
    body: "Three columns: add fields (left), arrange questions (center), edit the selected field (right).",
    steps: [
      "Click a field type on the left to insert it",
      "Drag the grip handle to reorder questions",
      "Select a question to edit label, options, logic, and validation",
      "Preview, then Publish when ready",
    ],
    tip: "Turn on “One question at a time” for a Typeform-style experience.",
    guideHref: "/dashboard/help#builder",
    guideLabel: "Builder guide",
  },
  builderSettings: {
    title: "Form settings",
    body: "Control themes, submit copy, notifications, webhooks, and embed code.",
    steps: [
      "Customize submit button and success message",
      "Enable email alerts with answer summaries",
      "Paste a Slack/Discord webhook for instant pings",
      "Copy iframe or script embed for your website",
    ],
    tip: "Embed only works after the form is published.",
    guideHref: "/dashboard/help#share",
    guideLabel: "Share & notify guide",
  },
  responses: {
    title: "Responses",
    body: "Review every submission, open details, and export to CSV.",
    steps: [
      "Click a row to open the full response",
      "Export CSV for spreadsheets",
      "Mark spam if needed",
    ],
    tip: "Respondents can save progress and resume later on public forms.",
    guideHref: "/dashboard/help#responses",
    guideLabel: "Responses guide",
  },
  formAnalytics: {
    title: "Form analytics",
    body: "Deep dive into one form: trends, field performance, and completion.",
    steps: [
      "Check which questions get the most answers",
      "Watch conversion over time",
      "Use insights to shorten or clarify weak questions",
    ],
    guideHref: "/dashboard/help#analytics",
    guideLabel: "Analytics guide",
  },
  admin: {
    title: "Admin",
    body: "Platform-wide users, forms, sessions, and health metrics (admin only).",
    steps: ["Review users and roles", "Inspect forms and sessions", "Monitor overall activity"],
    guideHref: "/dashboard/help#admin",
    guideLabel: "Admin guide",
  },
} as const satisfies Record<string, HelpTipContent>;

export type SectionHelpKey = keyof typeof SECTION_HELP;

export type GuideSection = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  tips?: string[];
};

export const FULL_GUIDE: GuideSection[] = [
  {
    id: "getting-started",
    title: "Getting started",
    summary: "Create your first form and collect responses in minutes.",
    steps: [
      "Go to Create or open Templates",
      "Add questions in the builder (left palette → center canvas)",
      "Click Preview to see the respondent experience",
      "Publish as Public or Unlisted",
      "Share the link, QR code, or embed snippet",
    ],
    tips: [
      "Unlisted forms are only reachable via direct link (not on Explore).",
      "Draft forms never accept responses until published.",
    ],
  },
  {
    id: "create",
    title: "Creating forms",
    summary: "Blank forms or templates — both open the same builder.",
    steps: [
      "Blank form: set a title and optional description",
      "Template: pick a use case, preview fields, then Use template",
      "Edit title, fields, and settings anytime after creation",
    ],
  },
  {
    id: "templates",
    title: "Templates",
    summary: "Ready-made forms for common workflows.",
    steps: [
      "Browse categories: Feedback, Events, HR, Lead gen, Support, Education",
      "Search by name or tag",
      "Preview questions before applying",
      "Customize everything after creation",
    ],
    tips: ["Popular templates include NPS, RSVP, job application, and bug report."],
  },
  {
    id: "builder",
    title: "Form builder",
    summary: "The three-column editor is where you design questions.",
    steps: [
      "Left: click a field type (Short text, Email, Choice, Rating, …)",
      "Center: drag to reorder; click a question to select it",
      "Right: edit label, placeholder, required, options, validation, and logic",
      "Use Lock to prevent accidental edits on a field",
      "Toggle one-question-at-a-time for Typeform-style flows",
    ],
    tips: [
      "Conditional logic shows a field only when an earlier answer matches a rule.",
      "Validation rules enforce min/max length, patterns, and rating ranges.",
    ],
  },
  {
    id: "share",
    title: "Publish, share & embed",
    summary: "Get your form in front of respondents.",
    steps: [
      "Publish → Public (listed on Explore) or Unlisted (link only)",
      "Copy the share link or download a QR code",
      "In Settings, copy iframe or script embed for your website",
      "Use ?embed=1 for a chrome-light embed view",
      "Optional: password-protect the form",
    ],
    tips: ["Set response limits and close dates under Limits."],
  },
  {
    id: "responses",
    title: "Responses & save/resume",
    summary: "Collect and review answers.",
    steps: [
      "Open Responses from the form or builder links",
      "Click a submission for full details",
      "Export CSV for Excel or Sheets",
      "Respondents can leave and continue later (progress is saved)",
    ],
    tips: ["Inline validation shows errors as people leave a field."],
  },
  {
    id: "analytics",
    title: "Analytics",
    summary: "Understand performance across forms.",
    steps: [
      "Workspace analytics: totals, trends, top forms",
      "Per-form analytics: field charts and conversion",
      "Filter by 7 / 30 / 90 days",
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    summary: "Stay informed without opening the dashboard.",
    steps: [
      "Enable “Email me on new responses” for instant alerts with answer summaries",
      "Add a Slack or Discord webhook URL for team pings",
      "Turn on daily digest for a “You got N responses today” email",
      "Send a digest anytime from analytics (when digest forms have activity)",
    ],
  },
  {
    id: "settings",
    title: "Account & appearance",
    summary: "Your profile and theme.",
    steps: [
      "View name, email, and role",
      "Switch light or dark mode — preference is saved locally",
    ],
  },
  {
    id: "admin",
    title: "Admin (admins only)",
    summary: "Platform-wide oversight.",
    steps: [
      "Manage users and roles",
      "Inspect forms and sessions",
      "Monitor overall platform analytics",
    ],
  },
  {
    id: "reliability",
    title: "Reliability & never-sleep",
    summary: "The API stays warm with keep-alive jobs and scheduled maintenance.",
    steps: [
      "In-process scheduler pings /health every 10 minutes",
      "GitHub Actions also wakes the API every 10 minutes (free-tier safe)",
      "Daily digest emails run around 09:00 UTC",
      "Old abandoned drafts are cleaned up automatically",
      "Check live status anytime at /status on the API",
    ],
    tips: ["Set CRON_SECRET and API_BASE_URL so external cron can trigger jobs securely."],
  },
];
