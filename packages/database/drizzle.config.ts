import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");

// Load local .env when present; on Render/CI DATABASE_URL is injected directly.
dotenv.config({ path: envPath });

const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  throw new Error(
    `DATABASE_URL is not set. Ensure it is present in .env at ${envPath} or configured in your deploy environment.`
  );
}

/** Strip sslmode from URL — pg v8 treats require as verify-full and drops Render connections. */
function normalizeDatabaseUrl(url: string) {
  let normalized = url.replace(/([?&])sslmode=[^&]*/gi, "$1");
  normalized = normalized.replace(/[?&]$/, "");
  normalized = normalized.replace(/\?&/, "?");
  return normalized;
}

const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
const isLocalDatabase = /(?:localhost|127\.0\.0\.1)/i.test(databaseUrl);

export default defineConfig({
  out: "./drizzle",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
  },
  migrations: {
    schema: "public",
    table: "__drizzle_migrations",
  },
});
