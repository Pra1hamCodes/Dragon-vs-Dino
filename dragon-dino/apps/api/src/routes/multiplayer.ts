import { Router, type Request, type Response } from 'express';
import { validate } from '../middleware/validate.js';
import { auth as authenticate } from '../middleware/auth.js';
import { createRoomSchema } from '@dragon-dino/shared';
import * as multiplayerService from '../services/multiplayerService.js';

const router = Router();

router.post('/rooms', authenticate, validate(createRoomSchema), async (req: Request, res: Response) => {
  const room = await multiplayerService.createRoom(req.body.maxPlayers ?? 4);
  res.status(201).json({ data: room });
});

router.get('/rooms/:id', async (req: Request, res: Response) => {
  const room = await multiplayerService.getRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Room not found', requestId: (req as Record<string, unknown>).id } });
    return;
  }
  res.json({ data: room });
});

export default router;
