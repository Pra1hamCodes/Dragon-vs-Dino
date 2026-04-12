import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

interface ScoreData {
  value: number;
  distance: number;
  coinsCollected: number;
  powerupsUsed: number;
  duration: number;
}

const ACHIEVEMENT_CHECKS: Array<{
  slug: string;
  check: (score: ScoreData, totalScores: number, totalDistance: number) => boolean;
}> = [
  { slug: 'first-run', check: (_, total) => total >= 1 },
  { slug: 'score-100', check: (s) => s.value >= 100 },
  { slug: 'score-500', check: (s) => s.value >= 500 },
  { slug: 'score-1000', check: (s) => s.value >= 1000 },
  { slug: 'score-5000', check: (s) => s.value >= 5000 },
  { slug: 'marathon', check: (s) => s.distance >= 10000 },
  { slug: 'coin-collector', check: (s) => s.coinsCollected >= 50 },
  { slug: 'coin-hoarder', check: (s) => s.coinsCollected >= 200 },
  { slug: 'powerup-master', check: (s) => s.powerupsUsed >= 5 },
  { slug: 'speed-demon', check: (s) => s.value >= 100 && s.duration < 60000 },
  { slug: 'veteran', check: (_, total) => total >= 100 },
  { slug: 'distance-traveler', check: (_, __, totalDist) => totalDist >= 50000 },
];

export async function checkAndAwardAchievements(userId: string, scoreData: ScoreData) {
  const [totalScores, distanceResult, existingAchievements] = await Promise.all([
    prisma.score.count({ where: { userId } }),
    prisma.score.aggregate({ where: { userId }, _sum: { distance: true } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
  ]);

  const totalDistance = distanceResult._sum.distance ?? 0;
  const existingIds = new Set(existingAchievements.map((a) => a.achievementId));

  const allAchievements = await prisma.achievement.findMany();
  const achievementMap = new Map(allAchievements.map((a) => [a.slug, a]));

  const newlyUnlocked: Array<{ slug: string; title: string; rarity: string; xpReward: number; coinReward: number }> = [];

  for (const check of ACHIEVEMENT_CHECKS) {
    const achievement = achievementMap.get(check.slug);
    if (!achievement || existingIds.has(achievement.id)) continue;

    if (check.check(scoreData, totalScores, totalDistance)) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: achievement.xpReward },
          coins: { increment: achievement.coinReward },
        },
      });

      newlyUnlocked.push({
        slug: achievement.slug,
        title: achievement.title,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward,
        coinReward: achievement.coinReward,
      });

      logger.info(`Achievement unlocked: ${achievement.slug} for user ${userId}`);
    }
  }

  return newlyUnlocked;
}
