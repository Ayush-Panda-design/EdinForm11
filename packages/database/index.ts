import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import {
  buildPgPoolConfig,
  resolveEffectiveDatabaseUrl,
} from "./connection-config";

const databaseUrl = resolveEffectiveDatabaseUrl();

const pool = new Pool(buildPgPoolConfig(databaseUrl));

// Pass the configured pool to drizzle
export const db = drizzle(pool, { schema });

export * from "drizzle-orm";
export * from "./schema";
export default db;
