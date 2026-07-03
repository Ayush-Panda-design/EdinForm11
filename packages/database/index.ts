import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";
import * as schema from "./schema";
import {
  normalizeDatabaseUrl,
  resolvePgSsl,
} from "./connection-config";

const databaseUrl = normalizeDatabaseUrl(env.DATABASE_URL);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: resolvePgSsl(databaseUrl, env.DATABASE_URL),
});

// Pass the configured pool to drizzle
export const db = drizzle(pool, { schema });

export * from "drizzle-orm";
export * from "./schema";
export default db;
