import "dotenv/config";
import db, {
  formsTable,
  formFieldsTable,
  templatesTable,
} from "@repo/database";
import { eq } from "@repo/database";

interface FieldDef {
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
  placeholder?: string;
  required: boolean;
  order: number;
  options?: { value: string; label: string }[];
  validationRules?: Record<string, unknown>;
}

interface FormDef {
  title: string;
  description: string;
  visibility: "public" | "unlisted" | "unpublished";
  themeKey: string;
  fields: FieldDef[];
  submitButtonText?: string;
  successMessage?: string;
}

const DEMO_FORMS: FormDef[] = [
  // -------------------------------------------------------------------------
  // 1. Anime Fan Survey
  // -------------------------------------------------------------------------
  {
    title: "Anime Fan Survey 2024",
    description:
      "Share your anime preferences and help us understand the community better! All genres welcome.",
    visibility: "public",
    themeKey: "Anime Neon",
    submitButtonText: "Submit My Answers ✨",
    successMessage:
      "Arigato! Your response has been recorded. Stay kawaii! 🌸",
    fields: [
      {
        type: "short_text",
        label: "Your Anime Username / Handle",
        placeholder: "e.g. NarutoFan99",
        required: true,
        order: 0,
      },
      {
        type: "email",
        label: "Email Address",
        placeholder: "your@email.com",
        required: false,
        order: 1,
      },
      {
        type: "single_select",
        label: "How long have you been watching anime?",
        required: true,
        order: 2,
        options: [
          { value: "less_1", label: "Less than 1 year" },
          { value: "1_3", label: "1–3 years" },
          { value: "3_5", label: "3–5 years" },
          { value: "5_10", label: "5–10 years" },
          { value: "10_plus", label: "10+ years (veteran!)" },
        ],
      },
      {
        type: "multi_select",
        label: "Favourite anime genres (select all that apply)",
        required: true,
        order: 3,
        options: [
          { value: "shonen", label: "Shōnen" },
          { value: "shojo", label: "Shōjo" },
          { value: "isekai", label: "Isekai" },
          { value: "mecha", label: "Mecha" },
          { value: "slice_of_life", label: "Slice of Life" },
          { value: "horror", label: "Horror" },
          { value: "sports", label: "Sports" },
          { value: "psychological", label: "Psychological" },
        ],
      },
      {
        type: "short_text",
        label: "All-time favourite anime?",
        placeholder: "e.g. Attack on Titan",
        required: true,
        order: 4,
      },
      {
        type: "rating",
        label: "How would you rate the current anime season? (1–10)",
        required: true,
        order: 5,
        validationRules: { maxRating: 10 },
      },
      {
        type: "single_select",
        label: "Preferred watching platform",
        required: false,
        order: 6,
        options: [
          { value: "crunchyroll", label: "Crunchyroll" },
          { value: "netflix", label: "Netflix" },
          { value: "funimation", label: "Funimation" },
          { value: "hidive", label: "HIDIVE" },
          { value: "other", label: "Other / piracy 👀" },
        ],
      },
      {
        type: "checkbox",
        label: "I prefer watching anime with subtitles (not dubbed)",
        required: false,
        order: 7,
      },
      {
        type: "long_text",
        label: "Any anime recommendations for fellow fans?",
        placeholder: "Title and a short reason why...",
        required: false,
        order: 8,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. Startup Product Feedback
  // -------------------------------------------------------------------------
  {
    title: "Product Feedback — FormCraft Beta",
    description:
      "Help us improve FormCraft! Your feedback directly shapes what we build next. Takes ~3 minutes.",
    visibility: "public",
    themeKey: "Classic Minimal",
    submitButtonText: "Send Feedback",
    successMessage:
      "Thank you so much! Your feedback means the world to us and will directly influence our roadmap.",
    fields: [
      {
        type: "email",
        label: "Your email (optional — for follow-up questions)",
        placeholder: "you@company.com",
        required: false,
        order: 0,
      },
      {
        type: "single_select",
        label: "What best describes your role?",
        required: true,
        order: 1,
        options: [
          { value: "founder", label: "Founder / Co-founder" },
          { value: "product", label: "Product Manager" },
          { value: "designer", label: "Designer" },
          { value: "engineer", label: "Engineer" },
          { value: "marketer", label: "Marketer" },
          { value: "other", label: "Other" },
        ],
      },
      {
        type: "rating",
        label: "Overall, how satisfied are you with FormCraft? (1–10)",
        required: true,
        order: 2,
        validationRules: { maxRating: 10 },
      },
      {
        type: "single_select",
        label: "How likely are you to recommend FormCraft to a colleague? (NPS)",
        required: true,
        order: 3,
        options: [
          { value: "0", label: "0 — Not at all likely" },
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5 — Neutral" },
          { value: "6", label: "6" },
          { value: "7", label: "7" },
          { value: "8", label: "8" },
          { value: "9", label: "9" },
          { value: "10", label: "10 — Extremely likely" },
        ],
      },
      {
        type: "multi_select",
        label: "Which features do you use most?",
        required: false,
        order: 4,
        options: [
          { value: "form_builder", label: "Form Builder" },
          { value: "templates", label: "Templates" },
          { value: "analytics", label: "Analytics Dashboard" },
          { value: "csv_export", label: "CSV Export" },
          { value: "email_notifs", label: "Email Notifications" },
          { value: "custom_themes", label: "Custom Themes" },
        ],
      },
      {
        type: "long_text",
        label: "What's the #1 thing you wish FormCraft could do?",
        placeholder: "Be as specific as possible...",
        required: true,
        order: 5,
        validationRules: { minLength: 20 },
      },
      {
        type: "long_text",
        label: "What's working really well? (we love good news too 😄)",
        placeholder: "Tell us what you love...",
        required: false,
        order: 6,
      },
      {
        type: "single_select",
        label: "How did you hear about FormCraft?",
        required: false,
        order: 7,
        options: [
          { value: "twitter", label: "Twitter / X" },
          { value: "product_hunt", label: "Product Hunt" },
          { value: "word_of_mouth", label: "Word of mouth" },
          { value: "search", label: "Google / search" },
          { value: "newsletter", label: "Newsletter" },
          { value: "other", label: "Other" },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. Gaming Tournament Registration
  // -------------------------------------------------------------------------
  {
    title: "GameFest 2024 — Tournament Registration",
    description:
      "Register for the GameFest 2024 Online Tournament! Compete in your favourite games and win prizes. Registration closes Dec 1st.",
    visibility: "public",
    themeKey: "Dark Mode",
    submitButtonText: "Register Now 🎮",
    successMessage:
      "You're registered! Check your email for confirmation details. See you in the arena! 🏆",
    fields: [
      {
        type: "short_text",
        label: "Full Name",
        placeholder: "Your legal name",
        required: true,
        order: 0,
      },
      {
        type: "email",
        label: "Email Address",
        placeholder: "gamer@example.com",
        required: true,
        order: 1,
      },
      {
        type: "short_text",
        label: "Gamer Tag / IGN",
        placeholder: "Your in-game name",
        required: true,
        order: 2,
        validationRules: { minLength: 3, maxLength: 30 },
      },
      {
        type: "date",
        label: "Date of Birth (must be 13+)",
        required: true,
        order: 3,
      },
      {
        type: "single_select",
        label: "Primary Game",
        required: true,
        order: 4,
        options: [
          { value: "valorant", label: "Valorant" },
          { value: "cs2", label: "CS2" },
          { value: "fortnite", label: "Fortnite" },
          { value: "lol", label: "League of Legends" },
          { value: "apex", label: "Apex Legends" },
          { value: "rocket_league", label: "Rocket League" },
          { value: "minecraft", label: "Minecraft" },
        ],
      },
      {
        type: "single_select",
        label: "Skill Level",
        required: true,
        order: 5,
        options: [
          { value: "beginner", label: "Beginner (casual)" },
          { value: "intermediate", label: "Intermediate" },
          { value: "advanced", label: "Advanced (ranked)" },
          { value: "semi_pro", label: "Semi-pro" },
          { value: "pro", label: "Pro / Ex-pro" },
        ],
      },
      {
        type: "single_select",
        label: "Platform",
        required: true,
        order: 6,
        options: [
          { value: "pc", label: "PC" },
          { value: "ps5", label: "PlayStation 5" },
          { value: "xbox", label: "Xbox Series X/S" },
          { value: "switch", label: "Nintendo Switch" },
          { value: "mobile", label: "Mobile" },
        ],
      },
      {
        type: "multi_select",
        label: "Team format preference",
        required: true,
        order: 7,
        options: [
          { value: "solo", label: "Solo (1v1)" },
          { value: "duo", label: "Duo (2v2)" },
          { value: "squad", label: "Squad (4v4)" },
        ],
      },
      {
        type: "short_text",
        label: "Discord Username",
        placeholder: "username#0000 or username",
        required: true,
        order: 8,
      },
      {
        type: "checkbox",
        label: "I agree to the tournament rules and code of conduct",
        required: true,
        order: 9,
      },
      {
        type: "long_text",
        label: "Any additional notes or questions?",
        placeholder: "Team members, dietary needs for in-person events, etc.",
        required: false,
        order: 10,
      },
    ],
  },
];

export async function seedForms(
  creatorId: string,
  themeIdMap: Map<string, string>
): Promise<string[]> {
  console.log("📝 Seeding demo forms...");
  const formIds: string[] = [];

  for (const formDef of DEMO_FORMS) {
    // Check if already seeded (idempotent by title + creatorId)
    const existing = await db.query.formsTable.findFirst({
      where: (f, { eq, and }) =>
        and(eq(f.title, formDef.title), eq(f.creatorId, creatorId)),
    });

    if (existing) {
      formIds.push(existing.id);
      console.log(`  ✓ Form "${formDef.title}" already exists`);
      continue;
    }

    const slug = `${formDef.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80)}-demo`;

    const themeId = themeIdMap.get(formDef.themeKey) ?? null;

    const [form] = await db
      .insert(formsTable)
      .values({
        creatorId,
        title: formDef.title,
        description: formDef.description,
        slug,
        visibility: formDef.visibility,
        themeId,
        submitButtonText: formDef.submitButtonText,
        successMessage: formDef.successMessage,
        notifyCreatorOnSubmission: true,
        allowMultipleResponses: true,
        showProgressBar: true,
        publishedAt:
          formDef.visibility !== "unpublished" ? new Date() : undefined,
      })
      .returning();

    if (!form) continue;

    // Insert fields
    if (formDef.fields.length > 0) {
      await db.insert(formFieldsTable).values(
        formDef.fields.map((f) => ({
          formId: form.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          order: f.order,
          options: f.options ?? undefined,
          validationRules: f.validationRules ?? undefined,
        }))
      );
    }

    formIds.push(form.id);
    console.log(`  ✓ Created form "${formDef.title}" (${formDef.fields.length} fields)`);

    // Also seed it as a reusable template
    await db.insert(templatesTable).values({
      name: formDef.title,
      description: formDef.description,
      category:
        formDef.title.includes("Anime")
          ? "survey"
          : formDef.title.includes("Feedback")
          ? "feedback"
          : "registration",
      isPublic: true,
      formSnapshot: {
        title: formDef.title,
        description: formDef.description,
        fields: formDef.fields,
      },
    });
  }

  return formIds;
}
