import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";
import {
  parsePostgresUrl,
  resolveEffectiveDatabaseUrl,
  resolvePgSsl,
} from "./connection-config";

const envPath = path.resolve(__dirname, "../../.env");

// Load local .env when present; on Render/CI DATABASE_URL is injected directly.
dotenv.config({ path: envPath });

const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  throw new Error(
    `DATABASE_URL is not set. Ensure it is present in .env at ${envPath} or configured in your deploy environment.`
  );
}

const databaseUrl = resolveEffectiveDatabaseUrl(rawDatabaseUrl);
const pgParams = parsePostgresUrl(databaseUrl);

export default defineConfig({
  out: "./drizzle",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: pgParams.host,
    port: pgParams.port,
    user: pgParams.user,
    password: pgParams.password,
    database: pgParams.database,
    ssl: resolvePgSsl(databaseUrl),
  },
  migrations: {
    schema: "public",
    table: "__drizzle_migrations",
  },
});
