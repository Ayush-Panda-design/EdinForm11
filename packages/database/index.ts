import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";
import * as schema from "./schema";

// Configure pg connection pool with SSL directly
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Pass the configured pool to drizzle
export const db = drizzle(pool, { schema });

export * from "drizzle-orm";
export * from "./schema";
export default db;
