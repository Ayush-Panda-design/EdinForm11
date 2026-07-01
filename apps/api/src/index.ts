import "dotenv/config";
import { logger } from "@repo/logger";
import { app } from "./server";
import { env } from "./env";

const PORT = parseInt(env.PORT ?? "8000", 10);

app.listen(PORT, () => {
  logger.info(`🚀 FormCraft API running on port ${PORT}`);
  logger.info(`📚 Scalar docs: http://localhost:${PORT}/docs`);
  logger.info(`🔌 tRPC endpoint: http://localhost:${PORT}/trpc`);
  logger.info(`🌐 REST endpoint: http://localhost:${PORT}/api`);
});
