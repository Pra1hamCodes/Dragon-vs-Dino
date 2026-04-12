import { Router, type Request, type Response } from 'express';
import { validate } from '../middleware/validate.js';
import { auth as authenticate } from '../middleware/auth.js';
import { updateProfileSchema, equipSkinSchema } from '@dragon-dino/shared';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/:username', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: {
      id: true, username: true, avatarUrl: true, xp: true, rank: true,
      currentSkinId: true, createdAt: true,
      _count: { select: { scores: true, achievements: true } },
    },
  });
  if (!user) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found', requestId: (req as Record<string, unknown>).id } });
    return;
  }
  res.json({ data: user });
});

router.patch('/me', authenticate, validate(updateProfileSchema), async (req: Request, res: Response) => {
  const userId = (req as Record<string, unknown>).userId as string;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: req.body,
      select: { id: true, username: true, avatarUrl: true, email: true },
    });
    res.json({ data: user });
  } catch (err) {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'Username already taken', requestId: (req as Record<string, unknown>).id } });
  }
});

router.post('/me/skin', authenticate, validate(equipSkinSchema), async (req: Request, res: Response) => {
  const userId = (req as Record<string, unknown>).userId as string;
  const { skinId } = req.body;

  const owned = await prisma.userSkin.findUnique({
    where: { userId_skinId: { userId, skinId } },
  });
  if (!owned) {
    res.status(403).json({ error: { code: 'NOT_OWNED', message: 'You do not own this skin', requestId: (req as Record<string, unknown>).id } });
    return;
  }

  await prisma.user.update({ where: { id: userId }, data: { currentSkinId: skinId } });
  res.json({ data: { skinId } });
});

router.get('/me/skins', authenticate, async (req: Request, res: Response) => {
  const userId = (req as Record<string, unknown>).userId as string;
  const skins = await prisma.userSkin.findMany({
    where: { userId },
    include: { skin: true },
  });
  res.json({ data: skins });
});

export default router;
