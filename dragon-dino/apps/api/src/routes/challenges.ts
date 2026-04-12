import { Router, type Request, type Response } from 'express';
import { validate } from '../middleware/validate.js';
import { auth as authenticate } from '../middleware/auth.js';
import { createChallengeSchema, challengeSubmissionSchema } from '@dragon-dino/shared';
import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

const router = Router();

router.get('/daily', async (_req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daily = await prisma.dailyChallenge.findUnique({ where: { date: today } });
  if (!daily) {
    daily = await prisma.dailyChallenge.create({
      data: {
        date: today,
        seed: crypto.randomBytes(8).toString('hex'),
        targetScore: 100 + Math.floor(Math.random() * 400),
      },
    });
  }
  res.json({ data: daily });
});

router.post('/', authenticate, validate(createChallengeSchema), async (req: Request, res: Response) => {
  const userId = (req as Record<string, unknown>).userId as string;
  const challenge = await prisma.challenge.create({
    data: {
      creatorId: userId,
      seed: crypto.randomBytes(8).toString('hex'),
      targetScore: req.body.targetScore,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  res.status(201).json({ data: challenge });
});

router.get('/:token', async (req: Request, res: Response) => {
  const challenge = await prisma.challenge.findUnique({
    where: { shareToken: req.params.token },
    include: {
      creator: { select: { id: true, username: true, avatarUrl: true } },
      submissions: {
        orderBy: { score: 'desc' },
        take: 10,
      },
    },
  });
  if (!challenge) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Challenge not found', requestId: (req as Record<string, unknown>).id } });
    return;
  }
  res.json({ data: challenge });
});

router.post('/:token/submit', authenticate, validate(challengeSubmissionSchema), async (req: Request, res: Response) => {
  const userId = (req as Record<string, unknown>).userId as string;
  const challenge = await prisma.challenge.findUnique({ where: { shareToken: req.params.token } });

  if (!challenge) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Challenge not found', requestId: (req as Record<string, unknown>).id } });
    return;
  }

  if (new Date() > challenge.expiresAt) {
    res.status(410).json({ error: { code: 'EXPIRED', message: 'Challenge has expired', requestId: (req as Record<string, unknown>).id } });
    return;
  }

  const submission = await prisma.challengeSubmission.upsert({
    where: { challengeId_userId: { challengeId: challenge.id, userId } },
    update: { score: Math.max(req.body.score, 0) },
    create: { challengeId: challenge.id, userId, score: req.body.score },
  });

  res.json({ data: submission });
});

export default router;
