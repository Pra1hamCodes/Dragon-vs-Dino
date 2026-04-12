import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed achievements
  const achievements = [
    { slug: 'first-run', title: 'First Steps', description: 'Complete your first run', iconUrl: '/icons/first-run.png', xpReward: 10, coinReward: 5, rarity: 'common' },
    { slug: 'score-100', title: 'Getting Started', description: 'Reach a score of 100', iconUrl: '/icons/score-100.png', xpReward: 25, coinReward: 10, rarity: 'common' },
    { slug: 'score-500', title: 'Dragon Dodger', description: 'Reach a score of 500', iconUrl: '/icons/score-500.png', xpReward: 50, coinReward: 25, rarity: 'rare' },
    { slug: 'score-1000', title: 'Dino Champion', description: 'Reach a score of 1000', iconUrl: '/icons/score-1000.png', xpReward: 100, coinReward: 50, rarity: 'rare' },
    { slug: 'score-5000', title: 'Legendary Runner', description: 'Reach a score of 5000', iconUrl: '/icons/score-5000.png', xpReward: 500, coinReward: 200, rarity: 'legendary' },
    { slug: 'marathon', title: 'Marathon Runner', description: 'Run 10,000 meters in a single run', iconUrl: '/icons/marathon.png', xpReward: 200, coinReward: 100, rarity: 'epic' },
    { slug: 'coin-collector', title: 'Coin Collector', description: 'Collect 50 coins in a single run', iconUrl: '/icons/coins.png', xpReward: 30, coinReward: 15, rarity: 'common' },
    { slug: 'coin-hoarder', title: 'Coin Hoarder', description: 'Collect 200 coins in a single run', iconUrl: '/icons/hoarder.png', xpReward: 100, coinReward: 50, rarity: 'epic' },
    { slug: 'powerup-master', title: 'Power Up Master', description: 'Use 5 power-ups in a single run', iconUrl: '/icons/powerup.png', xpReward: 40, coinReward: 20, rarity: 'rare' },
    { slug: 'speed-demon', title: 'Speed Demon', description: 'Score 100+ in under 60 seconds', iconUrl: '/icons/speed.png', xpReward: 75, coinReward: 40, rarity: 'rare' },
    { slug: 'veteran', title: 'Veteran', description: 'Complete 100 runs', iconUrl: '/icons/veteran.png', xpReward: 300, coinReward: 150, rarity: 'epic' },
    { slug: 'distance-traveler', title: 'World Traveler', description: 'Run 50,000 meters total', iconUrl: '/icons/traveler.png', xpReward: 250, coinReward: 100, rarity: 'epic' },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    });
  }
  console.log(`Seeded ${achievements.length} achievements`);

  // Seed default skins
  const skins = [
    { slug: 'default-green', name: 'Classic Green', description: 'The original green dino', previewUrl: '/skins/default.png', modelUrl: '/models/dino-green.glb', rarity: 'common', price: 0, premiumPrice: 0, isDefault: true },
    { slug: 'fire-red', name: 'Fire Red', description: 'A fiery red dino', previewUrl: '/skins/fire-red.png', modelUrl: '/models/dino-red.glb', rarity: 'rare', price: 100, premiumPrice: 0 },
    { slug: 'ice-blue', name: 'Ice Blue', description: 'A frosty blue dino', previewUrl: '/skins/ice-blue.png', modelUrl: '/models/dino-blue.glb', rarity: 'rare', price: 100, premiumPrice: 0 },
    { slug: 'golden', name: 'Golden Legend', description: 'A dino made of pure gold', previewUrl: '/skins/golden.png', modelUrl: '/models/dino-gold.glb', rarity: 'legendary', price: 500, premiumPrice: 50 },
    { slug: 'shadow', name: 'Shadow Walker', description: 'A dino cloaked in darkness', previewUrl: '/skins/shadow.png', modelUrl: '/models/dino-shadow.glb', rarity: 'epic', price: 300, premiumPrice: 30 },
  ];

  for (const s of skins) {
    await prisma.skin.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`Seeded ${skins.length} skins`);

  // Seed Season 1
  const season = await prisma.season.upsert({
    where: { number: 1 },
    update: {},
    create: {
      name: 'Season of Fire',
      number: 1,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-05-31'),
      isActive: true,
    },
  });

  const tiers = Array.from({ length: 10 }, (_, i) => ({
    seasonId: season.id,
    tier: i + 1,
    xpRequired: (i + 1) * 500,
    isPremium: i >= 5,
    rewardType: i % 3 === 0 ? 'coins' : i % 3 === 1 ? 'premium_coins' : 'coins',
    rewardAmount: (i + 1) * 50,
  }));

  for (const t of tiers) {
    await prisma.seasonTier.create({ data: t });
  }
  console.log(`Seeded season with ${tiers.length} tiers`);

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
