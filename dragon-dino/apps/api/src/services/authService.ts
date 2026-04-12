import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

interface TokenPayload {
  sub: string;
  email: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_PRIVATE_KEY ?? process.env.JWT_ACCESS_SECRET ?? 'dev-secret';
  return jwt.sign(payload, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: process.env.JWT_PRIVATE_KEY ? 'RS256' : 'HS256',
  });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function storeRefreshToken(userId: string, token: string, family: string): Promise<void> {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const key = `refresh:${hashed}`;
  await redis.set(
    key,
    JSON.stringify({ userId, family, createdAt: Date.now() }),
    { EX: REFRESH_TOKEN_EXPIRY_SECONDS }
  );
  // Track token family
  await redis.sAdd(`refresh_family:${family}`, hashed);
  await redis.expire(`refresh_family:${family}`, REFRESH_TOKEN_EXPIRY_SECONDS);
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const data = await redis.get(`refresh:${hashed}`);
  if (data) {
    const parsed = JSON.parse(data);
    await redis.del(`refresh:${hashed}`);
    // Keep family reference for reuse detection
  }
}

export async function revokeTokenFamily(family: string): Promise<void> {
  const members = await redis.sMembers(`refresh_family:${family}`);
  if (members.length > 0) {
    await redis.del(...members.map((m) => `refresh:${m}`));
  }
  await redis.del(`refresh_family:${family}`);
}

export async function validateRefreshToken(token: string): Promise<{ userId: string; family: string } | null> {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const data = await redis.get(`refresh:${hashed}`);
  if (!data) return null;

  const parsed = JSON.parse(data) as { userId: string; family: string };
  return parsed;
}

export async function register(email: string, username: string, password: string) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, username, passwordHash, provider: 'email' },
  });

  const family = crypto.randomUUID();
  const accessToken = generateAccessToken({ sub: user.id, email: user.email, username: user.username });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(user.id, refreshToken, family);

  return { user, accessToken, refreshToken, family };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  const family = crypto.randomUUID();
  const accessToken = generateAccessToken({ sub: user.id, email: user.email, username: user.username });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(user.id, refreshToken, family);

  return { user, accessToken, refreshToken, family };
}

export async function refreshTokens(oldRefreshToken: string) {
  const tokenData = await validateRefreshToken(oldRefreshToken);
  if (!tokenData) return null;

  // Revoke old token
  await revokeRefreshToken(oldRefreshToken);

  const user = await prisma.user.findUnique({ where: { id: tokenData.userId } });
  if (!user) return null;

  const accessToken = generateAccessToken({ sub: user.id, email: user.email, username: user.username });
  const newRefreshToken = generateRefreshToken();
  await storeRefreshToken(user.id, newRefreshToken, tokenData.family);

  return { user, accessToken, refreshToken: newRefreshToken };
}
