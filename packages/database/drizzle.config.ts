import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";
import {
  getRenderInternalHostCandidate,
  normalizeDatabaseUrl,
  parsePostgresUrl,
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

const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
const pgParams = parsePostgresUrl(databaseUrl);
const internalHost = getRenderInternalHostCandidate(pgParams.host);
const host = internalHost ?? pgParams.host;
const ssl = internalHost ? false : resolvePgSsl(databaseUrl);

export default defineConfig({
  out: "./drizzle",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host,
    port: pgParams.port,
    user: pgParams.user,
    password: pgParams.password,
    database: pgParams.database,
    ssl,
  },
  migrations: {
    schema: "public",
    table: "__drizzle_migrations",
  },
});
