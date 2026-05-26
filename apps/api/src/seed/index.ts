import "dotenv/config";
import db, { usersTable } from "@repo/database";
import { eq } from "@repo/database";
import { createPasswordHash } from "@repo/services/auth";
import { seedThemes } from "./themes.seed";
import { seedForms } from "./forms.seed";
import { seedResponses } from "./responses.seed";

const DEMO_USERS = [
  {
    fullName: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    fullName: "Demo Creator",
    email: "creator@example.com",
    password: "password123",
    role: "creator",
  },
];

async function main() {
  console.log("🌱 Starting seed...\n");

  // -------------------------------------------------------------------------
  // 1. Seed users
  // -------------------------------------------------------------------------
  console.log("👤 Seeding demo users...");
  const userIds: Record<string, string> = {};

  for (const u of DEMO_USERS) {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, u.email))
      .limit(1);

    if (existing[0]) {
      userIds[u.email] = existing[0].id;
      console.log(`  ✓ User ${u.email} already exists`);
      continue;
    }

    const [created] = await db
      .insert(usersTable)
      .values({
        fullName: u.fullName,
        email: u.email,
        passwordHash: createPasswordHash(u.password),
        role: u.role,
        emailVerified: true,
        isActive: true,
      })
      .returning({ id: usersTable.id });

    if (created) {
      userIds[u.email] = created.id;
      console.log(`  ✓ Created user ${u.email} (password: ${u.password})`);
    }
  }

  // -------------------------------------------------------------------------
  // 2. Seed themes
  // -------------------------------------------------------------------------
  const themeIdMap = await seedThemes();

  // -------------------------------------------------------------------------
  // 3. Seed forms (under creator account)
  // -------------------------------------------------------------------------
  const creatorId = userIds["creator@example.com"]!;
  const formIds = await seedForms(creatorId, themeIdMap);

  // -------------------------------------------------------------------------
  // 4. Seed responses + views + analytics
  // -------------------------------------------------------------------------
  await seedResponses(formIds);

  console.log("\n✅ Seed complete!\n");
  console.log("Demo credentials:");
  console.log("  Admin:   admin@example.com   / password123");
  console.log("  Creator: creator@example.com / password123");
  console.log();

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
