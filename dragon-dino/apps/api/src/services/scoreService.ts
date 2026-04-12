import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import type { ScoreSubmissionInput } from '@dragon-dino/shared';

export async function submitScore(userId: string, data: ScoreSubmissionInput) {
  const score = await prisma.score.create({
    data: {
      userId,
      value: data.value,
      distance: data.distance,
      coinsCollected: data.coinsCollected,
      powerupsUsed: data.powerupsUsed,
      duration: data.duration,
      inputHash: data.inputHash,
      gameVersion: process.env.GAME_VERSION ?? '1.0.0',
      verified: false,
    },
  });

  // Store replay data
  await prisma.replay.create({
    data: {
      userId,
      scoreId: score.id,
      inputLog: data.inputLog as unknown as Record<string, unknown>[],
      duration: data.duration,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Update Redis leaderboards
  await Promise.all([
    redis.zAdd('leaderboard:alltime', { score: data.value, value: userId }),
    redis.zAdd('leaderboard:daily', { score: data.value, value: userId }),
    redis.zAdd('leaderboard:weekly', { score: data.value, value: userId }),
  ]);

  // Award XP and coins
  const xpGain = Math.floor(data.value * 0.5);
  const coinGain = data.coinsCollected;

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: xpGain },
      coins: { increment: coinGain },
    },
  });

  return score;
}

export async function getScoreById(scoreId: string) {
  return prisma.score.findUnique({
    where: { id: scoreId },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });
}

export async function getUserScores(userId: string, limit: number, offset: number) {
  const [scores, total] = await Promise.all([
    prisma.score.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.score.count({ where: { userId } }),
  ]);
  return { scores, total };
}
