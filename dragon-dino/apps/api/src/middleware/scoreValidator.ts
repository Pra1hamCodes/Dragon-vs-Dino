import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { logger } from "../lib/logger.js";

const MAX_SCORE_RATE = 150;
const DISTANCE_SCORE_RATIO_TOLERANCE = 0.15;
const EXPECTED_DISTANCE_PER_SCORE = 0.8;

interface ScoreSubmissionBody {
  value: number;
  distance: number;
  duration: number;
  inputHash: string;
  seed: string;
  coinsCollected: number;
  powerupsUsed: number;
  sessionToken: string;
  gameVersion: string;
}

function verifyInputHash(body: ScoreSubmissionBody): boolean {
  const payload = `${body.seed}:${body.value}:${body.distance}:${body.duration}:${body.coinsCollected}`;
  const secret = process.env["SCORE_HASH_SECRET"] ?? "default-secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(body.inputHash)
  );
}

function verifySessionToken(sessionToken: string): boolean {
  if (!sessionToken || sessionToken.length < 16) {
    return false;
  }
  const secret = process.env["SESSION_TOKEN_SECRET"] ?? "default-session-secret";
  const parts = sessionToken.split(".");
  if (parts.length !== 2) {
    return false;
  }
  const [payload, signature] = parts;
  if (!payload || !signature) {
    return false;
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

export function scoreValidator(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as ScoreSubmissionBody;

  if (!body.value || !body.distance || !body.duration) {
    res.status(400).json({ error: "Missing required score fields" });
    return;
  }

  const scoreRate = body.value / (body.duration / 1000);
  if (scoreRate > MAX_SCORE_RATE) {
    logger.warn("Score rate exceeds maximum", {
      scoreRate,
      maxRate: MAX_SCORE_RATE,
      userId: (req as Record<string, unknown>)["user"],
    });
    res.status(422).json({ error: "Score rejected: implausible score rate" });
    return;
  }

  const expectedDistance = body.value * EXPECTED_DISTANCE_PER_SCORE;
  const distanceRatio = body.distance / expectedDistance;
  if (
    distanceRatio < 1 - DISTANCE_SCORE_RATIO_TOLERANCE ||
    distanceRatio > 1 + DISTANCE_SCORE_RATIO_TOLERANCE
  ) {
    logger.warn("Distance/score ratio out of bounds", {
      distance: body.distance,
      score: body.value,
      ratio: distanceRatio,
    });
    res.status(422).json({ error: "Score rejected: distance/score mismatch" });
    return;
  }

  if (!verifyInputHash(body)) {
    logger.warn("Input hash verification failed", {
      inputHash: body.inputHash,
    });
    res.status(422).json({ error: "Score rejected: invalid input hash" });
    return;
  }

  if (!verifySessionToken(body.sessionToken)) {
    logger.warn("Session token verification failed");
    res.status(422).json({ error: "Score rejected: invalid session" });
    return;
  }

  next();
}
