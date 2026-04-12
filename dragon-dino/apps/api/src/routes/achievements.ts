import { Router, type Request, type Response } from 'express';
import { auth as authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const achievements = await prisma.achievement.findMany({
    orderBy: { slug: 'asc' },
  });
  res.json({ data: achievements });
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const userId = (req as Record<string, unknown>).userId as string;
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' },
  });
  res.json({ data: userAchievements });
});

export default router;
