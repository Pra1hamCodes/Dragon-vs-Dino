import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
});

// Score schemas
export const scoreSubmissionSchema = z.object({
  value: z.number().int().min(0).max(999999),
  distance: z.number().min(0),
  coinsCollected: z.number().int().min(0),
  powerupsUsed: z.number().int().min(0),
  duration: z.number().int().min(0),
  inputHash: z.string().min(1),
  inputLog: z.array(
    z.object({
      type: z.enum(['jump', 'left', 'right', 'down']),
      timestamp: z.number(),
      frameId: z.number().int(),
    })
  ),
  sessionToken: z.string().min(1),
});

export const leaderboardQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'alltime']).default('daily'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// User schemas
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  avatarUrl: z.string().url().optional(),
});

export const equipSkinSchema = z.object({
  skinId: z.string().min(1),
});

// Challenge schemas
export const createChallengeSchema = z.object({
  targetScore: z.number().int().min(1),
});

export const challengeSubmissionSchema = z.object({
  score: z.number().int().min(0),
});

// Multiplayer schemas
export const createRoomSchema = z.object({
  maxPlayers: z.number().int().min(2).max(4).default(4),
});

// Pagination helper
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Type exports from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ScoreSubmissionInput = z.infer<typeof scoreSubmissionSchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
