import { Server, type Socket } from 'socket.io';
import * as multiplayerService from '../services/multiplayerService.js';
import { logger } from '../lib/logger.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export function handleRaceRoom(io: Server, socket: AuthenticatedSocket): void {
  socket.on('room:join', async (data: { roomId: string }) => {
    if (!socket.userId || !socket.username) return;

    const room = await multiplayerService.joinRoom(data.roomId, {
      userId: socket.userId,
      username: socket.username,
      avatarUrl: null,
    });

    if (!room) {
      socket.emit('error', { message: 'Could not join room' });
      return;
    }

    socket.join(`room:${data.roomId}`);
    io.to(`room:${data.roomId}`).emit('room:state', {
      players: room.players,
      status: room.status,
      seed: room.seed,
      countdownAt: null,
    });

    logger.info(`Player ${socket.userId} joined room ${data.roomId}`);
  });

  socket.on('room:ready', async () => {
    if (!socket.userId) return;

    const rooms = Array.from(socket.rooms).filter((r) => r.startsWith('room:'));
    if (rooms.length === 0) return;

    const roomId = rooms[0]!.replace('room:', '');
    const room = await multiplayerService.setPlayerReady(roomId, socket.userId);
    if (!room) return;

    io.to(`room:${roomId}`).emit('room:state', {
      players: room.players,
      status: room.status,
      seed: room.seed,
      countdownAt: room.status === 'countdown' ? new Date(Date.now() + 3000).toISOString() : null,
    });

    if (room.status === 'countdown') {
      setTimeout(() => {
        io.to(`room:${roomId}`).emit('room:start', {
          seed: room.seed,
          startAt: new Date().toISOString(),
        });
      }, 3000);
    }
  });

  socket.on('game:alive', async (data: { score: number; x: number; y: number; timestamp: number }) => {
    if (!socket.userId) return;

    const rooms = Array.from(socket.rooms).filter((r) => r.startsWith('room:'));
    if (rooms.length === 0) return;

    const roomId = rooms[0]!.replace('room:', '');
    await multiplayerService.updatePlayerScore(roomId, socket.userId, data.score);

    socket.to(`room:${roomId}`).emit('player:update', {
      userId: socket.userId,
      score: data.score,
      x: data.x,
      y: data.y,
    });
  });

  socket.on('game:input', (data: { type: string; timestamp: number; frameId: number }) => {
    const rooms = Array.from(socket.rooms).filter((r) => r.startsWith('room:'));
    if (rooms.length === 0) return;

    const roomId = rooms[0]!.replace('room:', '');
    socket.to(`room:${roomId}`).emit('ghost:frame', {
      userId: socket.userId,
      x: 0,
      y: 0,
      animState: data.type,
    });
  });

  socket.on('game:died', async (data: { score: number; finalX: number }) => {
    if (!socket.userId) return;

    const rooms = Array.from(socket.rooms).filter((r) => r.startsWith('room:'));
    if (rooms.length === 0) return;

    const roomId = rooms[0]!.replace('room:', '');
    const { room, rank } = await multiplayerService.playerDied(roomId, socket.userId, data.score);

    io.to(`room:${roomId}`).emit('player:died', {
      userId: socket.userId,
      finalScore: data.score,
      rank,
    });

    if (room.status === 'finished') {
      const rankings = room.players
        .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
        .map((p) => ({ userId: p.userId, score: p.score, rank: p.rank ?? 0 }));
      io.to(`room:${roomId}`).emit('race:end', { rankings });
    }
  });
}
