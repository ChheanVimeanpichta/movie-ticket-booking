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

  const token = signToken({ id: user.id, email: user.email });
  res.json({ message: 'Login successful.', token, user: toPublicUser(user) });
};
