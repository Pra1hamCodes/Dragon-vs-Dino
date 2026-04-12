import { Server, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger.js';
import { handleRaceRoom } from './raceRoom.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export function setupSocketHandlers(io: Server): void {
  // Auth middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    try {
      const secret = process.env.JWT_PUBLIC_KEY ?? process.env.JWT_ACCESS_SECRET ?? 'dev-secret';
      const algorithm = process.env.JWT_PUBLIC_KEY ? 'RS256' : 'HS256';
      const payload = jwt.verify(token, secret, { algorithms: [algorithm] }) as {
        sub: string;
        username: string;
      };
      socket.userId = payload.sub;
      socket.username = payload.username;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.userId}`);

    handleRaceRoom(io, socket);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
    });
  });
}
