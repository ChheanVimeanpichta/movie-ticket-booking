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

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findAdminSuiteCustFile(): string {
  const possible = [
    path.resolve(__dirname, '../../../../cinestar-admin-suite/admin-backend/data/customers.json'),
    path.resolve(__dirname, '../../../../../cinestar-admin-suite/admin-backend/data/customers.json'),
    path.resolve(process.cwd(), '../cinestar-admin-suite/admin-backend/data/customers.json'),
    path.resolve(process.cwd(), '../../cinestar-admin-suite/admin-backend/data/customers.json'),
    'E:/Project_Management/cinestar-admin-suite/admin-backend/data/customers.json',
  ];
  for (const p of possible) {
    if (fs.existsSync(p)) return p;
  }
  return 'E:/Project_Management/cinestar-admin-suite/admin-backend/data/customers.json';
}

function syncCustomerToAdminSuite(user: { id?: string; name: string; email: string; phone?: string | null }) {
  try {
    const adminSuiteCustFile = findAdminSuiteCustFile();
    const dir = path.dirname(adminSuiteCustFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let list: any[] = [];
    if (fs.existsSync(adminSuiteCustFile)) {
      const raw = fs.readFileSync(adminSuiteCustFile, 'utf-8').trim().replace(/^\uFEFF/, '');
      if (raw) list = JSON.parse(raw);
    }
    const existingIdx = list.findIndex((c: any) => c.email.toLowerCase() === user.email.toLowerCase());
    const joinDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    if (existingIdx >= 0) {
      list[existingIdx].name = user.name || list[existingIdx].name;
      if (user.phone) list[existingIdx].phone = user.phone;
    } else {
      list.unshift({
        id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: user.name,
        email: user.email.toLowerCase(),
        phone: user.phone || '',
        role: 'Customer',
        status: 'Active',
        joinDate,
        bookingCount: 0,
        createdAt: new Date().toISOString(),
      });
    }
    fs.writeFileSync(adminSuiteCustFile, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    // Non-blocking fallback
  }

  try {
    fetch('http://localhost:5000/api/customers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        email: user.email.toLowerCase(),
        phone: user.phone || '',
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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, phone: phone ?? null },
  });

  syncCustomerToAdminSuite(user);

  res.status(201).json({ message: 'Account created successfully.', user: toPublicUser(user) });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findFirst({
    where: { OR: [{ email }, { name: email }] },
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

  syncCustomerToAdminSuite(user);

  const token = signToken({ id: user.id, email: user.email });
  res.json({ message: 'Login successful.', token, user: toPublicUser(user) });
};
