/**
 * Production-safe migration runner for Render / CI.
 *
 * Handles databases that were previously set up with `db:push` (schema exists
 * but __drizzle_migrations is empty) by baselining migration history before
 * running drizzle-kit migrate for any new migrations.
 */
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.resolve(pkgRoot, "../../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required for db:migrate");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production" ||
    DATABASE_URL.includes("sslmode=require") ||
    DATABASE_URL.includes("render.com")
      ? { rejectUnauthorized: false }
      : false,
});

async function tableExists(client, tableName) {
  const { rows } = await client.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tableName]
  );
  return Boolean(rows[0]?.exists);
}

async function resolveMigrationsTable(client) {
  for (const schema of ["public", "drizzle"]) {
    const { rows } = await client.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = $1 AND table_name = '__drizzle_migrations'
       ) AS exists`,
      [schema]
    );
    if (rows[0]?.exists) {
      return { schema, qualified: `"${schema}"."__drizzle_migrations"` };
    }
  }
  return { schema: "public", qualified: '"public"."__drizzle_migrations"' };
}

async function ensureMigrationsTable(client, qualified) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${qualified} (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);
}

async function baselineIfNeeded(client) {
  const usersExists = await tableExists(client, "users");
  const formsExists = await tableExists(client, "forms");

  if (!usersExists) {
    console.log("Fresh database — running all migrations.");
    return;
  }

  const { qualified } = await resolveMigrationsTable(client);
  await ensureMigrationsTable(client, qualified);

  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS count FROM ${qualified}`
  );
  const recorded = rows[0]?.count ?? 0;

  if (recorded > 0) {
    console.log(`Migration history found (${recorded} applied) — continuing.`);
    return;
  }

  if (!formsExists) {
    console.log("Partial schema detected — running migrations without baseline.");
    return;
  }

  console.log(
    "Existing schema without migration history (likely from db:push) — baselining..."
  );

  const journal = JSON.parse(
    readFileSync(path.join(pkgRoot, "drizzle/meta/_journal.json"), "utf8")
  );

  for (const entry of journal.entries) {
    const sqlPath = path.join(pkgRoot, `drizzle/${entry.tag}.sql`);
    const sql = readFileSync(sqlPath, "utf8");
    const hash = createHash("sha256").update(sql).digest("hex");
    await client.query(
      `INSERT INTO ${qualified} (hash, created_at) VALUES ($1, $2)`,
      [hash, entry.when]
    );
    console.log(`  Baseline: ${entry.tag}`);
  }

  console.log("Baseline complete.");
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await baselineIfNeeded(client);
  } finally {
    client.release();
    await pool.end();
  }

  execSync("drizzle-kit migrate", {
    stdio: "inherit",
    cwd: pkgRoot,
    env: process.env,
  });
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
