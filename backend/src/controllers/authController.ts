import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { signToken } from '../utils/jwt.js';

const toPublicUser = (user: { id: string; name: string; email: string; phone: string | null }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? '',
  avatar: '',
});

async function syncCustomerToDatabaseAndAdminSuite(user: {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  password?: string;
}) {
  const normalizedEmail = user.email.toLowerCase();
  const joinDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  // 1. Sync directly to MySQL Customer table if available
  try {
    const existingCust = await prisma.customer.findUnique({ where: { email: normalizedEmail } });
    if (existingCust && existingCust.status === 'Suspended') {
      return; // Do not overwrite or reactivate suspended account
    }

    await prisma.customer.upsert({
      where: { email: normalizedEmail },
      update: {
        name: user.name,
        phone: user.phone ?? undefined,
        password: user.password ?? undefined,
      },
      create: {
        name: user.name,
        email: normalizedEmail,
        phone: user.phone || null,
        password: user.password || null,
        role: 'Customer',
        status: 'Active',
        joinDate,
        bookingCount: 0,
      },
    });
  } catch {
    // Non-blocking fallback if Customer table is not yet migrated
  }

  // 2. Dynamic API sync to CineStar Admin Suite backend
  try {
    const adminApiUrl = process.env.ADMIN_API_URL || 'http://localhost:5000/api/customers/register';
    fetch(adminApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        email: normalizedEmail,
        phone: user.phone || '',
        password: user.password || undefined,
      }),
    }).catch(() => {});
  } catch {}
}

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body as {
    name: string;
    email: string;
    password: string;
    phone?: string;
  };

  const normalizedEmail = email.toLowerCase();

  // Check if disabled/suspended in Customer table
  try {
    const cust = await prisma.customer.findUnique({ where: { email: normalizedEmail } });
    if (cust && cust.status === 'Suspended') {
      res.status(403).json({
        message: 'This account has been disabled by an administrator. Please contact support.',
      });
      return;
    }
  } catch {}

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashedPassword, phone: phone ?? null },
  });

  // Sync dynamically to Customer database & admin suite API
  syncCustomerToDatabaseAndAdminSuite({
    name: user.name,
    email: user.email,
    phone: user.phone,
    password,
  });

  res.status(201).json({ message: 'Account created successfully.', user: toPublicUser(user) });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const normalizedEmail = email.toLowerCase();

  // Check if customer account is disabled/suspended in Customer table
  try {
    const cust = await prisma.customer.findUnique({ where: { email: normalizedEmail } });
    if (cust && cust.status === 'Suspended') {
      res.status(403).json({
        message: 'Your account has been disabled by an administrator. Please contact support.',
      });
      return;
    }
  } catch {}

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: normalizedEmail }, { name: email }] },
  });
  if (!user) {
    res.status(401).json({ message: 'Invalid email/username or password.' });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    res.status(401).json({ message: 'Invalid email/username or password.' });
    return;
  }

  // Sync dynamically to Customer database & admin suite API
  syncCustomerToDatabaseAndAdminSuite({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  const token = signToken({ id: user.id, email: user.email });
  res.json({ message: 'Login successful.', token, user: toPublicUser(user) });
};
