import "dotenv/config";
import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import {
  buildPgConnectionAttempts,
  getDatabaseUrlCandidates,
  parsePostgresHost,
} from "./connection-config";

type Database = NodePgDatabase<typeof schema>;

let pool: Pool | undefined;
let dbInstance: Database | undefined;

export async function initDatabase(): Promise<void> {
  const candidates = getDatabaseUrlCandidates();
  if (candidates.length === 0) {
    throw new Error("DATABASE_URL is not set");
  }

  let lastError: unknown;

  for (const databaseUrl of candidates) {
    for (const attempt of buildPgConnectionAttempts(databaseUrl)) {
      const candidate = new Pool(attempt.config);

      try {
        const client = await candidate.connect();
        await client.query("SELECT 1");
        client.release();

        if (pool) {
          await pool.end().catch(() => undefined);
        }

        pool = candidate;
        dbInstance = drizzle(pool, { schema });
        console.log(
          `[database] Connected (${attempt.label}, host ${parsePostgresHost(databaseUrl)})`
        );
        return;
      } catch (error) {
        lastError = error;
        console.warn(
          `[database] ${attempt.label} failed:`,
          error instanceof Error ? error.message : error
        );
        await candidate.end().catch(() => undefined);
      }
    }
  }

  throw (
    lastError ??
    new Error(
      `[database] Could not connect (${candidates.map(parsePostgresHost).join(", ")}). ` +
        "Verify DATABASE_URL in Render matches Postgres → Connect → External."
    )
  );
}

function getDb(): Database {
  if (!dbInstance) {
    throw new Error("Database not initialized — call initDatabase() before handling requests");
  }
  return dbInstance;
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});

export * from "drizzle-orm";
export * from "./schema";
export default db;
