import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");

// Load local .env when present; on Render/CI DATABASE_URL is injected directly.
dotenv.config({ path: envPath });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    `DATABASE_URL is not set. Ensure it is present in .env at ${envPath} or configured in your deploy environment.`
  );
}

export default defineConfig({
  out: "./drizzle",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  migrations: {
    schema: "public",
    table: "__drizzle_migrations",
  },
});
