import "dotenv/config";
import db, {
  formsTable,
  formFieldsTable,
  formResponsesTable,
  responseAnswersTable,
  formViewsTable,
  analyticsTable,
} from "@repo/database";
import { eq } from "@repo/database";

const ANIME_USERNAMES = [
  "SakuraBlossom99", "NarutoKun", "LunarDragon", "TokyoGhoulFan", "OnepiratePirate",
  "AttackOnMike", "DemonSlayerX", "MagicHeroAcademia", "SwordArtOnline2", "FullmetalKid",
];
const FIRST_NAMES = [
  "Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn", "Blake",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
];
const COMPANIES = [
  "Acme Corp", "Startup Labs", "Tech Ventures", "Growth Co", "Digital First",
];
const GAME_TAGS = [
  "SniperElite99", "QuickScope", "NoBrakes", "NightOwl", "TacticsMaster",
  "ProGamer2024", "RocketMan", "ValorantViper", "SoloCarry", "TopFragger",
];

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysAgo));
  d.setHours(randInt(0, 23), randInt(0, 59));
  return d;
}

async function seedFormResponses(
  formId: string,
  count: number,
  answerBuilder: (fields: { id: string; type: string; required: boolean; options: unknown }[]) => {
    respondentEmail?: string;
    respondentName?: string;
    answers: { fieldId: string; value?: string; valueArray?: string[] }[];
  }
): Promise<void> {
  const fields = await db
    .select()
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, formId));

  for (let i = 0; i < count; i++) {
    const submittedAt = randomDate(60);
    const { respondentEmail, respondentName, answers } = answerBuilder(
      fields.map((f) => ({
        id: f.id,
        type: f.type,
        required: f.required,
        options: f.options,
      }))
    );

    const [response] = await db
      .insert(formResponsesTable)
      .values({
        formId,
        respondentEmail,
        respondentName,
        status: "completed",
        completionTimeSeconds: randInt(45, 300),
        ipAddress: `${randInt(1, 255)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
        userAgent: "Mozilla/5.0 (Seeded/Demo)",
        submittedAt,
        createdAt: submittedAt,
      })
      .returning();

    if (!response) continue;

    if (answers.length > 0) {
      await db.insert(responseAnswersTable).values(
        answers
          .filter((a) => a.value !== undefined || (a.valueArray && a.valueArray.length > 0))
          .map((a) => ({
            responseId: response.id,
            fieldId: a.fieldId,
            formId,
            value: a.value,
            valueArray: a.valueArray,
          }))
      );
    }
  }
}

export async function seedResponses(formIds: string[]): Promise<void> {
  console.log("📨 Seeding demo responses...");

  const [animeFormId, feedbackFormId, gamingFormId] = formIds;

  // -------------------------------------------------------------------------
  // Anime Fan Survey responses
  // -------------------------------------------------------------------------
  if (animeFormId) {
    const existing = await db
      .select({ count: db.$count(formResponsesTable, eq(formResponsesTable.formId, animeFormId)) })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, animeFormId));

    if ((existing[0]?.count ?? 0) === 0) {
      await seedFormResponses(animeFormId, 45, (fields) => {
        const animeField = (label: string) =>
          fields.find((f) => f.type === "short_text" && f.id); // simplified lookup
        const answers = fields.map((f) => {
          if (f.type === "short_text")
            return { fieldId: f.id, value: rand(ANIME_USERNAMES) };
          if (f.type === "email")
            return { fieldId: f.id, value: `${rand(ANIME_USERNAMES).toLowerCase()}@example.com` };
          if (f.type === "single_select") {
            const opts = f.options as { value: string }[] | null;
            return { fieldId: f.id, value: opts ? rand(opts).value : "unknown" };
          }
          if (f.type === "multi_select") {
            const opts = f.options as { value: string }[] | null;
            if (!opts) return { fieldId: f.id, valueArray: [] };
            const picked = opts
              .filter(() => Math.random() > 0.5)
              .slice(0, randInt(1, 3))
              .map((o) => o.value);
            return { fieldId: f.id, valueArray: picked.length ? picked : [opts[0]!.value] };
          }
          if (f.type === "rating")
            return { fieldId: f.id, value: String(randInt(6, 10)) };
          if (f.type === "checkbox")
            return { fieldId: f.id, value: Math.random() > 0.4 ? "true" : "false" };
          if (f.type === "long_text")
            return { fieldId: f.id, value: "Really enjoying the current season! Recommend Dungeon Meshi." };
          return { fieldId: f.id, value: "N/A" };
        });
        return {
          respondentEmail: `${rand(ANIME_USERNAMES).toLowerCase()}@example.com`,
          respondentName: rand(ANIME_USERNAMES),
          answers,
        };
      });
      console.log("  ✓ Seeded 45 anime survey responses");
    }
  }

  // -------------------------------------------------------------------------
  // Product Feedback responses
  // -------------------------------------------------------------------------
  if (feedbackFormId) {
    const existing = await db
      .select({ count: db.$count(formResponsesTable, eq(formResponsesTable.formId, feedbackFormId)) })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, feedbackFormId));

    if ((existing[0]?.count ?? 0) === 0) {
      await seedFormResponses(feedbackFormId, 30, (fields) => {
        const firstName = rand(FIRST_NAMES);
        const answers = fields.map((f) => {
          if (f.type === "email")
            return { fieldId: f.id, value: `${firstName.toLowerCase()}@${rand(COMPANIES).toLowerCase().replace(/\s/g, "")}.com` };
          if (f.type === "single_select") {
            const opts = f.options as { value: string }[] | null;
            return { fieldId: f.id, value: opts ? rand(opts).value : "other" };
          }
          if (f.type === "multi_select") {
            const opts = f.options as { value: string }[] | null;
            if (!opts) return { fieldId: f.id, valueArray: [] };
            const picked = opts.filter(() => Math.random() > 0.6).map((o) => o.value);
            return { fieldId: f.id, valueArray: picked.length ? picked : [opts[0]!.value] };
          }
          if (f.type === "rating")
            return { fieldId: f.id, value: String(randInt(7, 10)) };
          if (f.type === "long_text")
            return {
              fieldId: f.id,
              value: rand([
                "The form builder is intuitive but I'd love conditional logic branching.",
                "Analytics dashboard is clean. Would love more chart types.",
                "CSV export works great. Please add webhook notifications!",
                "Really happy with the template library. More templates please!",
              ]),
            };
          return { fieldId: f.id };
        });
        return {
          respondentEmail: `${firstName.toLowerCase()}@${rand(COMPANIES).toLowerCase().replace(/\s/g, "")}.com`,
          respondentName: `${firstName} ${rand(LAST_NAMES)}`,
          answers,
        };
      });
      console.log("  ✓ Seeded 30 product feedback responses");
    }
  }

  // -------------------------------------------------------------------------
  // Gaming Tournament responses
  // -------------------------------------------------------------------------
  if (gamingFormId) {
    const existing = await db
      .select({ count: db.$count(formResponsesTable, eq(formResponsesTable.formId, gamingFormId)) })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, gamingFormId));

    if ((existing[0]?.count ?? 0) === 0) {
      await seedFormResponses(gamingFormId, 60, (fields) => {
        const firstName = rand(FIRST_NAMES);
        const lastName = rand(LAST_NAMES);
        const gamerTag = rand(GAME_TAGS);
        const answers = fields.map((f) => {
          if (f.type === "short_text" && fields.indexOf(f) === 0)
            return { fieldId: f.id, value: `${firstName} ${lastName}` };
          if (f.type === "email")
            return { fieldId: f.id, value: `${firstName.toLowerCase()}@gaming.example.com` };
          if (f.type === "short_text")
            return { fieldId: f.id, value: gamerTag };
          if (f.type === "date")
            return { fieldId: f.id, value: `${randInt(1990, 2005)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}` };
          if (f.type === "single_select") {
            const opts = f.options as { value: string }[] | null;
            return { fieldId: f.id, value: opts ? rand(opts).value : "pc" };
          }
          if (f.type === "multi_select") {
            const opts = f.options as { value: string }[] | null;
            if (!opts) return { fieldId: f.id, valueArray: ["solo"] };
            const picked = opts.filter(() => Math.random() > 0.6).map((o) => o.value);
            return { fieldId: f.id, valueArray: picked.length ? picked : ["solo"] };
          }
          if (f.type === "checkbox")
            return { fieldId: f.id, value: "true" };
          if (f.type === "long_text")
            return { fieldId: f.id, value: "" };
          return { fieldId: f.id };
        });
        return {
          respondentEmail: `${firstName.toLowerCase()}@gaming.example.com`,
          respondentName: `${firstName} ${lastName}`,
          answers,
        };
      });
      console.log("  ✓ Seeded 60 gaming tournament registrations");
    }
  }

  // -------------------------------------------------------------------------
  // Seed view events and daily analytics
  // -------------------------------------------------------------------------
  console.log("📊 Seeding view events and analytics...");
  for (const formId of formIds) {
    if (!formId) continue;

    // Seed views (more views than responses to simulate realistic conversion)
    const viewCount = randInt(150, 400);
    const viewInserts = Array.from({ length: viewCount }, () => ({
      formId,
      ipAddress: `${randInt(1, 255)}.${randInt(0, 255)}.0.1`,
      userAgent: "Mozilla/5.0 (Seeded/Demo)",
      viewedAt: randomDate(60),
    }));

    // Insert in batches to avoid hitting query size limits
    for (let i = 0; i < viewInserts.length; i += 50) {
      await db.insert(formViewsTable).values(viewInserts.slice(i, i + 50));
    }
  }

  console.log("  ✓ View events seeded");
}
