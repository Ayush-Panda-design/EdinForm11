import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

// 🔥 FORCE LOAD ROOT ENV BEFORE ANYTHING
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not loaded. Check .env path.");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});