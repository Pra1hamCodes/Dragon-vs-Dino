import { Router, type Request, type Response } from 'express';
import { validate } from '../middleware/validate.js';
import { auth as authenticate } from '../middleware/auth.js';
import { scoreLimiter } from '../middleware/rateLimiter.js';
import { scoreValidator } from '../middleware/scoreValidator.js';
import { scoreSubmissionSchema, leaderboardQuerySchema } from '@dragon-dino/shared';
import * as scoreService from '../services/scoreService.js';
import * as leaderboardService from '../services/leaderboardService.js';
import * as achievementService from '../services/achievementService.js';

const router = Router();

router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const query = leaderboardQuerySchema.parse(req.query);
    const entries = await leaderboardService.getLeaderboard(query.period, query.limit, query.offset);
    res.json({ data: entries, meta: { limit: query.limit, offset: query.offset } });
  } catch (err) {
    res.status(400).json({ error: { code: 'INVALID_QUERY', message: 'Invalid query parameters', requestId: (req as Record<string, unknown>).id } });
  }
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const userId = (req as Record<string, unknown>).userId as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const { scores, total } = await scoreService.getUserScores(userId, limit, offset);
  res.json({ data: scores, meta: { total, limit, offset } });
});

router.post('/', authenticate, scoreLimiter, validate(scoreSubmissionSchema), scoreValidator, async (req: Request, res: Response) => {
  try {
    const userId = (req as Record<string, unknown>).userId as string;
    const score = await scoreService.submitScore(userId, req.body);

    // Check achievements asynchronously
    const achievements = await achievementService.checkAndAwardAchievements(userId, {
      value: req.body.value,
      distance: req.body.distance,
      coinsCollected: req.body.coinsCollected,
      powerupsUsed: req.body.powerupsUsed,
      duration: req.body.duration,
    });

    res.status(201).json({ data: { score, achievements } });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL', message: 'Score submission failed', requestId: (req as Record<string, unknown>).id } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const score = await scoreService.getScoreById(req.params.id);
  if (!score) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Score not found', requestId: (req as Record<string, unknown>).id } });
    return;
  }
  res.json({ data: score });
});

export default router;
