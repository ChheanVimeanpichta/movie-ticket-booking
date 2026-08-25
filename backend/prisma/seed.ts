import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🌱 Seeding movie-ticket-booking MySQL database (cinestar)...');

  const customersFile = path.resolve(__dirname, '../../cinestar-admin-suite/admin-backend/data/customers.json');
  let customersToSeed: Array<{ name: string; email: string; password?: string; phone?: string }> = [
    { name: 'pichta', email: 'pichta@gmail.com', password: 'password123', phone: '01234567' },
    { name: 'june', email: 'june@gmail.com', password: 'password123', phone: '0122345' },
    { name: 'da', email: 'da@gmail.com', password: 'password123', phone: '1229078' },
    { name: 'moana', email: 'moana@gmail.com', password: 'password123', phone: '01234567' },
    { name: 'Customer', email: 'customer@gmail.com', password: 'password123', phone: '012345678' },
  ];

  if (fs.existsSync(customersFile)) {
    try {
      const raw = fs.readFileSync(customersFile, 'utf-8').trim().replace(/^\uFEFF/, '');
      if (raw) {
        const parsed = JSON.parse(raw);
        customersToSeed = parsed.map((c: any) => ({
          name: c.name || 'Customer',
          email: c.email.toLowerCase(),
          password: c.password || 'password123',
          phone: c.phone || '01234567',
        }));
      }
    } catch (e) {
      console.warn('Could not read admin customers.json, using fallback');
    }
  }

  for (const cust of customersToSeed) {
    const hashedPassword = await bcrypt.hash(cust.password || 'password123', 10);
    const existing = await prisma.user.findUnique({ where: { email: cust.email.toLowerCase() } });
    if (existing) {
      await prisma.user.update({
        where: { email: cust.email.toLowerCase() },
        data: {
          name: cust.name,
          password: hashedPassword,
          phone: cust.phone || null,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name: cust.name,
          email: cust.email.toLowerCase(),
          password: hashedPassword,
          phone: cust.phone || null,
        },
      });
    }
  }
  console.log(`✅ Seeded ${customersToSeed.length} users into cinestar.User table.`);

  const sampleMovies = [
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
      genre: 'Sci-Fi / Action',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
    },
    {
      title: 'Avatar: The Way of Water',
      description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
      genre: 'Sci-Fi / Adventure',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
    },
    {
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
      genre: 'Sci-Fi / Adventure',
      posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500',
    },
  ];

  for (const m of sampleMovies) {
    const existing = await prisma.movie.findFirst({ where: { title: m.title } });
    if (!existing) {
      await prisma.movie.create({
        data: {
          title: m.title,
          description: m.description,
          genre: m.genre,
          posterUrl: m.posterUrl,
        },
      });
    }
  }
  console.log(`✅ Seeded sample movies into cinestar.Movie table.`);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
