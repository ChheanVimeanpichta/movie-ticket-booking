import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

export const databaseUrl = process.env.DATABASE_URL || 'mysql://admin:password@database-2.co2sxxgtd0y5.us-east-1.rds.amazonaws.com:3306/cinestar?connect_timeout=15';
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
