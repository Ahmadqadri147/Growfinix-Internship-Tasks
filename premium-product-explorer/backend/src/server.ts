import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./utils/prisma";
import { warmImageCache } from "./jobs/warmImages";

async function main(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("Connected to MongoDB");

    const app = createApp();
    app.listen(env.PORT, () => {
      logger.info(`API running on http://localhost:${env.PORT}/api/v1 (${env.NODE_ENV})`);
    });

    void warmImageCache();
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

main();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
