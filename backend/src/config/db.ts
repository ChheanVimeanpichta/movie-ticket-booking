import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

export const databaseUrl = process.env.DATABASE_URL || 'mysql://admin:cinestar%24%24123@cinestarmovie.c5y626m2skob.us-east-1.rds.amazonaws.com:3306/cinestar?connect_timeout=15';
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
