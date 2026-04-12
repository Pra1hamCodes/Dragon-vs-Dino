import { redis } from '../lib/redis.js';
import { prisma } from '../lib/prisma.js';
import type { LeaderboardPeriod } from '@dragon-dino/shared';

function getLeaderboardKey(period: LeaderboardPeriod): string {
  return `leaderboard:${period}`;
}

export async function getLeaderboard(period: LeaderboardPeriod, limit: number, offset: number) {
  const key = getLeaderboardKey(period);

  // Try Redis first
  const entries = await redis.zRangeWithScores(key, offset, offset + limit - 1, { REV: true });

  if (entries.length > 0) {
    const userIds = entries.map((e) => e.value);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return entries.map((entry, i) => {
      const user = userMap.get(entry.value);
      return {
        rank: offset + i + 1,
        userId: entry.value,
        username: user?.username ?? 'Unknown',
        avatarUrl: user?.avatarUrl ?? null,
        score: entry.score,
        createdAt: new Date().toISOString(),
      };
    });
  }

  // Fallback to DB
  const now = new Date();
  let dateFilter: Date | undefined;

  if (period === 'daily') {
    dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'weekly') {
    const dayOfWeek = now.getDay();
    dateFilter = new Date(now);
    dateFilter.setDate(now.getDate() - dayOfWeek);
    dateFilter.setHours(0, 0, 0, 0);
  }

  const scores = await prisma.score.findMany({
    where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
    orderBy: { value: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
    },
    distinct: ['userId'],
  });

  return scores.map((s, i) => ({
    rank: offset + i + 1,
    userId: s.userId,
    username: s.user.username,
    avatarUrl: s.user.avatarUrl,
    score: s.value,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function getUserRank(userId: string, period: LeaderboardPeriod): Promise<number | null> {
  const key = getLeaderboardKey(period);
  const rank = await redis.zRevRank(key, userId);
  return rank !== null ? rank + 1 : null;
}

export async function resetDailyLeaderboard(): Promise<void> {
  await redis.del('leaderboard:daily');
}

export async function resetWeeklyLeaderboard(): Promise<void> {
  await redis.del('leaderboard:weekly');
}
