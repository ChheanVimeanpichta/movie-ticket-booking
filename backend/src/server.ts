import 'dotenv/config';
import { createApp } from './app.js';
import { prisma } from './config/db.js';
import { redis } from './config/redis.js';
import { logger } from './utils/logger.js';

const PORT = Number(process.env.PORT || 5000);

async function main(): Promise<void> {
  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      redis.disconnect();
      logger.info('Shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('Fatal error during startup', err);
  process.exit(1);
});