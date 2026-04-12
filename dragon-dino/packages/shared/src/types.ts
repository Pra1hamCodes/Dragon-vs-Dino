// User types
export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  provider: 'email' | 'google' | 'github';
  xp: number;
  rank: number;
  coins: number;
  premiumCoins: number;
  currentSkinId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  xp: number;
  rank: number;
  currentSkinId: string | null;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

// Score types
export interface Score {
  id: string;
  userId: string;
  value: number;
  distance: number;
  coinsCollected: number;
  powerupsUsed: number;
  duration: number;
  gameVersion: string;
  verified: boolean;
  createdAt: string;
}

export interface ScoreSubmission {
  value: number;
  distance: number;
  coinsCollected: number;
  powerupsUsed: number;
  duration: number;
  inputHash: string;
  inputLog: InputEvent[];
  sessionToken: string;
}

export interface InputEvent {
  type: 'jump' | 'left' | 'right' | 'down';
  timestamp: number;
  frameId: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  createdAt: string;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'alltime';

// Achievement types
export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconUrl: string;
  xpReward: number;
  coinReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

// Skin types
export interface Skin {
  id: string;
  slug: string;
  name: string;
  description: string;
  previewUrl: string;
  modelUrl: string;
  rarity: string;
  price: number;
  premiumPrice: number;
  isDefault: boolean;
  seasonId: string | null;
}

// Season types
export interface Season {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SeasonTier {
  id: string;
  seasonId: string;
  tier: number;
  xpRequired: number;
  isPremium: boolean;
  rewardType: 'skin' | 'coins' | 'premium_coins' | 'title';
  rewardId: string | null;
  rewardAmount: number;
}

export interface SeasonProgress {
  userId: string;
  seasonId: string;
  xp: number;
  isPremium: boolean;
}

// Challenge types
export interface Challenge {
  id: string;
  creatorId: string;
  seed: string;
  targetScore: number;
  expiresAt: string;
  shareToken: string;
  createdAt: string;
}

// Multiplayer types
export interface MultiplayerRoom {
  id: string;
  players: RoomPlayer[];
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  seed: string;
  maxPlayers: number;
  createdAt: string;
}

export interface RoomPlayer {
  userId: string;
  username: string;
  avatarUrl: string | null;
  ready: boolean;
  score: number;
  alive: boolean;
  rank: number | null;
}

// Game state types
export interface GameState {
  status: 'idle' | 'countdown' | 'playing' | 'paused' | 'gameover';
  score: number;
  distance: number;
  lives: number;
  coins: number;
  speed: number;
  combo: number;
  activePowerups: ActivePowerup[];
  biome: number;
}

export interface ActivePowerup {
  type: PowerupType;
  remainingMs: number;
}

export type PowerupType = 'shield' | 'magnet' | 'doubleJump' | 'slowMo' | 'x2';

export type ObstacleType = 'flying' | 'low' | 'cluster' | 'boss' | 'platform';

// Socket events
export interface ServerToClientEvents {
  'room:state': (data: { players: RoomPlayer[]; status: string; seed: string; countdownAt: string | null }) => void;
  'room:start': (data: { seed: string; startAt: string }) => void;
  'player:update': (data: { userId: string; score: number; x: number; y: number }) => void;
  'player:died': (data: { userId: string; finalScore: number; rank: number }) => void;
  'race:end': (data: { rankings: Array<{ userId: string; score: number; rank: number }> }) => void;
  'ghost:frame': (data: { userId: string; x: number; y: number; animState: string }) => void;
}

export interface ClientToServerEvents {
  'room:join': (data: { roomId: string; token: string }) => void;
  'room:ready': () => void;
  'game:input': (data: { type: 'jump' | 'left' | 'right'; timestamp: number; frameId: number }) => void;
  'game:alive': (data: { score: number; x: number; y: number; timestamp: number }) => void;
  'game:died': (data: { score: number; finalX: number }) => void;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
