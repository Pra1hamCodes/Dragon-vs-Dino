import crypto from 'crypto';
import { redis } from '../lib/redis.js';

interface Room {
  id: string;
  players: RoomPlayer[];
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  seed: string;
  maxPlayers: number;
  createdAt: string;
}

interface RoomPlayer {
  userId: string;
  username: string;
  avatarUrl: string | null;
  ready: boolean;
  score: number;
  alive: boolean;
  rank: number | null;
}

const ROOM_TTL = 60 * 30; // 30 minutes

export async function createRoom(maxPlayers: number): Promise<Room> {
  const room: Room = {
    id: crypto.randomBytes(4).toString('hex').toUpperCase(),
    players: [],
    status: 'waiting',
    seed: crypto.randomBytes(8).toString('hex'),
    maxPlayers,
    createdAt: new Date().toISOString(),
  };

  await redis.set(`room:${room.id}`, JSON.stringify(room), { EX: ROOM_TTL });
  return room;
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const data = await redis.get(`room:${roomId}`);
  if (!data) return null;
  return JSON.parse(data);
}

export async function joinRoom(roomId: string, player: Omit<RoomPlayer, 'ready' | 'score' | 'alive' | 'rank'>): Promise<Room | null> {
  const room = await getRoom(roomId);
  if (!room || room.status !== 'waiting') return null;
  if (room.players.length >= room.maxPlayers) return null;
  if (room.players.some((p) => p.userId === player.userId)) return room;

  room.players.push({
    ...player,
    ready: false,
    score: 0,
    alive: true,
    rank: null,
  });

  await redis.set(`room:${roomId}`, JSON.stringify(room), { EX: ROOM_TTL });
  return room;
}

export async function setPlayerReady(roomId: string, userId: string): Promise<Room | null> {
  const room = await getRoom(roomId);
  if (!room) return null;

  const player = room.players.find((p) => p.userId === userId);
  if (player) player.ready = true;

  const allReady = room.players.length >= 2 && room.players.every((p) => p.ready);
  if (allReady) {
    room.status = 'countdown';
  }

  await redis.set(`room:${roomId}`, JSON.stringify(room), { EX: ROOM_TTL });
  return room;
}

export async function updatePlayerScore(roomId: string, userId: string, score: number): Promise<void> {
  const room = await getRoom(roomId);
  if (!room) return;

  const player = room.players.find((p) => p.userId === userId);
  if (player) player.score = score;

  await redis.set(`room:${roomId}`, JSON.stringify(room), { EX: ROOM_TTL });
}

export async function playerDied(roomId: string, userId: string, finalScore: number): Promise<{ room: Room; rank: number }> {
  const room = await getRoom(roomId);
  if (!room) throw new Error('Room not found');

  const player = room.players.find((p) => p.userId === userId);
  if (player) {
    player.alive = false;
    player.score = finalScore;
  }

  const deadCount = room.players.filter((p) => !p.alive).length;
  const rank = room.players.length - deadCount + 1;
  if (player) player.rank = rank;

  const allDead = room.players.every((p) => !p.alive);
  if (allDead) {
    room.status = 'finished';
    // Sort by score descending and assign final ranks
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    sorted.forEach((p, i) => {
      const rp = room.players.find((rp) => rp.userId === p.userId);
      if (rp) rp.rank = i + 1;
    });
  }

  await redis.set(`room:${roomId}`, JSON.stringify(room), { EX: ROOM_TTL });
  return { room, rank };
}
