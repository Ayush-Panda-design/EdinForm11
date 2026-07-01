#!/usr/bin/env node
/**
 * run-patch.js  –  EdinForm5 database patcher
 *
 * Usage:
 *   node run-patch.js                        # adds columns only
 *   node run-patch.js --admin your@email.com # also promotes that user to admin
 *
 * Reads DATABASE_URL from .env at the repo root.
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Load .env
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const [k, ...rest] = line.split("=");
    if (k && rest.length) process.env[k.trim()] = rest.join("=").trim();
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL not found in .env");
  process.exit(1);
}

const { Client } = require("pg");

async function main() {
  const adminEmail = (() => {
    const idx = process.argv.indexOf("--admin");
    return idx !== -1 ? process.argv[idx + 1] : null;
  })();

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    console.log("🔧  Applying schema patch...");

    await client.query(`
      ALTER TABLE "forms"
        ADD COLUMN IF NOT EXISTS "is_password_protected" boolean NOT NULL DEFAULT false;
    `);
    console.log("  ✅  is_password_protected column — OK");

    await client.query(`
      ALTER TABLE "forms"
        ADD COLUMN IF NOT EXISTS "password_hash" text;
    `);
    console.log("  ✅  password_hash column — OK");

    if (adminEmail) {
      const result = await client.query(
        `UPDATE "users" SET "role" = 'admin' WHERE "email" = $1 RETURNING id, email, role`,
        [adminEmail]
      );
      if (result.rowCount === 0) {
        console.warn(`  ⚠️   No user found with email "${adminEmail}"`);
      } else {
        console.log(`  ✅  Promoted ${adminEmail} to admin`);
      }
    } else {
      console.log("  ℹ️   No --admin email provided. To promote a user run:");
      console.log("       node run-patch.js --admin your@email.com");
    }

    console.log("\n✅  Patch complete. Restart your dev server.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("❌  Patch failed:", err.message);
  process.exit(1);
});
