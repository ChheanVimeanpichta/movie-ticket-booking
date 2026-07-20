import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
export const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/movie_booking';
export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});
