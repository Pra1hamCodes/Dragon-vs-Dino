import { Router, type Request, type Response } from 'express';
import { auth as authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/current', async (req: Request, res: Response) => {
  const season = await prisma.season.findFirst({
    where: { isActive: true },
    include: { tiers: { orderBy: { tier: 'asc' } } },
  });
  if (!season) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No active season', requestId: (req as Record<string, unknown>).id } });
    return;
  }
  res.json({ data: season });
});

router.get('/:id/tiers', async (req: Request, res: Response) => {
  const tiers = await prisma.seasonTier.findMany({
    where: { seasonId: req.params.id },
    orderBy: { tier: 'asc' },
  });
  res.json({ data: tiers });
});

router.post('/current/claim', authenticate, async (req: Request, res: Response) => {
  const userId = (req as Record<string, unknown>).userId as string;
  const { tierId } = req.body;

  const season = await prisma.season.findFirst({ where: { isActive: true } });
  if (!season) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No active season', requestId: (req as Record<string, unknown>).id } });
    return;
  }

  const progress = await prisma.seasonProgress.findUnique({
    where: { userId_seasonId: { userId, seasonId: season.id } },
  });

  const tier = await prisma.seasonTier.findUnique({ where: { id: tierId } });
  if (!tier || tier.seasonId !== season.id) {
    res.status(400).json({ error: { code: 'INVALID', message: 'Invalid tier', requestId: (req as Record<string, unknown>).id } });
    return;
  }

  if (!progress || progress.xp < tier.xpRequired) {
    res.status(403).json({ error: { code: 'INSUFFICIENT_XP', message: 'Not enough XP', requestId: (req as Record<string, unknown>).id } });
    return;
  }

  if (tier.isPremium && !progress.isPremium) {
    res.status(403).json({ error: { code: 'PREMIUM_REQUIRED', message: 'Premium pass required', requestId: (req as Record<string, unknown>).id } });
    return;
  }

  // Award reward
  if (tier.rewardType === 'coins') {
    await prisma.user.update({ where: { id: userId }, data: { coins: { increment: tier.rewardAmount } } });
  } else if (tier.rewardType === 'premium_coins') {
    await prisma.user.update({ where: { id: userId }, data: { premiumCoins: { increment: tier.rewardAmount } } });
  } else if (tier.rewardType === 'skin' && tier.rewardId) {
    await prisma.userSkin.upsert({
      where: { userId_skinId: { userId, skinId: tier.rewardId } },
      update: {},
      create: { userId, skinId: tier.rewardId },
    });
  }

  res.json({ data: { claimed: true, tier: tier.tier, rewardType: tier.rewardType } });
});

export default router;
