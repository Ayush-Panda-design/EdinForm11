import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

// Load local .env when present; on Render/CI DATABASE_URL is injected directly.
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env locally or configure it in your deploy environment."
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
