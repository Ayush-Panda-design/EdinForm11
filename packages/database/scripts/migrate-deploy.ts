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
import {
  describeSsl,
  getSslCandidates,
  normalizeDatabaseUrl,
  parsePostgresHost,
} from "../connection-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");

/** Must match drizzle.config.ts migrations.schema / migrations.table */
const MIGRATIONS_SCHEMA = "public";
const MIGRATIONS_TABLE = "__drizzle_migrations";
const MIGRATIONS_QUALIFIED = `"${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}"`;
const BASELINE_ADVISORY_LOCK_KEY = 7249011;

dotenv.config({ path: path.resolve(pkgRoot, "../../.env") });

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl) {
  console.error("DATABASE_URL is required for db:migrate");
  process.exit(1);
}

const DATABASE_URL = normalizeDatabaseUrl(rawDatabaseUrl);
process.env.DATABASE_URL = DATABASE_URL;

const dbHost = parsePostgresHost(DATABASE_URL);
console.log(`Database host: ${dbHost}`);

async function tableExists(client: pg.PoolClient, tableName: string) {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tableName]
  );
  return Boolean(rows[0]?.exists);
}

async function resolveMigrationsTable(client: pg.PoolClient) {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = $2
     ) AS exists`,
    [MIGRATIONS_SCHEMA, MIGRATIONS_TABLE]
  );

  if (rows[0]?.exists) {
    return MIGRATIONS_QUALIFIED;
  }

  const { rows: legacyRows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
     ) AS exists`
  );

  if (legacyRows[0]?.exists) {
    console.log("Using legacy drizzle.__drizzle_migrations table.");
    return '"drizzle"."__drizzle_migrations"';
  }

  return MIGRATIONS_QUALIFIED;
}

async function ensureMigrationsTable(client: pg.PoolClient, qualified: string) {
  const schema = qualified.split(".")[0]?.replace(/"/g, "") ?? MIGRATIONS_SCHEMA;
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${qualified} (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);
}

async function migrationCount(client: pg.PoolClient, qualified: string) {
  const { rows } = await client.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM ${qualified}`
  );
  return rows[0]?.count ?? 0;
}

async function baselineIfNeeded(client: pg.PoolClient) {
  const usersExists = await tableExists(client, "users");
  const formsExists = await tableExists(client, "forms");

  if (!usersExists) {
    console.log("Fresh database — running all migrations.");
    return;
  }

  const qualified = await resolveMigrationsTable(client);
  await ensureMigrationsTable(client, qualified);

  let recorded = await migrationCount(client, qualified);
  if (recorded > 0) {
    console.log(`Migration history found (${recorded} applied) — continuing.`);
    return;
  }

  if (!formsExists) {
    console.log("Partial schema detected — running migrations without baseline.");
    return;
  }

  await client.query(`SELECT pg_advisory_lock($1)`, [BASELINE_ADVISORY_LOCK_KEY]);
  try {
    recorded = await migrationCount(client, qualified);
    if (recorded > 0) {
      console.log(
        `Migration history found after lock (${recorded} applied) — skipping baseline.`
      );
      return;
    }

    console.log(
      "Existing schema without migration history (likely from db:push) — baselining..."
    );

    const journal = JSON.parse(
      readFileSync(path.join(pkgRoot, "drizzle/meta/_journal.json"), "utf8")
    ) as { entries: Array<{ tag: string; when: number }> };

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
  } finally {
    await client.query(`SELECT pg_advisory_unlock($1)`, [BASELINE_ADVISORY_LOCK_KEY]);
  }
}

async function connectWithRetry() {
  const sslCandidates = getSslCandidates(DATABASE_URL, rawDatabaseUrl);
  let lastError: unknown;

  for (const ssl of sslCandidates) {
    console.log(`Trying connection (ssl: ${describeSsl(ssl)})...`);

    const pool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl,
      connectionTimeoutMillis: 30_000,
      max: 2,
    });

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const client = await pool.connect();
        return { client, pool };
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`  attempt ${attempt}/3 failed: ${message}`);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
        }
      }
    }

    await pool.end();
  }

  throw lastError;
}

async function main() {
  const { client, pool } = await connectWithRetry();
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
