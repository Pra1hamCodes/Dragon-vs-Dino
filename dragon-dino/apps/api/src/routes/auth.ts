import { Router, type Request, type Response } from 'express';
import { validate } from '../middleware/validate.js';
import { auth as authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from '@dragon-dino/shared';
import * as authService from '../services/authService.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      res.status(409).json({ error: { code: 'CONFLICT', message: 'Email or username already taken', requestId: (req as Record<string, unknown>).id } });
      return;
    }

    const { user, accessToken, refreshToken } = await authService.register(email, username, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      data: {
        accessToken,
        expiresIn: 900,
        user: { id: user.id, email: user.email, username: user.username, avatarUrl: user.avatarUrl },
      },
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL', message: 'Registration failed', requestId: (req as Record<string, unknown>).id } });
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    if (!result) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', requestId: (req as Record<string, unknown>).id } });
      return;
    }

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      data: {
        accessToken: result.accessToken,
        expiresIn: 900,
        user: { id: result.user.id, email: result.user.email, username: result.user.username, avatarUrl: result.user.avatarUrl },
      },
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL', message: 'Login failed', requestId: (req as Record<string, unknown>).id } });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await authService.revokeRefreshToken(token);
  }
  res.clearCookie('refreshToken');
  res.json({ data: { message: 'Logged out' } });
});

router.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No refresh token', requestId: (req as Record<string, unknown>).id } });
    return;
  }

  const result = await authService.refreshTokens(token);
  if (!result) {
    res.clearCookie('refreshToken');
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token', requestId: (req as Record<string, unknown>).id } });
    return;
  }

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ data: { accessToken: result.accessToken, expiresIn: 900 } });
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const userId = (req as Record<string, unknown>).userId as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, username: true, avatarUrl: true,
      xp: true, rank: true, coins: true, premiumCoins: true, currentSkinId: true,
      createdAt: true,
    },
  });
  if (!user) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found', requestId: (req as Record<string, unknown>).id } });
    return;
  }
  res.json({ data: user });
});

export default router;
