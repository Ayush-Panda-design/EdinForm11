import "dotenv/config";
import { initDatabase } from "@repo/database";
import { logger } from "@repo/logger";

async function main() {
  await initDatabase();

  const { app } = await import("./server");
  const { env } = await import("./env");

  const PORT = parseInt(env.PORT ?? "8000", 10);

  app.listen(PORT, () => {
    logger.info(`FormCraft API running on port ${PORT}`);
    logger.info(`Scalar docs: http://localhost:${PORT}/docs`);
    logger.info(`tRPC endpoint: http://localhost:${PORT}/trpc`);
    logger.info(`REST endpoint: http://localhost:${PORT}/api`);
    logger.info(`Status: http://localhost:${PORT}/status`);
    logger.info(`Google OAuth redirect: ${env.BASE_URL}/auth/google/callback`);

    // Keep-alive + digest + draft cleanup (in-process)
    void import("./jobs/scheduler").then(({ startScheduler }) => {
      startScheduler(env.BASE_URL);
    });
  });
}

main().catch((error) => {
  logger.error("Failed to start API", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
