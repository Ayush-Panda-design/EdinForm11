import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";
import * as schema from "./schema";

function normalizeDatabaseUrl(url: string) {
  let normalized = url.replace(/([?&])sslmode=[^&]*/gi, "$1");
  normalized = normalized.replace(/[?&]$/, "");
  normalized = normalized.replace(/\?&/, "?");
  return normalized;
}

const databaseUrl = normalizeDatabaseUrl(env.DATABASE_URL);
const isLocalDatabase = /(?:localhost|127\.0\.0\.1)/i.test(databaseUrl);

// Configure pg connection pool with SSL directly
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
});

// Pass the configured pool to drizzle
export const db = drizzle(pool, { schema });

export * from "drizzle-orm";
export * from "./schema";
export default db;
